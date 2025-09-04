"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { encrypt64 } from "../lib/relayer";
import { getSigner, getUserAddress } from "../lib/ethers";

// Contract ABIs (simplified for demo)
const TOKEN_ABI = [
  "function faucet(externalEuint64 calldata amount) external",
  "function transferEncrypted(address to, externalEuint64 calldata encAmt, bytes calldata proof) external"
];

const POOL_ABI = [
  "function deposit(externalEuint64 calldata encAmt, bytes calldata proof) external",
  "function borrow(externalEuint64 calldata encReq, bytes calldata proof) external",
  "function repay(externalEuint64 calldata encAmt, bytes calldata proof) external"
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

  const handleFaucet = async () => {
    if (!amount) return;
    
    try {
      setLoading(true);
      setMessage("Getting tokens from faucet...");
      
      const userAddress = await getUserAddress();
      const { handles, inputProof } = await encrypt64(
        tokenAddress,
        userAddress,
        BigInt(amount)
      );
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      
      const tx = await tokenContract.faucet(handles[0], inputProof);
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
      setMessage("Depositing tokens...");
      
      const userAddress = await getUserAddress();
      const { handles, inputProof } = await encrypt64(
        poolAddress,
        userAddress,
        BigInt(amount)
      );
      
      const signer = await getSigner();
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      const tx = await poolContract.deposit(handles[0], inputProof);
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
      
      const userAddress = await getUserAddress();
      const { handles, inputProof } = await encrypt64(
        poolAddress,
        userAddress,
        BigInt(amount)
      );
      
      const signer = await getSigner();
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      const tx = await poolContract.borrow(handles[0], inputProof);
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
      setMessage("Repaying debt...");
      
      const userAddress = await getUserAddress();
      const { handles, inputProof } = await encrypt64(
        poolAddress,
        userAddress,
        BigInt(amount)
      );
      
      const signer = await getSigner();
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      
      const tx = await poolContract.repay(handles[0], inputProof);
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
      
      const userAddress = await getUserAddress();
      const { handles, inputProof } = await encrypt64(
        tokenAddress,
        userAddress,
        BigInt(amount)
      );
      
      const signer = await getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      
      const tx = await tokenContract.transferEncrypted(recipient, handles[0], inputProof);
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
      
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {message}
        </div>
      )}

      {/* Faucet */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">🚰 Faucet</h3>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Get Tokens"}
          </button>
        </div>
      </div>

      {/* Deposit */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💰 Deposit</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount to deposit"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </div>
      </div>

      {/* Borrow */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💳 Borrow</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount to borrow"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBorrow}
            disabled={loading || !amount}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Borrow"}
          </button>
        </div>
      </div>

      {/* Repay */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">💸 Repay</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount to repay"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleRepay}
            disabled={loading || !amount}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Repay"}
          </button>
        </div>
      </div>

      {/* Transfer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">📤 Transfer</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount to transfer"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTransfer}
              disabled={loading || !amount || !recipient}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Transfer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
