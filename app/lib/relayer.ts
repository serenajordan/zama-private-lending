let instancePromise: any | null = null;

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

// value must be uint64 in micro-units (bigint)
export async function encryptU64(contract: string, user: string, value: bigint) {
  const relayer = await getRelayer();
  const buf = relayer.createEncryptedInput(contract, user);
  buf.add64(value);
  return await buf.encrypt(); // -> { handles, inputProof }
}