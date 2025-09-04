"use client";

import { useState, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import Actions from "../components/Actions";
import { isMetaMaskConnected, requestMetaMaskConnection, switchToSepolia } from "../lib/ethers";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [contracts, setContracts] = useState({
    token: "",
    pool: ""
  });

  useEffect(() => {
    // Check if MetaMask is connected
    setConnected(isMetaMaskConnected());
    
    // Load contract addresses from environment
    if (typeof window !== "undefined") {
      setContracts({
        token: process.env.NEXT_PUBLIC_TOKEN || "",
        pool: process.env.NEXT_PUBLIC_POOL || ""
      });
    }
  }, []);

  const handleConnect = async () => {
    try {
      await requestMetaMaskConnection();
      await switchToSepolia();
      setConnected(true);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  if (!contracts.token || !contracts.pool) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔐 Zama Private Lending Protocol
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Confidential DeFi lending powered by fully homomorphic encryption
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Configuration Required
              </h2>
              <p className="text-yellow-700 mb-4">
                Contract addresses not configured. Please set the following environment variables:
              </p>
              <div className="text-left bg-yellow-100 p-4 rounded border">
                <code className="text-sm">
                  NEXT_PUBLIC_TOKEN=your_token_address<br/>
                  NEXT_PUBLIC_POOL=your_pool_address
                </code>
              </div>
              <p className="text-yellow-700 mt-4 text-sm">
                Deploy contracts first using <code className="bg-yellow-200 px-2 py-1 rounded">pnpm deploy:sepolia</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🔐 Zama Private Lending
              </h1>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Sepolia Testnet
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {connected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Connected to Sepolia
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!connected ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🔗 Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect MetaMask to interact with the private lending protocol
                </p>
                <button
                  onClick={handleConnect}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Connect MetaMask
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  Make sure you're connected to Sepolia testnet
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dashboard */}
            <div className="lg:col-span-1">
              <Dashboard 
                tokenAddress={contracts.token}
                poolAddress={contracts.pool}
              />
            </div>
            
            {/* Actions */}
            <div className="lg:col-span-1">
              <Actions 
                tokenAddress={contracts.token}
                poolAddress={contracts.pool}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Built with ❤️ on Zama fhEVM
            </p>
            <p className="text-sm">
              Confidential DeFi lending protocol | Sepolia Testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
