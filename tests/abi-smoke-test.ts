import { encodeFunctionData } from 'viem';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load ABI JSON by relative path from app/
function loadAbi(relPathFromApp: string) {
  const root = path.resolve(__dirname, '..');
  const appDir = path.join(root, 'app');
  const full = path.join(appDir, relPathFromApp);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  return json.abi as any[]; // ABI array is nested under 'abi' property
}

// Locate a function by name that accepts a single uint argument
function findUintFn(abi: any[], names: string[]) {
  for (const name of names) {
    const entry = abi.find(
      (f: any) =>
        f?.type === 'function' &&
        f?.name === name &&
        Array.isArray(f.inputs) &&
        f.inputs.length === 1 &&
        /^u?int(256|64|32|16|8)?$/.test(f.inputs[0]?.type ?? '')
    );
    if (entry) return entry.name;
  }
  return null;
}

// Encode helper for a single-uint function
function encodeSingleUint(abi: any[], fnName: string, value: bigint) {
  return encodeFunctionData({
    abi,
    functionName: fnName,
    args: [value],
  });
}

async function runTests() {
  console.log('🧪 Running ABI encode smoke tests...\n');

  try {
    // Test token faucet encoding
    console.log('📝 Testing token faucet encoding...');
    const tokenAbi = loadAbi('abis/ConfidentialUSD.json');
    const fn = findUintFn(tokenAbi, ['faucet', 'mint']);
    if (!fn) {
      throw new Error('Expected a single-uint faucet-like function');
    }
    const data = encodeSingleUint(tokenAbi, fn, 1000000n);
    if (!data.startsWith('0x')) {
      throw new Error('Expected encoded data to start with 0x');
    }
    console.log(`✅ Token faucet encoding successful: ${data.substring(0, 10)}...`);

    // Test pool functions encoding
    console.log('📝 Testing pool deposit/borrow/repay encoding...');
    const poolAbi = loadAbi('abis/PrivateLendingPool.json');

    const deposit = findUintFn(poolAbi, ['deposit']);
    const borrow = findUintFn(poolAbi, ['borrow']);
    const repay = findUintFn(poolAbi, ['repay']);

    if (!deposit) throw new Error('deposit(uint) missing');
    if (!borrow) throw new Error('borrow(uint) missing');
    if (!repay) throw new Error('repay(uint) missing');

    const d = encodeSingleUint(poolAbi, deposit, 1000000n);
    const b = encodeSingleUint(poolAbi, borrow, 1000000n);
    const r = encodeSingleUint(poolAbi, repay, 1000000n);

    if (!d.startsWith('0x')) throw new Error('Deposit encoding failed');
    if (!b.startsWith('0x')) throw new Error('Borrow encoding failed');
    if (!r.startsWith('0x')) throw new Error('Repay encoding failed');

    console.log(`✅ Pool deposit encoding successful: ${d.substring(0, 10)}...`);
    console.log(`✅ Pool borrow encoding successful: ${b.substring(0, 10)}...`);
    console.log(`✅ Pool repay encoding successful: ${r.substring(0, 10)}...`);

    console.log('\n🎉 All ABI encode smoke tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ABI encode smoke test failed:', error);
    process.exit(1);
  }
}

runTests();
