"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { userDecrypt } from "../lib/relayer";
import { getSigner, getUserAddress, isMetaMaskConnected } from "../lib/ethers";

// Contract ABIs (simplified for demo - using standard uint256 for now)
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];

const POOL_ABI = [
  "function viewMyPosition() external view returns (uint256 deposit, uint256 debt)",
  "function getHealthFactor(address user) external view returns (bool)"
];

interface DashboardProps {
  tokenAddress: string;
  poolAddress: string;
}

interface Position {
  deposit: bigint;
  debt: bigint;
  balance: bigint;
  healthFactor: boolean;
}

export default function Dashboard({ tokenAddress, poolAddress }: DashboardProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(isMetaMaskConnected());
  }, []);

  const refreshPosition = async () => {
    if (!connected) return;
    
    try {
      setLoading(true);
      setError("");
      
      const signer = await getSigner();
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      const userAddress = await getUserAddress();
      
      // Get position data directly (no encryption for now)
      const [deposit, debt] = await poolContract.viewMyPosition();
      const balance = await tokenContract.balanceOf(userAddress);
      
      // Get health factor
      const healthFactor = await poolContract.getHealthFactor(userAddress);
      
      setPosition({
        deposit,
        debt,
        balance,
        healthFactor
      });
      
    } catch (error: any) {
      setError(`Error loading position: ${error.message}`);
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      refreshPosition();
    }
  }, [connected]);

  if (!connected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Dashboard</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your wallet to view your position</p>
          <div className="text-sm text-gray-500">
            Make sure you're connected to Sepolia testnet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard</h2>
        <button
          onClick={refreshPosition}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading your position...</div>
        </div>
      ) : position ? (
        <div className="space-y-6">
          {/* Token Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💰 Token Balance</h3>
            <div className="text-2xl font-bold text-blue-700">
              {ethers.formatEther(position.balance)} cUSD
            </div>
          </div>

          {/* Position Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">📈 Total Deposits</h3>
              <div className="text-2xl font-bold text-green-700">
                {ethers.formatEther(position.deposit)} cUSD
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">💳 Total Debt</h3>
              <div className="text-2xl font-bold text-red-700">
                {ethers.formatEther(position.debt)} cUSD
              </div>
            </div>
          </div>

          {/* Health Factor */}
          <div className={`p-4 rounded-lg ${
            position.healthFactor ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <h3 className="text-lg font-semibold mb-2">🏥 Health Factor</h3>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-bold ${
                position.healthFactor ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {position.healthFactor ? '✅ Healthy' : '⚠️ At Risk'}
              </div>
              <div className="text-sm text-gray-600">
                {position.healthFactor 
                  ? 'Your position is within safe limits' 
                  : 'Consider repaying debt or adding collateral'
                }
              </div>
            </div>
          </div>

          {/* LTV Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Loan-to-Value (LTV)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Maximum LTV:</span>
                <span className="font-semibold">70%</span>
              </div>
              <div className="flex justify-between">
                <span>Current LTV:</span>
                <span className="font-semibold">
                  {position.deposit > BigInt(0) 
                    ? `${Math.round(Number(position.debt) / Number(position.deposit) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="text-sm text-gray-600">
                You can borrow up to 70% of your deposited collateral value
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">⚡ Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                💰 Deposit More
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                💳 Borrow
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                💸 Repay Debt
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-600">No position data available</div>
          <div className="text-sm text-gray-500 mt-2">
            Try depositing some tokens to get started
          </div>
        </div>
      )}
    </div>
  );
}
