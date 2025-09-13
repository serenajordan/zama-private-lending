let instancePromise: any | null = null;

// Normalize relayer URL - trim whitespace and remove trailing slashes
export const RELAYER_URL = (process.env.NEXT_PUBLIC_RELAYER_URL || '').trim().replace(/\/+$/, '');

async function ensurePolyfills() {
  // Some libs expect Node globals in the browser
  // @ts-ignore
  if (typeof (globalThis as any).global === "undefined") (globalThis as any).global = globalThis as any;
  // @ts-ignore
  if (typeof (globalThis as any).process === "undefined") (globalThis as any).process = { env: {} } as any;
}

export async function getRelayer() {
  if (typeof window === "undefined") throw new Error("Relayer can only be used in the browser");
  if (!instancePromise) {
    await ensurePolyfills();
    const { createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/web");
    instancePromise = createInstance(SepoliaConfig);
  }
  return instancePromise;
}
export async function relayerHealthy(url?: string): Promise<boolean> {
  const targetUrl = url || RELAYER_URL;
  if (!targetUrl) {
    console.warn('[relayer] No relayer URL configured');
    return false;
  }
  
  try {
    const response = await fetch(`${targetUrl}/health`);
    return response.ok;
  } catch (error) {
    console.warn('[relayer] Health check failed:', error);
    return false;
  }
}

export async function register(): Promise<void> {
  const relayer = await getRelayer();
  await relayer.register();
}

// Back-compat alias used by older components
export async function relayerRegister(): Promise<void> {
  return register();
}

// value must be uint64 in micro-units (bigint)
export async function encryptU64(contract: string, user: string, value: bigint) {
  console.info('[relayer] Using relayer URL:', RELAYER_URL);
  const relayer = await getRelayer();
  const buf = relayer.createEncryptedInput(contract, user);
  buf.add64(value);
  return await buf.encrypt(); // -> { handles, inputProof }
}