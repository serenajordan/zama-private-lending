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

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${url}/health`, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return false;
    // Many relayers return { ok: true } or 200/"ok"
    return true;
  } catch (e) {
    console.warn("[relayer] health check failed", e);
    return false;
  } finally {
    clearTimeout(t);
  }
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
  console.info('[relayer] Using relayer URL:', RELAYER_URL);
  const relayer = await getRelayer();
  const buf = relayer.createEncryptedInput(contract, user);
  buf.add64(value);
  return await buf.encrypt(); // -> { handles, inputProof }
}