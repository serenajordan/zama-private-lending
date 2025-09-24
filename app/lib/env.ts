export const env = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111),
  demo: (process.env.NEXT_PUBLIC_DEMO || "0") === "1",
  poolAddress: (process.env.NEXT_PUBLIC_POOL_ADDRESS || process.env.NEXT_PUBLIC_POOL || "").toLowerCase(),
  tokenAddress: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_TOKEN || "").toLowerCase(),
  relayerUrl: process.env.NEXT_PUBLIC_RELAYER_URL || process.env.NEXT_PUBLIC_RELAYER_BASE || "",
}

export function requireEnvAddresses() {
  if (!env.poolAddress) throw new Error("Missing NEXT_PUBLIC_POOL_ADDRESS")
  if (!env.tokenAddress) throw new Error("Missing NEXT_PUBLIC_TOKEN_ADDRESS")
  return { poolAddress: env.poolAddress as `0x${string}`, tokenAddress: env.tokenAddress as `0x${string}` }
}


