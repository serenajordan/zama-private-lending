'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { getToken, getPool } from '@/lib/contracts';
import { getTokenDecimals } from '@/lib/tokenMeta';
import { toU64Units, fromUnits } from '@/lib/amount';
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
      
      // Validate faucet amount - reasonable limits
      const faucetAmount = parseFloat(humanAmount);
      if (faucetAmount <= 0) {
        throw new Error('Faucet amount must be greater than 0.');
      }
      if (faucetAmount > 1000) {
        throw new Error('Faucet amount cannot exceed 1000 cUSD per request.');
      }
      
      // Encrypt the amount for the faucet call
      const enc = await encryptU64(u64);
      
      // Call faucet function with encrypted amount
      const tx = await token.faucet(enc);
      toast.success(`Faucet transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      const receipt = await tx.wait();
      toast.success(`✅ Faucet completed! You received ${humanAmount} cUSD`, {
        description: `Transaction confirmed in block ${receipt.blockNumber}`,
        duration: 5000,
      });
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
      const token = await getToken();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Validate deposit amount
      const depositAmount = parseFloat(humanAmount);
      if (depositAmount <= 0) {
        throw new Error('Deposit amount must be greater than 0.');
      }
      
      // Check if user has enough token balance to deposit
      const rawBalance = await token.balanceOf(address);
      const tokenBalance = fromUnits(rawBalance, decimals);
      const balanceAmount = parseFloat(tokenBalance);
      
      if (depositAmount > balanceAmount) {
        throw new Error(`Insufficient token balance. You have ${tokenBalance} cUSD but trying to deposit ${humanAmount} cUSD.`);
      }
      
      // First, approve the pool contract to spend tokens
      toast.info('Approving tokens...');
      const approveTx = await token.approve(pool.target, u64);
      await approveTx.wait();
      toast.success('✅ Token approval confirmed');
      
      // Encrypt the amount for the deposit call
      const enc = await encryptU64(u64);
      
      // Call deposit function with encrypted amount (contract expects bytes32)
      const tx = await pool.deposit(enc);
      toast.success(`Deposit transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      const receipt = await tx.wait();
      toast.success(`🎉 Deposit successful! You deposited ${humanAmount} cUSD`, {
        description: `Transaction confirmed in block ${receipt.blockNumber}. Your balance will update automatically.`,
        duration: 5000,
      });
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
      
      // Validate borrow amount
      const borrowAmount = parseFloat(humanAmount);
      if (borrowAmount <= 0) {
        throw new Error('Borrow amount must be greater than 0.');
      }
      
      // Check current position to validate borrowing capacity
      const [rawDeposits, rawDebt] = await pool.viewMyPosition();
      const currentDeposits = fromUnits(rawDeposits, decimals);
      const currentDebt = fromUnits(rawDebt, decimals);
      const depositsAmount = parseFloat(currentDeposits);
      const debtAmount = parseFloat(currentDebt);
      
      // Calculate maximum borrowable amount (80% LTV)
      const maxLtv = 0.8;
      const maxBorrowable = depositsAmount * maxLtv;
      const newTotalDebt = debtAmount + borrowAmount;
      
      if (newTotalDebt > maxBorrowable) {
        const availableToBorrow = Math.max(0, maxBorrowable - debtAmount);
        throw new Error(`Cannot borrow ${humanAmount} cUSD. Maximum borrowable amount is ${availableToBorrow.toFixed(2)} cUSD (80% of deposits).`);
      }
      
      if (depositsAmount === 0) {
        throw new Error('You must deposit tokens before you can borrow.');
      }
      
      // Encrypt the amount for the borrow call
      const enc = await encryptU64(u64);
      
      // Call borrow function with encrypted amount
      const tx = await pool.borrow(enc);
      toast.success(`Borrow transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      const receipt = await tx.wait();
      toast.success(`💰 Borrow successful! You borrowed ${humanAmount} cUSD`, {
        description: `Transaction confirmed in block ${receipt.blockNumber}. Your balance will update automatically.`,
        duration: 5000,
      });
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
      const token = await getToken();
      const decimals = await getTokenDecimals();
      const u64 = toU64Units(humanAmount, decimals);
      
      // Validate repay amount
      const repayAmount = parseFloat(humanAmount);
      if (repayAmount <= 0) {
        throw new Error('Repay amount must be greater than 0.');
      }
      
      // Check current debt to validate repay amount
      const [rawDeposits, rawDebt] = await pool.viewMyPosition();
      const currentDebt = fromUnits(rawDebt, decimals);
      const debtAmount = parseFloat(currentDebt);
      
      if (repayAmount > debtAmount) {
        throw new Error(`Cannot repay ${humanAmount} cUSD. Your current debt is only ${currentDebt} cUSD.`);
      }
      
      if (debtAmount === 0) {
        throw new Error('You have no debt to repay.');
      }
      
      // Check if user has enough token balance to repay
      const rawBalance = await token.balanceOf(address);
      const tokenBalance = fromUnits(rawBalance, decimals);
      const balanceAmount = parseFloat(tokenBalance);
      
      if (repayAmount > balanceAmount) {
        throw new Error(`Insufficient token balance. You have ${tokenBalance} cUSD but trying to repay ${humanAmount} cUSD.`);
      }
      
      // First, approve the pool contract to spend tokens for repayment
      toast.info('Approving tokens for repayment...');
      const approveTx = await token.approve(pool.target, u64);
      await approveTx.wait();
      toast.success('✅ Token approval confirmed');
      
      // Encrypt the amount for the repay call
      const enc = await encryptU64(u64);
      
      // Call repay function with encrypted amount
      const tx = await pool.repay(enc);
      toast.success(`Repay transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);
      const receipt = await tx.wait();
      toast.success(`✅ Repay successful! You repaid ${humanAmount} cUSD`, {
        description: `Transaction confirmed in block ${receipt.blockNumber}. Your balance will update automatically.`,
        duration: 5000,
      });
    });
  };

  return { faucet, deposit, borrow, repay, busy };
}
