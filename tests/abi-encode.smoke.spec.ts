import { test, expect } from '@playwright/test';
import { loadAbi, findUintFn, encodeSingleUint } from './abi-smoke.util';

test.describe('ABI encode smoke', () => {
  test('token faucet encodes', async () => {
    const tokenAbi = loadAbi('abis/ConfidentialUSD.json');
    const fn = findUintFn(tokenAbi, ['faucet', 'mint']); // prefer faucet(uint), else mint(address,uint) is not single-uint
    expect(fn, 'expected a single-uint faucet-like function').toBeTruthy();
    const data = encodeSingleUint(tokenAbi, fn!, 1000000n);
    expect(data.startsWith('0x')).toBe(true);
  });

  test('pool deposit/borrow/repay encodes', async () => {
    const poolAbi = loadAbi('abis/PrivateLendingPool.json');

    const deposit = findUintFn(poolAbi, ['deposit']);
    const borrow  = findUintFn(poolAbi, ['borrow']);
    const repay   = findUintFn(poolAbi, ['repay']);

    expect(deposit, 'deposit(uint) missing').toBeTruthy();
    expect(borrow,  'borrow(uint) missing').toBeTruthy();
    expect(repay,   'repay(uint) missing').toBeTruthy();

    const d = encodeSingleUint(poolAbi, deposit!, 1000000n);
    const b = encodeSingleUint(poolAbi, borrow!,  1000000n);
    const r = encodeSingleUint(poolAbi, repay!,   1000000n);

    expect(d.startsWith('0x')).toBe(true);
    expect(b.startsWith('0x')).toBe(true);
    expect(r.startsWith('0x')).toBe(true);
  });
});