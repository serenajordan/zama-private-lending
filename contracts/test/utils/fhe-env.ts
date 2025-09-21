import { ethers } from "hardhat";

/**
 * Try to init fhEVM; if unavailable, skip the suite gracefully.
 * Returns the fhevmjs instance or null (when skipped).
 */
export async function maybeInitFHEVMOrSkip(ctx: Mocha.Context): Promise<any | null> {
  let createInstance: any;
  try {
    // Lazy import so Node doesn't resolve fhevmjs when not installed
    ({ createInstance } = await import("fhevmjs"));
  } catch (e) {
    ctx.skip(); // fhevmjs package not present on CI
    return null;
  }
  try {
    const instance = await createInstance({ provider: ethers.provider });
    return instance;
  } catch (e) {
    ctx.skip(); // running on non-fhEVM chain
    return null;
  }
}
