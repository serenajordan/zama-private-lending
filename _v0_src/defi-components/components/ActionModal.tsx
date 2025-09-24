"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "deposit" | "borrow" | "repay"
  tokenSymbol: string
  onConfirm: (amount: string) => void
  maxAmount?: string
  balance?: string
}

export default function ActionModal({
  isOpen,
  onClose,
  mode,
  tokenSymbol,
  onConfirm,
  maxAmount = "0",
  balance = "0",
}: ActionModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleMaxClick = () => {
    setAmount(maxAmount)
  }

  const handleConfirm = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return

    setIsLoading(true)
    try {
      await onConfirm(amount)
      setAmount("")
      onClose()
    } catch (error) {
      console.error("Transaction failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isValidAmount =
    amount && Number.parseFloat(amount) > 0 && Number.parseFloat(amount) <= Number.parseFloat(maxAmount)
  const exceedsBalance = amount && Number.parseFloat(amount) > Number.parseFloat(maxAmount)

  const getModalTitle = () => {
    switch (mode) {
      case "deposit":
        return `Supply ${tokenSymbol}`
      case "borrow":
        return `Borrow ${tokenSymbol}`
      case "repay":
        return `Repay ${tokenSymbol}`
    }
  }

  const getHelperText = () => {
    switch (mode) {
      case "deposit":
        return `Available to supply: ${maxAmount} ${tokenSymbol}`
      case "borrow":
        return `Available to borrow: ${maxAmount} ${tokenSymbol}`
      case "repay":
        return `Amount to repay: ${maxAmount} ${tokenSymbol}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-white/20 bg-white/90 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Token Info */}
          <div className="flex items-center justify-between rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#12B3C7]" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{tokenSymbol}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getHelperText()}</p>
              </div>
            </div>
            <Badge className="rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] dark:text-[#8B7FFF]">Balance: {balance}</Badge>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl border-white/20 bg-white/50 pr-16 text-lg backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#6C63FF]/20 text-[#6C63FF] hover:bg-[#6C63FF]/30 dark:text-[#8B7FFF]"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Validation Messages */}
          {amount && (
            <div className="flex items-center space-x-2 text-sm">
              {exceedsBalance ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 dark:text-red-400">Insufficient balance</span>
                </>
              ) : isValidAmount ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Valid amount</span>
                </>
              ) : null}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValidAmount || isLoading}
              className="flex-1 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : `Confirm ${mode}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
