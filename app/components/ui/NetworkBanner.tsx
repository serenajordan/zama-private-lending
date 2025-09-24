"use client"

import { useAccount, useSwitchChain } from 'wagmi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { CHAIN_ID } from '@/lib/env'

export default function NetworkBanner() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()

  if (!chain || chain.id === CHAIN_ID) {
    return null
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Wrong network. Please switch to fhEVM Sepolia (Chain ID: {CHAIN_ID}).
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => switchChain({ chainId: CHAIN_ID })}
          className="ml-4"
        >
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  )
}
