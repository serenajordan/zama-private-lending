'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { TOKEN_ADDR, POOL_ADDR } from '@/lib/contracts';
import TokenABI from '@/abis/ConfidentialUSD.json';
import PoolABI from '@/abis/PrivateLendingPool.json';
import { getTokenDecimals } from '@/lib/tokenMeta';
import { hasFn, expectsBytes, expectsUint } from '@/lib/abi-utils';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const toUnits = (amountStr: string, decimals = 18) =>
  parseUnits((amountStr || '0').trim(), decimals);

// DEPOSIT: approve then pool.deposit(units)
// expects: tokenAddress, poolAddress, tokenDecimals are available in scope (or fetched as in the file)
async function handleDeposit({
  walletClient,
  tokenAddress,
  poolAddress,
  tokenDecimals,
  amountStr,
}: {
  walletClient: any;
  tokenAddress: `0x${string}`;
  poolAddress: `0x${string}`;
  tokenDecimals: number;
  amountStr: string;
}) {
  const units = toUnits(amountStr, tokenDecimals);
  console.debug('[deposit:uint]', { units: units.toString() });

  // 1) approve
  await walletClient.writeContract({
    address: tokenAddress,
    abi: (TokenABI as any).abi ?? (TokenABI as any),
    functionName: 'approve',
    args: [poolAddress, units],
  });

  // 2) deposit (NO { value })
  return walletClient.writeContract({
    address: poolAddress,
    abi: (PoolABI as any).abi ?? (PoolABI as any),
    functionName: 'deposit',
    args: [units],
  });
}

// BORROW: pool.borrow(units) with args only (NO { value })
async function handleBorrow({
  walletClient,
  poolAddress,
  tokenDecimals,
  amountStr,
}: {
  walletClient: any;
  poolAddress: `0x${string}`;
  tokenDecimals: number;
  amountStr: string;
}) {
  const units = toUnits(amountStr, tokenDecimals);
  console.debug('[borrow:uint]', { units: units.toString() });

  return walletClient.writeContract({
    address: poolAddress,
    abi: (PoolABI as any).abi ?? (PoolABI as any),
    functionName: 'borrow',
    args: [units],
  });
}

// REPAY: approve then pool.repay(units) (NO { value })
async function handleRepay({
  walletClient,
  tokenAddress,
  poolAddress,
  tokenDecimals,
  amountStr,
}: {
  walletClient: any;
  tokenAddress: `0x${string}`;
  poolAddress: `0x${string}`;
  tokenDecimals: number;
  amountStr: string;
}) {
  const units = toUnits(amountStr, tokenDecimals);
  console.debug('[repay:uint]', { units: units.toString() });

  // 1) approve
  await walletClient.writeContract({
    address: tokenAddress,
    abi: (TokenABI as any).abi ?? (TokenABI as any),
    functionName: 'approve',
    args: [poolAddress, units],
  });

  // 2) repay
  return walletClient.writeContract({
    address: poolAddress,
    abi: (PoolABI as any).abi ?? (PoolABI as any),
    functionName: 'repay',
    args: [units],
  });
}

export function useActions() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [busy, setBusy] = useState<string | null>(null);

  const withBusy = async <T,>(label: string, fn: () => Promise<T>) => {
    setBusy(label);
    try { 
      return await fn(); 
    } catch (error) {
      console.error(`Error in ${label}:`, error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally { 
      setBusy(null); 
    }
  };

  const faucet = async (humanAmount: string) => {
    return withBusy('faucet', async () => {
      if (!address) throw new Error('Connect wallet');
      if (!walletClient) throw new Error('Wallet not ready');

      const tokenDecimals = await getTokenDecimals();
      const units = toUnits(humanAmount, tokenDecimals);
      const tokenAddress = TOKEN_ADDR as `0x${string}`;
      const tokenAbi = (TokenABI as any).abi as any[];

      // Prefer faucet(uint*) → else mint(address,uint*)
      if (hasFn(tokenAbi, 'faucet') && expectsUint(tokenAbi, 'faucet', 0)) {
        console.info('[faucet] using token.faucet(uint)', { type: 'uint', units: units.toString() });
        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'faucet',
          args: [units],
        });
        toast.success('[faucet:uint] tx sent');
        return hash;
      }
      
      if (hasFn(tokenAbi, 'mint') && expectsUint(tokenAbi, 'mint', 1)) {
        console.info('[faucet] using token.mint(address,uint)', { type: 'uint', to: address, units: units.toString() });
        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'mint',
          args: [address, units],
        });
        toast.success('[faucet:mint:uint] tx sent');
        return hash;
      }

<<<<<<< HEAD
      throw new Error('No supported faucet function found (uint or bytes)');
    });
  };

  const deposit = async (humanAmount: string) => {
    return withBusy('deposit', async () => {
      if (!address) throw new Error('Connect wallet');
      if (!walletClient) throw new Error('Wallet not ready');

      const tokenDecimals = await getTokenDecimals();
      const tokenAddress = TOKEN_ADDR as `0x${string}`;
      const poolAddress = POOL_ADDR as `0x${string}`;

      const hash = await handleDeposit({
        walletClient,
        tokenAddress,
        poolAddress,
        tokenDecimals,
        amountStr: humanAmount,
      });
      toast.success('[deposit:uint] tx sent');
      return hash;
    });
  };

  const borrow = async (humanAmount: string) => {
    return withBusy('borrow', async () => {
      if (!address) throw new Error('Connect wallet');
      if (!walletClient) throw new Error('Wallet not ready');

      const tokenDecimals = await getTokenDecimals();
      const poolAddress = POOL_ADDR as `0x${string}`;

      const hash = await handleBorrow({
        walletClient,
        poolAddress,
        tokenDecimals,
        amountStr: humanAmount,
      });
      toast.success('[borrow:uint] tx sent');
      return hash;
    });
  };

  const repay = async (humanAmount: string) => {
    return withBusy('repay', async () => {
      if (!address) throw new Error('Connect wallet');
      if (!walletClient) throw new Error('Wallet not ready');

      const tokenDecimals = await getTokenDecimals();
      const tokenAddress = TOKEN_ADDR as `0x${string}`;
      const poolAddress = POOL_ADDR as `0x${string}`;

      const hash = await handleRepay({
        walletClient,
        tokenAddress,
        poolAddress,
        tokenDecimals,
        amountStr: humanAmount,
      });
      toast.success('[repay:uint] tx sent');
      return hash;
    });
  };

  return { faucet, deposit, borrow, repay, busy };
}
