"use client";

import { useNetworkGuard } from "../lib/useNetworkGuard";

interface NetworkGuardProps {
  children: React.ReactNode;
}

export default function NetworkGuard({ children }: NetworkGuardProps) {
  const { isCorrectNetwork, currentChainId, isLoading, switchToSepolia } = useNetworkGuard();

  // Show loading state while checking network
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking network connection...</p>
        </div>
      </div>
    );
  }

  // Show network switch modal if wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Wrong Network Detected
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              This application requires the Sepolia testnet to function properly.
            </p>
            
            {currentChainId && (
              <div className="bg-gray-100 rounded-md p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Current Network:</p>
                <p className="text-sm font-mono text-gray-700">
                  Chain ID: {currentChainId}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={switchToSepolia}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Switch to Sepolia
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>If you don't have Sepolia testnet added to your wallet,</p>
              <p>clicking "Switch to Sepolia" will add it automatically.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render children if correct network
  return <>{children}</>;
}
