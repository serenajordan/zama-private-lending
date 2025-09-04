"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { encrypt64 } from "../lib/relayer";
import { getSigner, getUserAddress } from "../lib/ethers";

// Contract ABIs (simplified for demo - using standard uint256 for now)
const TOKEN_ABI = [
  "function faucet(uint256 amount) external",
  "function transfer(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

const POOL_ABI = [
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

  // Helper function to check and set allowance
  const ensureAllowance = async (spender: string, amount: bigint) => {
    const signer = await getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const userAddress = await getUserAddress();
    
    const currentAllowance = await tokenContract.allowance(userAddress, spender);
    
    if (currentAllowance < amount) {
      setMessage("Setting token allowance...");
      const approveTx = await tokenContract.approve(spender, amount);
      await approveTx.wait();
      setMessage("✅ Allowance set successfully!");
    }
  };

  const handleFaucet = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      setMessage("Getting tokens from faucet...");
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      
      // For now, call faucet directly with the amount
      // In production, this would use encrypted values
      const tx = await tokenContract.faucet(ethers.parseEther(amount));
      await tx.wait();
      
      setMessage("✅ Faucet successful! Check your balance.");
      setAmount("");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      setMessage("Setting token allowance...");
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      const depositAmount = ethers.parseEther(amount);
      
      // First, ensure the pool has allowance to spend user's tokens
      await ensureAllowance(poolAddress, depositAmount);
      
      setMessage("Depositing tokens...");
      
      // Now call deposit
      const tx = await poolContract.deposit(depositAmount);
      await tx.wait();
      
      setMessage("✅ Deposit successful! Check your position.");
      setAmount("");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      setMessage("Borrowing tokens...");
      
      const signer = await getSigner();
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      // For now, call borrow directly with the amount
      // In production, this would use encrypted values
      const tx = await poolContract.borrow(ethers.parseEther(amount));
      await tx.wait();
      
      setMessage("✅ Borrow successful! Check your position.");
      setAmount("");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      setMessage("Setting token allowance...");
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      const repayAmount = ethers.parseEther(amount);
      
      // First, ensure the pool has allowance to spend user's tokens
      await ensureAllowance(poolAddress, repayAmount);
      
      setMessage("Repaying debt...");
      
      // Now call repay
      const tx = await poolContract.repay(repayAmount);
      await tx.wait();
      
      setMessage("✅ Repay successful! Check your position.");
      setAmount("");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || !recipient) return;
    
    try {
      setLoading(true);
      setMessage("Transferring tokens...");
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      
      // For now, call transfer directly with the amount
      // In production, this would use encrypted values
      const tx = await tokenContract.transfer(recipient, ethers.parseEther(amount));
      await tx.wait();
      
      setMessage("✅ Transfer successful!");
      setAmount("");
      setRecipient("");
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Actions</h2>
      
      {/* Faucet */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">🎯 Faucet</h3>
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
            disabled={loading || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Getting..." : "Get Tokens"}
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
            disabled={loading || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Depositing..." : "Deposit"}
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
            disabled={loading || !amount}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? "Borrowing..." : "Borrow"}
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
            disabled={loading || !amount}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Repaying..." : "Repay"}
          </button>
        </div>
      </div>

      {/* Transfer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">📤 Transfer</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              disabled={loading || !amount || !recipient}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
          {message}
        </div>
      )}
    </div>
  );
}
