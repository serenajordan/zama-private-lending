"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useAccount, useChainId } from "wagmi"
import { requestFaucet } from "@/lib/contracts"
import { env, CHAIN_ID } from "@/lib/env"
import { Droplets, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function FaucetCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastFaucet, setLastFaucet] = useState<string | null>(null)
  const { address } = useAccount()
  const chainId = useChainId()
  const isWrongNetwork = chainId !== CHAIN_ID

  const handleFaucet = async () => {
    if (!address) {
      toast.error("Please connect your wallet")
      return
    }
    
    if (isWrongNetwork) {
      toast.error("Please switch to the correct network")
      return
    }
    
    setIsLoading(true)
    try {
      const hash = await requestFaucet("1000", address) // 1000 tokens
      setLastFaucet(hash)
      
      toast.success("Faucet successful!", {
        description: (
          <a 
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            View on Explorer <ExternalLink className="h-3 w-3" />
          </a>
        )
      })
    } catch (error: any) {
      console.error("Faucet failed:", error)
      toast.error(error.message || "Faucet failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (env.demo) {
    return (
      <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Demo Faucet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get test tokens for demo mode</p>
            </div>
          </div>
          
          <Button
            onClick={() => alert("Demo mode: Tokens added to your balance!")}
            className="w-full rounded-xl bg-[var(--brand)] hover:opacity-90"
          >
            Get Demo Tokens
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] flex items-center justify-center">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Token Faucet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get test tokens for development</p>
          </div>
        </div>

        {!address && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm">
            Connect your wallet to use the faucet
          </div>
        )}

        {lastFaucet && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 text-green-700 dark:text-green-400 text-sm">
            Faucet successful! Tx: {lastFaucet.slice(0, 10)}...
          </div>
        )}

        <Button
          onClick={handleFaucet}
          disabled={!address || isLoading || isWrongNetwork}
          className="w-full rounded-xl bg-[var(--brand)] hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : isWrongNetwork ? "Wrong Network" : "Get Test Tokens"}
        </Button>
      </div>
    </Card>
  )
}
