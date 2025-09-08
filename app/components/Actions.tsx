"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPool, getToken } from "@/lib/contracts";
import { toU64Units } from "@/lib/amount";
import { encryptU64, register as relayerRegister, relayerHealthy } from "@/lib/relayer";
import { getTokenDecimals } from "@/lib/tokenMeta";
import { getFaucetMax } from "@/lib/faucetLimit";
import { getSigner, getUserAddress } from "../lib/ethers";
import { useToast, toast } from "./Toast";

// Contract ABIs (simplified for demo - using standard uint256 for now)
const TOKEN_ABI = [
  "function faucet(uint64 amount) external",
  "function transfer(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function getLastError(address user) external view returns (uint8 code, uint256 timestamp)"
];

const POOL_ABI = [
  "function asset() external view returns (address)",
  "function deposit(uint256 amount) external",
  "function borrow(uint256 amount) external",
  "function repay(uint256 amount) external",
  "function viewMyPosition() external view returns (uint256 deposit, uint256 debt)"
];

interface ActionsProps {
  tokenAddress: string;
  poolAddress: string;
}

export default function Actions({ tokenAddress, poolAddress }: ActionsProps) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  // Input validation
  const validateAmount = (value: string): { isValid: boolean; error?: string; parsedAmount?: bigint } => {
    if (!value || value.trim() === "") {
      return { isValid: false, error: "Amount is required" };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, error: "Amount must be a positive number" };
    }

    // Check decimal places (after dividing by 1e6 for display)
    const decimalPlaces = (value.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { isValid: false, error: "Invalid amount format" };
    }

    // Convert to wei (assuming 18 decimals for display, but 6 decimals for contract)
    const parsedAmount = ethers.parseEther(value);
    return { isValid: true, parsedAmount };
  };

  // Recipient validation
  const validateRecipient = (address: string): { isValid: boolean; error?: string; checksumAddress?: string } => {
    if (!address || address.trim() === "") {
      return { isValid: false, error: "Recipient address is required" };
    }

    try {
      // Check if it's a valid Ethereum address
      if (!ethers.isAddress(address)) {
        return { isValid: false, error: "Invalid Ethereum address format" };
      }

      // Get checksum address
      const checksumAddress = ethers.getAddress(address);
      return { isValid: true, checksumAddress };
    } catch (error) {
      return { isValid: false, error: "Invalid Ethereum address" };
    }
  };

  // Error code mapping
  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return "Insufficient balance";
      case 2:
        return "Insufficient allowance";
      case 3:
        return "Transfer failed";
      case 4:
        return "Invalid amount";
      case 5:
        return "Unauthorized";
      default:
        return `Unknown error (code: ${code})`;
    }
  };

  // Helper to get last error from token contract
  const getLastError = async (userAddress: string): Promise<string | null> => {
    try {
      const signer = await getSigner();
      const tokenContract = await getToken()
      const [code, timestamp] = await tokenContract.getLastError(userAddress);
      
      if (code > 0) {
        return getErrorMessage(Number(code));
      }
      return null;
    } catch (error: any) {
      // If the error is BAD_DATA, it means no error has been recorded yet
      if (error.code === 'BAD_DATA') {
        return null;
      }
      console.error("Error getting last error:", error);
      return null;
    }
  };

  // Helper to set pending state
  const setPending = (action: string, isPending: boolean) => {
    setPendingActions(prev => {
      const newSet = new Set(prev);
      if (isPending) {
        newSet.add(action);
      } else {
        newSet.delete(action);
      }
      return newSet;
    });
  };

  // Helper function to check and set allowance
  const ensureAllowance = async (spender: string, amount: bigint) => {
    const signer = await getSigner();
    const tokenContract = await getToken()
    const userAddress = await getUserAddress();
    
    const currentAllowance = await tokenContract.allowance(userAddress, spender);
    
    if (currentAllowance < amount) {
      setMessage("Setting token allowance...");
      const approveTx = await tokenContract.approve(spender, amount);
      await approveTx.wait();
      setMessage("✅ Allowance set successfully!");
    }
  };

  let _decimals: number | null = null;
  const [faucetMax, setFaucetMax] = useState<string>("");
  const [liquidateAddr, setLiquidateAddr] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const info = await getFaucetMax();
        setFaucetMax(info.maxHuman);
        _decimals = info.decimals;
      } catch (e) {
        console.warn("faucet max probe failed", e);
      }
      if (!(await relayerHealthy())) {
        showToast(toast.error("Relayer is down or unreachable. Some actions are disabled."));
      }
    })();
  }, []);

  async function ensureDecimals() {
    if (_decimals === null || _decimals === undefined) {
      _decimals = await getTokenDecimals();
    }
    return _decimals;
  }

  const handleFaucet = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      showToast(toast.error("Invalid Amount", validation.error));
      return;
    }

    try {
      setPending("faucet", true);
      showToast(toast.info("Encrypting...", "Preparing faucet request"));
      
      const signer = await getSigner();
      const tokenContract = await getToken()
      const d = await ensureDecimals();
      const v = toU64Units(amount, d);
      if (faucetMax) {
        const max = toU64Units(faucetMax, d);
        if (v > max) {
          showToast(toast.error("Amount exceeds faucet limit", `Maximum allowed: ${faucetMax}`));
          return;
        }
      }
      const tx = await tokenContract.faucet(v);
      
      showToast(toast.info("Submitted Transaction", `Hash: ${tx.hash.slice(0, 10)}...`));
      await tx.wait();
      
      showToast(toast.success("Confirmed", "Faucet successful! Check your balance."));
      setAmount("");
    } catch (error: any) {
      console.error("Faucet error:", error);
      
      // Try to get specific error from contract
      const userAddress = await getUserAddress().catch(() => null);
      const contractError = userAddress ? await getLastError(userAddress) : null;
      
      const errorMessage = contractError || error.message;
      showToast(toast.error("Faucet Failed", errorMessage));
    } finally {
      setPending("faucet", false);
    }
  };

  const handleDeposit = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      showToast(toast.error("Invalid Amount", validation.error));
      return;
    }

    try {
      setPending("deposit", true);
      showToast(toast.info("Encrypting...", "Preparing deposit request"));
      
      const signer = await getSigner();
      const tokenContract = await getToken()
      const poolContract = await getPool()
      const userAddress = await getUserAddress();
      
      const d = await ensureDecimals();
      const v = toU64Units(amount, d);
      
      // First, ensure the pool has allowance to pull tokens if needed (keeping current ERC20 path for now)
      const currentAllowance = await tokenContract.allowance(userAddress, poolAddress);
      if (currentAllowance < v) {
        showToast(toast.info("Setting Allowance", "Approving tokens for deposit"));
        const approveTx = await tokenContract.approve(poolAddress, v);
        await approveTx.wait();
      }
      
      const { handles, inputProof } = await encryptU64(poolAddress, userAddress, v);
      const tx = await poolContract.depositFunds(handles[0], inputProof);
      
      showToast(toast.info("Submitted Transaction", `Hash: ${tx.hash.slice(0, 10)}...`));
      await tx.wait();
      
      showToast(toast.success("Confirmed", "Deposit successful! Check your position."));
      setAmount("");
    } catch (error: any) {
      console.error("Deposit error:", error);
      
      // Try to get specific error from contract
      const userAddress = await getUserAddress().catch(() => null);
      const contractError = userAddress ? await getLastError(userAddress) : null;
      
      const errorMessage = contractError || error.message;
      showToast(toast.error("Deposit Failed", errorMessage));
    } finally {
      setPending("deposit", false);
    }
  };

  const handleBorrow = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      showToast(toast.error("Invalid Amount", validation.error));
      return;
    }

    try {
      setPending("borrow", true);
      showToast(toast.info("Encrypting...", "Preparing borrow request"));
      
      const signer = await getSigner();
      const poolContract = await getPool();
      const addr = await getUserAddress();
      const d = await ensureDecimals();
      const v = toU64Units(amount, d);
      const { handles, inputProof } = await encryptU64(poolAddress, addr, v);
      const tx = await poolContract.borrow(handles[0], inputProof);
      
      showToast(toast.info("Submitted Transaction", `Hash: ${tx.hash.slice(0, 10)}...`));
      await tx.wait();
      
      showToast(toast.success("Confirmed", "Borrow successful! Check your position."));
      setAmount("");
    } catch (error: any) {
      console.error("Borrow error:", error);
      
      // Try to get specific error from contract
      const userAddress = await getUserAddress().catch(() => null);
      const contractError = userAddress ? await getLastError(userAddress) : null;
      
      const errorMessage = contractError || error.message;
      showToast(toast.error("Borrow Failed", errorMessage));
    } finally {
      setPending("borrow", false);
    }
  };

  const handleRepay = async () => {
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      showToast(toast.error("Invalid Amount", validation.error));
      return;
    }

    try {
      setPending("repay", true);
      showToast(toast.info("Encrypting...", "Preparing repay request"));
      
      const signer = await getSigner();
      const poolContract = await getPool();
      const addr = await getUserAddress();
      const d = await ensureDecimals();
      const v = toU64Units(amount, d);
      const { handles, inputProof } = await encryptU64(poolAddress, addr, v);
      const tx = await poolContract.repay(handles[0], inputProof);
      
      showToast(toast.info("Submitted Transaction", `Hash: ${tx.hash.slice(0, 10)}...`));
      await tx.wait();
      
      showToast(toast.success("Confirmed", "Repay successful! Check your position."));
      setAmount("");
    } catch (error: any) {
      console.error("Repay error:", error);
      
      // Try to get specific error from contract
      const userAddress = await getUserAddress().catch(() => null);
      const contractError = userAddress ? await getLastError(userAddress) : null;
      
      const errorMessage = contractError || error.message;
      showToast(toast.error("Repay Failed", errorMessage));
    } finally {
      setPending("repay", false);
    }
  };

  async function handleAccrue() {
    try {
      const s = await getSigner();
      const p = await getPool();
      const me = await s.getAddress();
      const tx = await p.accrue(me);
      await tx.wait();
      showToast(toast.success("Confirmed", "Accrued interest"));
    } catch (e:any) {
      showToast(toast.error("Accrue Failed", `Accrue error: ${e?.message || e}`));
    }
  }

  async function handleLiquidate() {
    try {
      if (!ethers.isAddress(liquidateAddr)) { 
        showToast(toast.error("Invalid Address", "Enter address to liquidate")); 
        return; 
      }
      const s = await getSigner();
      const addr = await s.getAddress();
      const d = await ensureDecimals();
      // repay a small fixed encrypted amount (e.g. 0.001) during liquidation
      const v = toU64Units("0.001", d);
      try { await relayerRegister(); } catch {}
      const { handles, inputProof } = await encryptU64(poolAddress, addr, v);
      const p = await getPool();
      const tx = await p.liquidate(liquidateAddr, handles[0], inputProof);
      await tx.wait();
      showToast(toast.success("Confirmed", "Liquidation attempted"));
    } catch (e:any) {
      showToast(toast.error("Liquidation Failed", `Liquidation error: ${e?.message || e}`));
    }
  }

  const handleTransfer = async () => {
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      showToast(toast.error("Invalid Amount", amountValidation.error));
      return;
    }

    const recipientValidation = validateRecipient(recipient);
    if (!recipientValidation.isValid) {
      showToast(toast.error("Invalid Recipient", recipientValidation.error));
      return;
    }

    try {
      setPending("transfer", true);
      showToast(toast.info("Encrypting...", "Preparing transfer request"));
      
      const signer = await getSigner();
      const tokenContract = await getToken()
      
      // Use the checksum address for the transfer
      const tx = await tokenContract.transfer(recipientValidation.checksumAddress!, amountValidation.parsedAmount!);
      
      showToast(toast.info("Submitted Transaction", `Hash: ${tx.hash.slice(0, 10)}...`));
      await tx.wait();
      
      showToast(toast.success("Confirmed", "Transfer successful!"));
      setAmount("");
      setRecipient("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      
      // Try to get specific error from contract
      const userAddress = await getUserAddress().catch(() => null);
      const contractError = userAddress ? await getLastError(userAddress) : null;
      
      const errorMessage = contractError || error.message;
      showToast(toast.error("Transfer Failed", errorMessage));
    } finally {
      setPending("transfer", false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Actions</h2>
      
      {/* Faucet */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">🎯 Faucet {faucetMax && <span className="text-xs text-gray-500">(max {faucetMax})</span>}</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFaucet}
            disabled={pendingActions.has("faucet") || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {pendingActions.has("faucet") ? "Getting..." : "Get Tokens"}
          </button>
        </div>
        <div className="mt-2">
          <button
            onClick={async () => {
              try {
                const signer = await getSigner();
                const tokenContract = await getToken()
                const userAddress = await getUserAddress();
                const balance = await tokenContract.balanceOf(userAddress);
                console.log("Current balance:", ethers.formatEther(balance));
                setMessage(`Current balance: ${ethers.formatEther(balance)} cUSD`);
              } catch (error) {
                console.error("Balance check error:", error);
              }
            }}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Check Balance
          </button>
        </div>
      </div>

      {/* Deposit */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💰 Deposit</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDeposit}
            disabled={pendingActions.has("deposit") || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {pendingActions.has("deposit") ? "Depositing..." : "Deposit"}
          </button>
        </div>
      </div>

      {/* Borrow */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">🏦 Borrow</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBorrow}
            disabled={pendingActions.has("borrow") || !amount}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {pendingActions.has("borrow") ? "Borrowing..." : "Borrow"}
          </button>
        </div>
      </div>

      {/* Repay */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💳 Repay</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRepay}
            disabled={pendingActions.has("repay") || !amount}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {pendingActions.has("repay") ? "Repaying..." : "Repay"}
          </button>
        </div>
      </div>

      {/* Accrue Interest */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">⏱️ Accrue Interest</h3>
        <button 
          onClick={handleAccrue}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Accrue
        </button>
      </div>

      {/* Liquidation */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">⚠️ Liquidate</h3>
        <input
          placeholder="0xLiquidatee"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          value={liquidateAddr}
          onChange={(e)=>setLiquidateAddr(e.target.value)}
        />
        <button 
          onClick={handleLiquidate}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Liquidate
        </button>
      </div>

      {/* Transfer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">📤 Transfer</h3>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                recipient && !validateRecipient(recipient).isValid
                  ? "border-red-300 focus:ring-red-500"
                  : recipient && validateRecipient(recipient).isValid
                  ? "border-green-300 focus:ring-green-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {recipient && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {validateRecipient(recipient).isValid ? (
                  <span className="text-green-500 text-sm">✓</span>
                ) : (
                  <span className="text-red-500 text-sm">✗</span>
                )}
              </div>
            )}
          </div>
          {recipient && !validateRecipient(recipient).isValid && (
            <p className="text-xs text-red-600 mt-1">
              {validateRecipient(recipient).error}
            </p>
          )}
          {recipient && validateRecipient(recipient).isValid && (
            <p className="text-xs text-green-600 mt-1">
              Valid address: {validateRecipient(recipient).checksumAddress}
            </p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTransfer}
              disabled={
                pendingActions.has("transfer") || 
                !amount || 
                !recipient || 
                !validateAmount(amount).isValid || 
                !validateRecipient(recipient).isValid
              }
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {pendingActions.has("transfer") ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
