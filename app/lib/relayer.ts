// app/lib/relayer.ts
import { toast } from "sonner";

// Type definition for the SDK instance
type FhevmInstance = {
  createEncryptedInput: (contractAddress: string, userAddress: string) => {
    add64: (value: bigint) => void;
    encrypt: () => Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }>;
  };
  getPublicKey: () => { publicKeyId: string; publicKey: Uint8Array } | null;
};

let _instance: FhevmInstance | null = null;

function normalizeUrl(u?: string) {
  return (u ?? '').trim().replace(/\/+$/, '');
}

export async function getRelayerInstance(): Promise<FhevmInstance> {
  if (_instance) return _instance;

  // Ensure we're in the browser environment
  if (typeof window === 'undefined') {
    throw new Error('Relayer can only be used in the browser');
  }

  // Add polyfills for browser environment
  if (typeof (globalThis as any).global === 'undefined') {
    (globalThis as any).global = globalThis;
  }
  if (typeof (globalThis as any).process === 'undefined') {
    (globalThis as any).process = { env: {} };
  }

  // Dynamic import to avoid SSR issues
  const { createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/web');
  
  const url = normalizeUrl(process.env.NEXT_PUBLIC_RELAYER_URL);
  const cfg = url ? { ...SepoliaConfig, relayerUrl: url } : SepoliaConfig;

  _instance = await createInstance(cfg);
  return _instance!;
}

/**
 * Returns true if the relayer can be initialized and keys can be accessed.
 * This replaces the old `/health` fetch which 404s/cors-blocks.
 */
export async function relayerHealthy(): Promise<boolean> {
  try {
    // Skip health check on server side
    if (typeof window === 'undefined') {
      return false;
    }
    
    const inst = await getRelayerInstance();
    // Touch a key path to ensure the relayer handshake works.
    // Try to get public key to verify connectivity
    const publicKey = inst.getPublicKey();
    return publicKey !== null;
  } catch (e) {
    console.warn('[relayer] unhealthy:', e);
    return false;
  }
}

/**
 * Encrypt a decimal amount as U64 using the relayer SDK.
 * @param amount decimal value as string | number
 * @param decimals token decimals (e.g. 2 for cUSD like "cents")
 */
export async function encryptU64(amount: string | number, decimals: number) {
  // Ensure we're in the browser environment
  if (typeof window === 'undefined') {
    throw new Error('Encryption can only be performed in the browser');
  }
  
  const inst = await getRelayerInstance();
  // Scale into integer minor units
  const mul = BigInt(Math.pow(10, decimals));
  const n = typeof amount === 'string' ? Number(amount) : amount;
  const minorUnits = BigInt(Math.round(n * Number(mul)));
  
  // Create encrypted input for a dummy contract and user (we'll use the legacy method for now)
  const contractAddress = process.env.NEXT_PUBLIC_POOL || "0x0000000000000000000000000000000000000000";
  const userAddress = "0x0000000000000000000000000000000000000000"; // Dummy address
  const buf = inst.createEncryptedInput(contractAddress, userAddress);
  buf.add64(minorUnits);
  return await buf.encrypt();
}

// Convenience guard to run before encryption/tx calls
export async function ensureRelayerAvailable(): Promise<void> {
  const ok = await relayerHealthy();
  if (!ok) {
    const msg = 'Relayer unavailable. Check your connection and relayer configuration.';
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function register(): Promise<void> {
  const relayer = await getRelayerInstance();
  // The register method might not exist in the new SDK
  // For now, we'll just ensure the instance is created
  console.log('[relayer] instance created successfully');
}

// Back-compat alias used by older components
export async function relayerRegister(): Promise<void> {
  return register();
}

// Legacy function for backward compatibility - now uses the new encryptU64
export async function encryptU64Legacy(contract: string, user: string, value: bigint) {
  console.info(`[relayer] using legacy encryptU64 with contract: ${contract}, user: ${user}`);
  
  const inst = await getRelayerInstance();
  const buf = inst.createEncryptedInput(contract, user);
  buf.add64(value);
  return await buf.encrypt(); // -> { handles, inputProof }
}