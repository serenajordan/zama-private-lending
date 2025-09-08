import { ethers } from "ethers";

// Max for uint64
export const U64_MAX = 18446744073709551615n;

// Normalize a human string like "0,001" or "0.001" to uint64 micro-units (6 decimals)
export function toU64Micro(input: string): bigint {
  if (!input) throw new Error("Enter an amount");
  const s = input.replace(",", ".").trim();
  const v = ethers.parseUnits(s, 6);
  if (v < 0n) throw new Error("Amount must be positive");
  if (v > U64_MAX) throw new Error("Amount too large for uint64");
  return v;
}

// Format a u64 micro value for display (e.g., dashboard)
export function fromU64Micro(v: bigint, frac: number = 6): string {
  return ethers.formatUnits(v, frac);
}
