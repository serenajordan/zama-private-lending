export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/27eaa0fa2d16479c8395f8ebc73decb5';
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);
export const DEMO = (process.env.NEXT_PUBLIC_DEMO || '0') === '1';
export const POOL_ADDRESS = process.env.NEXT_PUBLIC_POOL || process.env.NEXT_PUBLIC_POOL_ADDRESS || '0x0000000000000000000000000000000000000000';
export const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN || process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
export const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_BASE || process.env.NEXT_PUBLIC_RELAYER_URL || '';
