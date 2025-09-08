import { getToken } from "@/lib/contracts";

let _decimals: number | null = null;

export async function getTokenDecimals(): Promise<number> {
  if (_decimals !== null) return _decimals;
  const t = await getToken();
  try {
    const d = Number(await t.decimals?.());
    _decimals = Number.isFinite(d) ? d : 18;
  } catch {
    _decimals = 18; // fallback
  }
  return _decimals!;
}
