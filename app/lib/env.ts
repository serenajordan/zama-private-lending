export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  'http://localhost:8545';

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);
export const DEMO = (process.env.NEXT_PUBLIC_DEMO || '0') === '1';
export const POOL_ADDRESS = process.env.NEXT_PUBLIC_POOL || process.env.NEXT_PUBLIC_POOL_ADDRESS || '0x0000000000000000000000000000000000000000';
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
export const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_BASE || process.env.NEXT_PUBLIC_RELAYER_URL || '';

export const env = {
  rpcUrl: RPC_URL,
  chainId: CHAIN_ID,
  demo: DEMO,
  poolAddress: POOL_ADDRESS.toLowerCase(),
  tokenAddress: TOKEN_ADDRESS.toLowerCase(),
  relayerUrl: RELAYER_URL,
}

export function requireEnvAddresses() {
  if (!env.poolAddress) throw new Error("Missing NEXT_PUBLIC_POOL_ADDRESS")
  if (!env.tokenAddress) throw new Error("Missing NEXT_PUBLIC_TOKEN_ADDRESS")
  return { poolAddress: env.poolAddress as `0x${string}`, tokenAddress: env.tokenAddress as `0x${string}` }
}


