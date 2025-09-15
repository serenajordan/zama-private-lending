'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function WalletConnectButton() {
  const { isConnected, address } = useAccount();
  
  // Fallback if RainbowKit fails to load
  if (typeof window !== 'undefined' && !window.ethereum) {
    return (
      <button 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        disabled
      >
        No Wallet Detected
      </button>
    );
  }
  
  return <ConnectButton showBalance={false} />;
}
