import { toast } from "sonner";

let instancePromise: any | null = null;

// Single source of truth for URL
export function normalizeUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (!u) return null;
  // add protocol if missing
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  // strip trailing slash
  u = u.replace(/\/+$/, "");
  return u;
}

export const RELAYER_URL = normalizeUrl(process.env.NEXT_PUBLIC_RELAYER_URL ?? null);

// Log warning if no relayer URL is configured
if (!RELAYER_URL && process.env.NODE_ENV === 'development') {
  console.warn('[relayer] no NEXT_PUBLIC_RELAYER_URL configured');
}

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

export async function relayerHealthy(urlOverride?: string, timeoutMs = 3500): Promise<boolean> {
  const url = normalizeUrl(urlOverride) ?? RELAYER_URL;
  if (!url) return false;

  const delays = [250, 500, 1000]; // Exponential backoff delays in ms
  
  for (let attempt = 0; attempt < delays.length; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${url}/health`, { signal: controller.signal, cache: "no-store" });
      if (res.ok) {
        clearTimeout(t);
        return true;
      }
    } catch (e) {
      if (attempt === delays.length - 1) {
        console.warn("[relayer] health check failed after retries:", e);
      }
    } finally {
      clearTimeout(t);
    }

    // Wait before next attempt (except on last attempt)
    if (attempt < delays.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    }
  }

  return false;
}

// Convenience guard to run before encryption/tx calls
export async function ensureRelayerAvailable(): Promise<string> {
  const url = RELAYER_URL;
  if (!url) {
    const msg = "Relayer URL not configured. Set NEXT_PUBLIC_RELAYER_URL in app/.env.local";
    toast.error(msg);
    throw new Error(msg);
  }
  const ok = await relayerHealthy(url);
  if (!ok) {
    const msg = `Relayer unavailable at: ${url}. Check DNS, URL and /health.`;
    toast.error(msg);
    throw new Error(msg);
  }
  return url;
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
  console.info(`[relayer] using ${RELAYER_URL}`);
  
  if (!RELAYER_URL) {
    throw new Error('Relayer unavailable');
  }

  // Verify keys endpoint before proceeding
  try {
    const keysResponse = await fetch(`${RELAYER_URL}/keys/tfhe`, { cache: 'no-store' });
    if (!keysResponse.ok) {
      throw new Error('Relayer unavailable');
    }
  } catch (e) {
    throw new Error('Relayer unavailable');
  }

  const relayer = await getRelayer();
  const buf = relayer.createEncryptedInput(contract, user);
  buf.add64(value);
  return await buf.encrypt(); // -> { handles, inputProof }
}