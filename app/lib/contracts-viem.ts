import { createPublicClient, createWalletClient, http, type Abi, type Address, getContract } from "viem"
import { useCallback, useMemo, useState } from "react"
import { sepolia } from "viem/chains"
import { env, requireEnvAddresses } from "@/lib/env"

// Import ABIs from existing JSONs
import PoolAbi from "@/abis/PrivateLendingPool.json"
import TokenAbi from "@/abis/ConfidentialUSD.json"

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(env.rpcUrl || undefined),
})

export function getWalletClient() {
  if (typeof window === "undefined") return undefined
  // @ts-ignore
  const ethereum = window.ethereum
  if (!ethereum) return undefined
  return createWalletClient({ chain: sepolia, transport: http(env.rpcUrl || undefined) })
}

export function detectFunctions(abi: Abi) {
  const names = new Set((abi as any[]).filter((f) => f?.type === "function").map((f) => f.name))
  const find = (candidates: string[]) => candidates.find((n) => names.has(n))
  return {
    deposit: find(["deposit", "depositEncrypted"]),
    borrow: find(["borrow", "borrowEncrypted"]),
    repay: find(["repay", "repayEncrypted"]),
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
  const writeAsync = useCallback(async (args: any[]) => {
    const wallet = getWalletClient()
    if (!wallet) throw new Error("No wallet client")
    setPending(true)
    try {
      const hash = await wallet.writeContract({ address: poolAddress as Address, abi: PoolAbi as Abi, functionName: fn as any, args: args as any })
      return hash
    } finally {
      setPending(false)
    }
  }, [fn, poolAddress])
  return { writeAsync, isPending }
}

export function useTokenWrite(fn: string) {
  const { tokenAddress } = requireEnvAddresses()
  const [isPending, setPending] = useState(false)
  const writeAsync = useCallback(async (args: any[]) => {
    const wallet = getWalletClient()
    if (!wallet) throw new Error("No wallet client")
    setPending(true)
    try {
      const hash = await wallet.writeContract({ address: tokenAddress as Address, abi: TokenAbi as Abi, functionName: fn as any, args: args as any })
      return hash
    } finally {
      setPending(false)
    }
  }, [fn, tokenAddress])
  return { writeAsync, isPending }
}

export function tokenHasFunction(name: string) {
  const names = new Set((TokenAbi as any[]).filter((f) => f?.type === "function").map((f) => f.name))
  return names.has(name)
}


