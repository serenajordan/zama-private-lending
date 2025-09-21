import { createInstance } from "fhevmjs";
import { ethers } from "hardhat";

/**
 * Helper to auto-skip encrypted tests when fhEVM is not available
 * @param ctx - Mocha context (this from describe block)
 */
export async function maybeSkipIfNoFHEVM(ctx: Mocha.Context) {
  try {
    await createInstance({ provider: ethers.provider });
  } catch (e) {
    // Not running on fhEVM (CI or local without the precompiles) → skip this suite
    ctx.skip();
  }
}
