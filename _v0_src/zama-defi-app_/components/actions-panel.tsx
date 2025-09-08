"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Fence as Faucet, PiggyBank, CreditCard, RefreshCw, Send, Info, CheckCircle, AlertCircle } from "lucide-react"
import { useEnhancedErrorHandling } from "@/components/enhanced-error-handling"
import { PrivacyModal } from "@/components/privacy-modal"

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
  const { showError, showSuccess, validateAmount, validateBalance, validateLTV } = useEnhancedErrorHandling()
  const [faucetAmount, setFaucetAmount] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [borrowAmount, setBorrowAmount] = useState("")
  const [repayAmount, setRepayAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferAddress, setTransferAddress] = useState("")
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Mock balances for validation
  const mockBalance = 1250
  const mockMaxBorrow = 2400

  const handleFaucet = async () => {
    const amountError = validateAmount(faucetAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    setIsLoading("faucet")
    // Simulate potential relayer offline error
    if (Math.random() < 0.2) {
      setTimeout(() => {
        showError("RELAYER_OFFLINE")
        setIsLoading(null)
      }, 1000)
      return
    }

    setTimeout(() => {
      showSuccess("Tokens Received", `Successfully received ${faucetAmount} cUSD from faucet`)
      setFaucetAmount("")
      setIsLoading(null)
    }, 2000)
  }

  const handleDeposit = async () => {
    const amountError = validateAmount(depositAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(depositAmount, mockBalance)
    if (balanceError) {
      showError(balanceError)
      return
    }

    setIsLoading("deposit")
    setTimeout(() => {
      showSuccess("Deposit Successful", `Deposited ${depositAmount} cUSD as collateral`)
      setDepositAmount("")
      setIsLoading(null)
    }, 2000)
  }

  const handleBorrow = async () => {
    const amountError = validateAmount(borrowAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const ltvError = validateLTV(borrowAmount, mockMaxBorrow)
    if (ltvError) {
      showError(ltvError)
      return
    }

    setIsLoading("borrow")
    setTimeout(() => {
      showSuccess("Borrow Successful", `Borrowed ${borrowAmount} cUSD`)
      setBorrowAmount("")
      setIsLoading(null)
    }, 2000)
  }

  const handleRepay = async () => {
    const amountError = validateAmount(repayAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(repayAmount, mockBalance)
    if (balanceError) {
      showError(balanceError)
      return
    }

    setIsLoading("repay")
    setTimeout(() => {
      showSuccess("Repayment Successful", `Repaid ${repayAmount} cUSD`)
      setRepayAmount("")
      setIsLoading(null)
    }, 2000)
  }

  const handleTransfer = async () => {
    const amountError = validateAmount(transferAmount)
    if (amountError) {
      showError(amountError)
      return
    }

    const balanceError = validateBalance(transferAmount, mockBalance)
    if (balanceError) {
      showError(balanceError)
      return
    }

    if (!transferAddress || transferAddress.length < 10) {
      showError("INVALID_AMOUNT") // Reusing for address validation
      return
    }

    setIsLoading("transfer")
    setTimeout(() => {
      showSuccess(
        "Transfer Successful",
        `Transferred ${transferAmount} cUSD to ${transferAddress.slice(0, 6)}...${transferAddress.slice(-4)}`,
      )
      setTransferAmount("")
      setTransferAddress("")
      setIsLoading(null)
    }, 2000)
  }

  const checkBalance = () => {
    showSuccess("Balance Check", "Current balance: 1,250.00 cUSD")
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
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={checkBalance} className="flex-1 bg-transparent">
              <RefreshCw className="w-3 h-3 mr-1" />
              Check Balance
            </Button>
            <Button onClick={handleFaucet} disabled={isLoading === "faucet"} className="flex-1">
              {isLoading === "faucet" ? "Getting..." : "Get Tokens"}
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
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Deposits are encrypted using FHE</span>
          </div>
          <Button onClick={handleDeposit} disabled={isLoading === "deposit"} className="w-full">
            {isLoading === "deposit" ? "Depositing..." : "Deposit"}
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
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3" />
            <span>Max borrow: 2,400.00 cUSD (80% LTV)</span>
          </div>
          <Button
            onClick={handleBorrow}
            disabled={isLoading === "borrow"}
            variant="outline"
            className="w-full bg-transparent"
          >
            {isLoading === "borrow" ? "Borrowing..." : "Borrow"}
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
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Outstanding debt: 2,100.00 cUSD</span>
          </div>
          <Button onClick={handleRepay} disabled={isLoading === "repay"} variant="secondary" className="w-full">
            {isLoading === "repay" ? "Repaying..." : "Repay"}
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
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Transfers are private and encrypted</span>
          </div>
          <Button onClick={handleTransfer} disabled={isLoading === "transfer"} className="w-full">
            {isLoading === "transfer" ? "Transferring..." : "Transfer"}
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
