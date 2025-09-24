import { ethers } from "ethers";
import { getTokenContract, tokenHasFunction } from "@/lib/contracts";
import { getTokenDecimals } from "@/lib/tokenMeta";

/**
 * Probes the faucet limit by trying candidate amounts with a static call.
 * Returns { maxHuman, maxUnits, decimals } where:
 *  - maxHuman: string in human units (e.g. "0.005")
 *  - maxUnits: bigint in smallest units
 */
export async function getFaucetMax() {
  const token = getTokenContract();
  const decimals = await getTokenDecimals();

  // Candidates to try (human strings). Adjust as needed.
  const candidates = ["0.001","0.002","0.003","0.005","0.01","0.02","0.05"];

  let lastOk: { human: string, units: bigint } | null = null;

  for (const h of candidates) {
    const human = h.replace(",",".").trim();
    const units = ethers.parseUnits(human, decimals);
    try {
      if (tokenHasFunction('faucet')) {
        await token.simulate.faucet([units]);
      } else if (tokenHasFunction('mint')) {
        // Cannot simulate mint limit generically; assume small allowed
        await token.simulate.mint(["0x0000000000000000000000000000000000000001", units]);
      } else {
        break;
      }
      lastOk = { human, units };
    } catch {
      // first revert means we've hit/over the limit; stop
      break;
    }
  }

  if (!lastOk) {
    // extremely small fallback (should always pass)
    const tiny = "0.0001";
    return {
      maxHuman: tiny,
      maxUnits: ethers.parseUnits(tiny, decimals),
      decimals,
    };
  }

  return { maxHuman: lastOk.human, maxUnits: lastOk.units, decimals };
}
