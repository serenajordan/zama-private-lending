// app/lib/relayer.ts
// Client-only helpers for the FHE relayer
// Uses the WEB build to avoid Node globals.

import { createClient } from '@zama-fhe/relayer-sdk/web';

const BASE = process.env.NEXT_PUBLIC_RELAYER_BASE;

let client:
  | ReturnType<typeof createClient>
  | null = null;

function ensureClient() {
  if (typeof window === 'undefined') {
    throw new Error('[relayer] client must run in the browser');
  }
  if (!BASE) {
    throw new Error('[relayer] NEXT_PUBLIC_RELAYER_BASE is not set');
  }
  if (!client) {
    // NOTE: do NOT use `global` here
    client = createClient({ baseUrl: BASE, fetch: fetch.bind(globalThis) });
  }
  return client!;
}

export async function relayerHealthy(): Promise<boolean> {
  try {
    const c = ensureClient();
    const { publicKey } = await c.getPublicKey();
    console.log('[relayer] health: ok');
    return !!publicKey;
  } catch (e) {
    console.error('[relayer] health check failed:', e);
    return false;
  }
}

export async function encryptU64(value: bigint) {
  const c = ensureClient();
  // FHEVM v0.8 API
  const res = await c.createEncryptedInput({ type: 'u64', value: value.toString() });
  return res.input; // pass this to your contract call
}
