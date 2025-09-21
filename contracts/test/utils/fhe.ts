import { ethers } from "hardhat";

let fheInstance: any = null;

/**
 * Get or create fhEVM instance for encrypted operations
 * @param provider - Optional ethers provider (defaults to hardhat provider)
 * @returns fhEVM instance or throws if not available
 */
export async function getFheInstance(provider?: any) {
  if (!fheInstance) {
    let createInstance: any;
    try {
      ({ createInstance } = await import("fhevmjs"));
    } catch (e) {
      throw new Error(
        "fhEVM precompiles not available. " +
        "These tests require fhEVM runtime. " +
        "Run with fhEVM-enabled network or skip encrypted tests."
      );
    }
    try {
      fheInstance = await createInstance({ 
        provider: provider || ethers.provider 
      });
    } catch (e) {
      throw new Error(
        "fhEVM precompiles not available. " +
        "These tests require fhEVM runtime. " +
        "Run with fhEVM-enabled network or skip encrypted tests."
      );
    }
  }
  return fheInstance;
}

/**
 * Check if fhEVM is available without creating instance
 * @param provider - Optional ethers provider
 * @returns Promise<boolean>
 */
export async function isFhevmAvailable(provider?: any): Promise<boolean> {
  try {
    const { createInstance } = await import("fhevmjs");
    await createInstance({ provider: provider || ethers.provider });
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset the cached fhEVM instance (useful for testing)
 */
export function resetFheInstance() {
  fheInstance = null;
}
