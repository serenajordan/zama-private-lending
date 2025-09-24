"use client"

import * as React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Fence as Faucet, PiggyBank, CreditCard, RefreshCw, Send, Info, CheckCircle, AlertCircle } from "lucide-react"
import { useEnhancedErrorHandling } from "@/components/enhanced-error-handling"
import { PrivacyModal } from "@/components/privacy-modal"
// import { useAccount } from "wagmi"
// import { useActions } from "@/hooks/useActions"
import { env } from "@/lib/env"
import { useViewer } from "@/hooks/useViewer"
import { usePoolWrite, PoolFns, useTokenWrite, tokenHasFunction } from "@/lib/contracts"
import { encryptAmount64, hasFHEVM } from "@/lib/fhe"
import { usePosition } from "@/hooks/usePosition"
import { toast } from "sonner"
import { relayerHealthy } from "@/lib/relayer"

interface ActionCardProps {
  title: string
  description: string
  icon: React.ElementType
  children: React.ReactNode
}

function ActionCard({ title, description, icon: Icon, children }: ActionCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

export function ActionsPanel() {
  const { isConnected, address } = require('wagmi').useAccount()
  const { showError, showSuccess, validateAmount, validateBalance, validateLTV } = useEnhancedErrorHandling()
  const [busy, setBusy] = useState<string | null>(null)
  const { pos, refresh } = usePosition()
  const [faucetAmount, setFaucetAmount] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [repayAmount, setRepayAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [isRelayerHealthy, setIsRelayerHealthy] = useState(true)

  // Check relayer health
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await relayerHealthy();
      setIsRelayerHealthy(isHealthy);
    };
    checkHealth();
  }, []);
  const [transferAddress, setTransferAddress] = useState("")

  const disabled = !isConnected || !isRelayerHealthy


  const { writeAsync: tokenWrite } = useTokenWrite("")
  const { writeAsync: poolWrite } = usePoolWrite("")

  const withBusy = async (label: string, fn: () => Promise<void>) => {
    setBusy(label)
    try { await fn() } finally { setBusy(null) }
  }

  const handleFaucet = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to use faucet")
      return
    }

    const amountError = validateAmount(faucetAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    try {
      await withBusy('faucet', async () => {
        if (tokenHasFunction("faucet")) {
          await tokenWrite([BigInt(1_000_000)])
        } else if (tokenHasFunction("mint")) {
          await tokenWrite([address, BigInt(1_000_000)])
        } else {
          toast.error("No faucet on this network")
          return
        }
      })
      setFaucetAmount("")
      // Refresh immediately and then again after a delay to ensure updates
      await refresh()
      setTimeout(async () => {
        await refresh()
      }, 2000)
    } catch (error) {
      // Error handling is done in useActions hook
    }
  }

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to deposit")
      return
    }

    const amountError = validateAmount(depositAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(depositAmount, parseFloat(pos?.balance ?? '0'))
    if (balanceError) {
      showError(balanceError)
      return
    }

    try {
      await withBusy('deposit', async () => {
        if (!address) throw new Error('Connect wallet')
        if (env.demo || !(await hasFHEVM(window.ethereum))) {
          toast.success(`Demo deposit of ${depositAmount}`)
          return
        }
        const { encryptedInput, proof } = await encryptAmount64(depositAmount, address)
        const fn = PoolFns.deposit
        if (!fn) throw new Error('Deposit function not found')
        await poolWrite([encryptedInput, proof])
      })
      setDepositAmount("")
      // Refresh immediately and then again after a delay to ensure updates
      await refresh()
      setTimeout(async () => {
        await refresh()
      }, 2000)
    } catch (error) {
      // Error handling is done in useActions hook
    }
  }

  const handleBorrow = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to borrow")
      return
    }

    const amountError = validateAmount(borrowAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    // Calculate max borrow based on deposits and LTV
    const maxBorrow = pos ? parseFloat(pos.deposits) * (pos.maxLtvPct / 100) - parseFloat(pos.debt) : 0
    const ltvError = validateLTV(borrowAmount, maxBorrow)
    if (ltvError) {
      showError(ltvError)
      return
    }

    try {
      await withBusy('borrow', async () => {
        if (!address) throw new Error('Connect wallet')
        if (env.demo || !(await hasFHEVM(window.ethereum))) {
          toast.success(`Demo borrow of ${borrowAmount}`)
          return
        }
        const { encryptedInput, proof } = await encryptAmount64(borrowAmount, address)
        const fn = PoolFns.borrow
        if (!fn) throw new Error('Borrow function not found')
        await poolWrite([encryptedInput, proof])
      })
      setBorrowAmount("")
      // Refresh immediately and then again after a delay to ensure updates
      await refresh()
      setTimeout(async () => {
        await refresh()
      }, 2000)
    } catch (error) {
      // Error handling is done in useActions hook
    }
  }

  const handleRepay = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to repay")
      return
    }

    const amountError = validateAmount(repayAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(repayAmount, parseFloat(pos?.balance ?? '0'))
    if (balanceError) {
      showError(balanceError)
      return
    }

    try {
      await withBusy('repay', async () => {
        if (!address) throw new Error('Connect wallet')
        if (env.demo || !(await hasFHEVM(window.ethereum))) {
          toast.success(`Demo repay of ${repayAmount}`)
          return
        }
        const { encryptedInput, proof } = await encryptAmount64(repayAmount, address)
        const fn = PoolFns.repay
        if (!fn) throw new Error('Repay function not found')
        await poolWrite([encryptedInput, proof])
      })
      setRepayAmount("")
      // Refresh immediately and then again after a delay to ensure updates
      await refresh()
      setTimeout(async () => {
        await refresh()
      }, 2000)
    } catch (error) {
      // Error handling is done in useActions hook
    }
  }

  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error("Connect wallet to transfer")
      return
    }

    const amountError = validateAmount(transferAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(transferAmount, parseFloat(pos?.balance ?? '0'))
    if (balanceError) {
      showError(balanceError)
      return
    }

    if (!transferAddress || transferAddress.length < 10) {
      showError("INVALID_AMOUNT") // Reusing for address validation
      return
    }

    // Transfer functionality would need to be implemented in useActions
    toast.info("Transfer functionality not yet implemented")
  }

  const checkBalance = async () => {
    await refresh()
    toast.success("Balance refreshed")
  }

  return (
    <div className="space-y-4">
      {/* Faucet */}
      <ActionCard title="Faucet" description="Get test tokens for development" icon={Faucet}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="faucet-amount">Amount (cUSD)</Label>
            <Input
              id="faucet-amount"
              type="number"
              placeholder="100.00"
              value={faucetAmount}
              onChange={(e) => setFaucetAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={disabled}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={checkBalance} disabled={disabled} className="flex-1 bg-transparent">
              <RefreshCw className="w-3 h-3 mr-1" />
              Check Balance
            </Button>
            <Button onClick={handleFaucet} disabled={disabled || busy === "faucet"} className="flex-1">
              {busy === "faucet" ? "Getting..." : !isConnected ? "Connect wallet" : !isRelayerHealthy ? "Relayer offline" : "Get Tokens"}
            </Button>
          </div>
        </div>
      </ActionCard>

      <Separator />

      {/* Deposit */}
      <ActionCard title="Deposit" description="Add collateral to increase borrowing power" icon={PiggyBank}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (cUSD)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Deposits are encrypted using FHE</span>
          </div>
          <Button onClick={handleDeposit} disabled={disabled || busy === "deposit"} className="w-full">
            {busy === "deposit" ? "Depositing..." : !isConnected ? "Connect wallet to deposit" : !isRelayerHealthy ? "Relayer offline" : "Deposit"}
          </Button>
        </div>
      </ActionCard>

      {/* Borrow */}
      <ActionCard title="Borrow" description="Borrow against your collateral" icon={CreditCard}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="borrow-amount">Amount (cUSD)</Label>
            <Input
              id="borrow-amount"
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            <span>Max borrow: {pos ? (parseFloat(pos.deposits) * (pos.maxLtvPct / 100) - parseFloat(pos.debt)).toFixed(2) : '0.00'} cUSD ({pos?.maxLtvPct ?? 80}% LTV)</span>
          </div>
          <Button
            onClick={handleBorrow}
            disabled={disabled || busy === "borrow"}
            variant="outline"
            className="w-full bg-transparent"
          >
            {busy === "borrow" ? "Borrowing..." : !isConnected ? "Connect wallet to borrow" : !isRelayerHealthy ? "Relayer offline" : "Borrow"}
          </Button>
        </div>
      </ActionCard>

      {/* Repay */}
      <ActionCard title="Repay" description="Repay your outstanding debt" icon={CheckCircle}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="repay-amount">Amount (cUSD)</Label>
            <Input
              id="repay-amount"
              type="number"
              placeholder="0.00"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Outstanding debt: {pos?.debt ?? '0.00'} cUSD</span>
          </div>
          <Button onClick={handleRepay} disabled={disabled || busy === "repay"} variant="secondary" className="w-full">
            {busy === "repay" ? "Repaying..." : !isConnected ? "Connect wallet to repay" : !isRelayerHealthy ? "Relayer offline" : "Repay"}
          </Button>
        </div>
      </ActionCard>

      <Separator />

      {/* Transfer */}
      <ActionCard title="Transfer" description="Send tokens to another address" icon={Send}>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="transfer-address">Recipient Address</Label>
            <Input
              id="transfer-address"
              placeholder="0x..."
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Amount (cUSD)</Label>
            <Input
              id="transfer-amount"
              type="number"
              placeholder="0.00"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              step="0.01"
              min="0"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Transfers are private and encrypted</span>
          </div>
          <Button onClick={handleTransfer} disabled={disabled} className="w-full">
            {!isConnected ? "Connect wallet to transfer" : !isRelayerHealthy ? "Relayer offline" : "Transfer"}
          </Button>
        </div>
      </ActionCard>

      <PrivacyModal>
        <Card className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Privacy Protection</p>
                <p className="text-xs text-muted-foreground">
                  All transactions are encrypted on-chain using Fully Homomorphic Encryption (FHE). Click to learn more
                  about how your privacy is protected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PrivacyModal>
    </div>
  )
}
