'use client';
import { useEffect, useState, useCallback } from 'react';
import { getPool, getToken } from '@/lib/contracts';
import { getTokenDecimals } from '@/lib/tokenMeta';
import { fromUnits } from '@/lib/amount';
import { useAccount } from 'wagmi';

type Position = {
  decimals: number;
  balance: string;     // user token balance (cUSD)
  deposits: string;    // total deposited by user
  debt: string;        // current debt
  healthPct: number;   // 0-100
  ltvPct: number;      // 0-100
  maxLtvPct: number;   // 0-100 (e.g. 70)
};

export function usePosition() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const tokenAddress = process.env.NEXT_PUBLIC_TOKEN!;
  const poolAddress = process.env.NEXT_PUBLIC_POOL!;

  const refresh = useCallback(async () => {
    if (!address || !tokenAddress || !poolAddress) return;
    setLoading(true);
    try {
      const token = await getToken();
      const pool = await getPool();
      const decimals = await getTokenDecimals();

      // Read user's token balance
      const rawBalance = await token.balanceOf(address);
      
      // Read user's position from pool (returns [deposits, debt])
      const [rawDeposits, rawDebt] = await pool.viewMyPosition();

      // Convert to strings in human units
      const balance = fromUnits(rawBalance, decimals);
      const deposits = fromUnits(rawDeposits, decimals);
      const debt = fromUnits(rawDebt, decimals);

      // Calculate health factor and LTV
      // For now, we'll use simple calculations - these might need adjustment based on your contract logic
      const depositsNum = parseFloat(deposits);
      const debtNum = parseFloat(debt);
      
      // Simple health calculation: deposits / (debt * 1.5) * 100
      const healthPct = debtNum > 0 ? Math.min(100, (depositsNum / (debtNum * 1.5)) * 100) : 100;
      
      // LTV calculation: debt / deposits * 100
      const ltvPct = depositsNum > 0 ? (debtNum / depositsNum) * 100 : 0;
      
      // Max LTV is typically 80% for lending protocols
      const maxLtvPct = 80;

      const newPosition = { 
        decimals, 
        balance, 
        deposits, 
        debt, 
        healthPct, 
        ltvPct, 
        maxLtvPct 
      };

      console.log('[usePosition] Refreshing position:', newPosition);
      setPos(newPosition);
    } catch (error) {
      console.error('Error fetching position:', error);
      // Set default values on error
      const defaultPosition = {
        decimals: 18,
        balance: '0.00',
        deposits: '0.00',
        debt: '0.00',
        healthPct: 100,
        ltvPct: 0,
        maxLtvPct: 80
      };
      console.log('[usePosition] Setting default position:', defaultPosition);
      setPos(defaultPosition);
    } finally {
      setLoading(false);
    }
  }, [address, tokenAddress, poolAddress]);

  useEffect(() => { 
    refresh(); 
  }, [refresh]);

  return { loading, pos, refresh };
}
