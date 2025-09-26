import { encodeFunctionData, parseAbiItem } from 'viem';
import fs from 'node:fs';
import path from 'node:path';

// Helper to load ABI JSON by relative path from app/
export function loadAbi(relPathFromApp: string) {
  const root = path.resolve(__dirname, '..');
  const appDir = path.join(root, 'app');
  const full = path.join(appDir, relPathFromApp);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  return json as any[]; // ABI array
}

// Locate a function by name that accepts a single uint argument
export function findUintFn(abi: any[], names: string[]) {
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
export function encodeSingleUint(abi: any[], fnName: string, value: bigint) {
  return encodeFunctionData({
    abi,
    functionName: fnName,
    args: [value],
  });
}