import { ethers } from "ethers";
export const U64_MAX = BigInt("18446744073709551615");

// Normalize "0,02" or "0.02" into uint64 *token units* (decimals read from chain)
export function toU64Units(input: string, decimals: number): bigint {
  if (!input) throw new Error("Enter an amount");
  const s = input.replace(",", ".").trim();
  // NOTE: parseUnits throws on invalid
  const v = ethers.parseUnits(s, decimals); // bigint in smallest token units
  if (v < BigInt(0)) throw new Error("Amount must be positive");
  if (v > U64_MAX) throw new Error("Amount too large for uint64");
  return v;
}

export function fromUnits(v: bigint, decimals: number): string {
  return ethers.formatUnits(v, decimals);
}