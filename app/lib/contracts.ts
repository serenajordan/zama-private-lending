import { createPublicClient, createWalletClient, http, type Abi, type Address, getContract, parseUnits } from "viem"
import { sepolia } from "viem/chains"
import { useCallback, useMemo, useState } from "react"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { env, requireEnvAddresses, CHAIN_ID } from "@/lib/env"
import { encryptAmount64 } from "@/lib/fhe"

// Import ABIs from existing JSONs
import PoolAbi from "@/abis/PrivateLendingPool.json"
import TokenAbi from "@/abis/ConfidentialUSD.json"

// Define custom chain if needed
const customChain = CHAIN_ID !== sepolia.id ? {
  id: CHAIN_ID,
  name: 'fhEVM Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [env.rpcUrl] },
    public: { http: [env.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
} : sepolia

export const publicClient = createPublicClient({
  chain: customChain,
  transport: http(env.rpcUrl),
})

export function getWalletClient() {
  if (typeof window === "undefined") return undefined
  // @ts-ignore
  const ethereum = window.ethereum
  if (!ethereum) return undefined
  return createWalletClient({ 
    chain: customChain, 
    transport: http(env.rpcUrl),
    account: ethereum.selectedAddress as Address
  })
}

export function detectFunctions(abi: Abi) {
  const names = new Set((abi as any[]).filter((f) => f?.type === "function").map((f) => f.name))
  const find = (candidates: string[]) => candidates.find((n) => names.has(n))
  return {
    deposit: find(["deposit", "depositEncrypted"]),
    borrow: find(["borrow", "borrowEncrypted"]),
    repay: find(["repay", "repayEncrypted"]),
    peekDeposit: find(["peekDeposit", "peekUserDeposit"]),
    peekDebt: find(["peekDebt", "peekUserDebt"]),
  } as const
}

export const PoolFns = detectFunctions(PoolAbi as Abi)

export function getPoolContract() {
  const { poolAddress } = requireEnvAddresses()
  return getContract({ address: poolAddress as Address, abi: PoolAbi as Abi, client: publicClient })
}

export function getTokenContract() {
  const { tokenAddress } = requireEnvAddresses()
  return getContract({ address: tokenAddress as Address, abi: TokenAbi as Abi, client: publicClient })
}

export function usePoolRead<TArgs extends any[], TResult = unknown>(fn: string, args: TArgs) {
  const { poolAddress } = requireEnvAddresses()
  const read = useCallback(async () => {
    return publicClient.readContract({ address: poolAddress as Address, abi: PoolAbi as Abi, functionName: fn as any, args: args as any }) as Promise<TResult>
  }, [fn, JSON.stringify(args), poolAddress])
  return { read }
}

export function usePoolWrite(fn: string) {
  const { poolAddress } = requireEnvAddresses()
  const [isPending, setPending] = useState(false)
  const { data: walletClient } = useWalletClient()
  
  const writeAsync = useCallback(async (args: any[]) => {
    if (!walletClient) throw new Error("No wallet client")
    setPending(true)
    try {
      const hash = await walletClient.writeContract({ 
        address: poolAddress as Address, 
        abi: PoolAbi as Abi, 
        functionName: fn as any, 
        args: args as any 
      })
      return hash
    } finally {
      setPending(false)
    }
  }, [fn, poolAddress, walletClient])
  return { writeAsync, isPending }
}

export function useTokenWrite(fn: string) {
  const { tokenAddress } = requireEnvAddresses()
  const [isPending, setPending] = useState(false)
  const { data: walletClient } = useWalletClient()
  
  const writeAsync = useCallback(async (args: any[]) => {
    if (!walletClient) throw new Error("No wallet client")
    setPending(true)
    try {
      const hash = await walletClient.writeContract({ 
        address: tokenAddress as Address, 
        abi: TokenAbi as Abi, 
        functionName: fn as any, 
        args: args as any 
      })
      return hash
    } finally {
      setPending(false)
    }
  }, [fn, tokenAddress, walletClient])
  return { writeAsync, isPending }
}

export function tokenHasFunction(name: string) {
  const names = new Set((TokenAbi as any[]).filter((f) => f?.type === "function").map((f) => f.name))
  return names.has(name)
}

// Encrypted action helpers
export async function depositEncrypted(amount: string, account: string) {
  const { encryptedInput, proof } = await encryptAmount64(amount, account)
  const pool = getPoolContract()
  return pool.write.deposit([encryptedInput, proof])
}

export async function borrowEncrypted(amount: string, account: string) {
  const { encryptedInput, proof } = await encryptAmount64(amount, account)
  const pool = getPoolContract()
  return pool.write.borrow([encryptedInput, proof])
}

export async function repayEncrypted(amount: string, account: string) {
  const { encryptedInput, proof } = await encryptAmount64(amount, account)
  const pool = getPoolContract()
  return pool.write.repay([encryptedInput, proof])
}

// Faucet helper
export async function requestFaucet(amount: string, account: string) {
  const token = getTokenContract()
  const decimals = await token.read.decimals() as number
  const units = parseUnits(amount, decimals)
  
  const hasFaucet = tokenHasFunction('faucet')
  if (hasFaucet) {
    return token.write.faucet([units])
  } else {
    return token.write.mint([units])
  }
}
