// app/lib/relayer.ts
import { toast } from "sonner";

let _sdk: Promise<typeof import('@zama-fhe/relayer-sdk/web')> | null = null
const getSdk = () => (_sdk ??= import('@zama-fhe/relayer-sdk/web'))

export async function relayerHealthy(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const { getPublicKey } = await getSdk()
    const key = await getPublicKey() // throws if unreachable
    return !!key
  } catch (e) {
    console.error('[relayer] health check failed:', e)
    return false
  }
}

export async function encryptU64(value: bigint) {
  const { createEncryptedInput } = await getSdk()
  return createEncryptedInput({ type: 'u64', value })
}
