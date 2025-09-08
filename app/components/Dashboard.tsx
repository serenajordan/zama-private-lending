"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPool, TOKEN_ADDR, POOL_ADDR } from "@/lib/contracts";
import { getSigner, getUserAddress, isMetaMaskConnected, getProvider } from "../lib/ethers";

// Contract ABIs (simplified for demo - using standard uint256 for now)
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)"
];

const POOL_ABI = [
  "function asset() external view returns (address)",
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
  ltv: number;
}

export default function Dashboard({ tokenAddress, poolAddress }: DashboardProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [networkName, setNetworkName] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  useEffect(() => {
    setConnected(isMetaMaskConnected());
    getNetworkInfo();
  }, []);

  const getNetworkInfo = async () => {
    try {
      const provider = await getProvider();
      const network = await provider.getNetwork();
      setNetworkName(network.name || `Chain ${network.chainId}`);
    } catch (error) {
      setNetworkName("Unknown");
    }
  };

  const formatWithDecimals = (value: bigint, decimals: number = 6): string => {
    const divisor = BigInt(10 ** decimals);
    const wholePart = value / divisor;
    const fractionalPart = value % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const refreshPosition = async () => {
    if (!connected) return;
    
    try {
      setLoading(true);
      setError("");
      
      const signer = await getSigner();
      const poolContract = await getPool()
      const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      const userAddress = await getUserAddress();
      
      // Test contract connectivity first
      console.log("🔍 Testing contract connectivity...");
      try {
        const assetAddress = await poolContract.asset();
        console.log("📊 Asset address:", assetAddress);
      } catch (error) {
        console.error("❌ Asset call failed:", error);
      }
      
      // Get position data directly (uint256 values for now)
      console.log("🔍 Calling viewMyPosition...");
      const result = await poolContract.viewMyPosition();
      console.log("📊 Raw result:", result);
      const [deposit, debt] = result;
      console.log("📊 Parsed values:", { deposit: deposit.toString(), debt: debt.toString() });
      
      // Get token balance (still public)
      const balance = await tokenContract.balanceOf(userAddress);
      
      // Get health factor
      const healthFactor = await poolContract.getHealthFactor(userAddress);
      
      // Calculate LTV client-side
      const ltv = deposit > BigInt(0) 
        ? Number(debt) / Number(deposit) * 100 
        : 0;
      
      setPosition({
        deposit,
        debt,
        balance,
        healthFactor,
        ltv
      });
      
    } catch (error: any) {
      console.error("Dashboard error:", error);
      setError(`Error loading position: ${error.message}`);
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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">📊 Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              🌐 {networkName}
            </span>
            <div className="relative group">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full cursor-help">
                ⚠️ Demo
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                This is a demo version. Real FHEVM integration coming soon.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={refreshPosition}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Contract Addresses */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Contract Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-20">Token:</span>
            <code className="flex-1 text-xs bg-white px-2 py-1 rounded border font-mono">
              {tokenAddress}
            </code>
            <button
              onClick={() => copyToClipboard(tokenAddress, "Token")}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {copiedAddress === "Token" ? "✓" : "📋"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-20">Pool:</span>
            <code className="flex-1 text-xs bg-white px-2 py-1 rounded border font-mono">
              {poolAddress}
            </code>
            <button
              onClick={() => copyToClipboard(poolAddress, "Pool")}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {copiedAddress === "Pool" ? "✓" : "📋"}
            </button>
          </div>
        </div>
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
                {formatWithDecimals(position.deposit, 6)} cUSD
              </div>
              <div className="text-xs text-green-600 mt-1">
                🔒 Encrypted on-chain
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-2">💳 Total Debt</h3>
              <div className="text-2xl font-bold text-red-700">
                {formatWithDecimals(position.debt, 6)} cUSD
              </div>
              <div className="text-xs text-red-600 mt-1">
                🔒 Encrypted on-chain
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
                <span className={`font-semibold ${
                  position.ltv > 70 ? 'text-red-600' : 
                  position.ltv > 50 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {position.ltv.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                💻 Calculated client-side from decrypted values
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
// addresses exposed via lib/contracts.ts: TOKEN_ADDR, POOL_ADDR
