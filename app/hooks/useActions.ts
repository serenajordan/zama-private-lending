'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { getToken, getPool } from '@/lib/contracts';
import { getTokenDecimals } from '@/lib/tokenMeta';
import { toU64Units } from '@/lib/amount';
import { encryptU64, relayerHealthy } from '@/lib/relayer';
import { useAccount } from 'wagmi';

export function useActions() {
  const { address } = useAccount();
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
      
      // Ensure relayer is available before proceeding
      const isHealthy = await relayerHealthy();
      if (!isHealthy) {
        throw new Error('Relayer unavailable. Check your connection and relayer configuration.');
      }

      const token = await getToken();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Encrypt the amount for the faucet call
      const enc = await encryptU64(u64);
      
      // Call faucet function
      const tx = await token.faucet();
      toast.success('Faucet transaction sent');
      await tx.wait();
      toast.success('Faucet completed');
    });
  };

  const deposit = async (humanAmount: string) => {
    return withBusy('deposit', async () => {
      if (!address) throw new Error('Connect wallet');
      
      // Ensure relayer is available before proceeding
      const isHealthy = await relayerHealthy();
      if (!isHealthy) {
        throw new Error('Relayer unavailable. Check your connection and relayer configuration.');
      }
      
      const pool = await getPool();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Encrypt the amount for the deposit call
      const enc = await encryptU64(u64);
      
      // Call deposit function with encrypted amount
      const tx = await pool.deposit(enc);
      toast.success('Deposit submitted');
      await tx.wait();
      toast.success('Deposit confirmed');
    });
  };

  const borrow = async (humanAmount: string) => {
    return withBusy('borrow', async () => {
      if (!address) throw new Error('Connect wallet');
      
      // Ensure relayer is available before proceeding
      const isHealthy = await relayerHealthy();
      if (!isHealthy) {
        throw new Error('Relayer unavailable. Check your connection and relayer configuration.');
      }
      
      const pool = await getPool();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Encrypt the amount for the borrow call
      const enc = await encryptU64(u64);
      
      // Call borrow function with encrypted amount
      const tx = await pool.borrow(enc);
      toast.success('Borrow submitted');
      await tx.wait();
      toast.success('Borrow confirmed');
    });
  };

  const repay = async (humanAmount: string) => {
    return withBusy('repay', async () => {
      if (!address) throw new Error('Connect wallet');
      
      // Ensure relayer is available before proceeding
      const isHealthy = await relayerHealthy();
      if (!isHealthy) {
        throw new Error('Relayer unavailable. Check your connection and relayer configuration.');
      }
      
      const pool = await getPool();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Encrypt the amount for the repay call
      const enc = await encryptU64(u64);
      
      // Call repay function with encrypted amount
      const tx = await pool.repay(enc);
      toast.success('Repay submitted');
      await tx.wait();
      toast.success('Repay confirmed');
    });
  };

  return { faucet, deposit, borrow, repay, busy };
}
