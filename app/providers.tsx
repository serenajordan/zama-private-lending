'use client';
import { ReactNode, useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

const config = getDefaultConfig({
  appName: 'Zama Private Lending',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [sepolia],
  transports: { [sepolia.id]: http(rpcUrl) },
  ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" initialChain={sepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
