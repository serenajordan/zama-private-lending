import { env } from "@/lib/env"

export function toScaled(value: bigint | number | string): bigint {
  if (typeof value === "bigint") return value
  if (typeof value === "number") return BigInt(Math.trunc(value))
  return BigInt(value)
}

export async function hasFHEVM(provider: any): Promise<boolean> {
  try {
    // Basic feature detection; provider optional
    // Avoid importing fhevmjs here to keep it lazy elsewhere
    return !!provider && !env.demo
  } catch {
    return false
  }
}

async function importFHEVM() {
  // Avoid static resolution so CI/vanilla envs don't need the package
  try {
    const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<any>
    return await dynamicImport("fhevmjs")
  } catch (e) {
    throw new Error("fhevmjs not available in this environment")
  }
}

export async function encryptAmount64(value: bigint | number | string, account: string): Promise<{ encryptedInput: string; proof: string }> {
  const { createInstance } = await importFHEVM()
  const inst = await createInstance({})
  const input = inst.createEncryptedInput(account)
  input.add64(toScaled(value))
  const { encryptedInput, proof } = input.encrypt()
  return { encryptedInput, proof }
}

// DEV ONLY helpers
export async function reencryptDecode(bytes: string, secretKey?: string): Promise<string> {
  const { createInstance } = await importFHEVM()
  const inst = await createInstance({})
  return inst.reencrypt(bytes, secretKey)
}

export async function publicKeyHash(pubKey: string): Promise<`0x${string}`> {
  const { createInstance } = await importFHEVM()
  const inst = await createInstance({})
  return inst.getPublicKeyHash(pubKey)
}


