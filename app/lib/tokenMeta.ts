import { getTokenContract } from "@/lib/contracts";

let _decimals: number | null = null;

export async function getTokenDecimals(): Promise<number> {
  if (_decimals !== null) return _decimals;
  const t = getTokenContract();
  try {
    const d = Number(await t.read.decimals());
    _decimals = Number.isFinite(d) ? d : 18;
  } catch {
    _decimals = 18; // fallback
  }
  return _decimals!;
}
