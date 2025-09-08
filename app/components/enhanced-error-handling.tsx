"use client"

import { useToast } from "@/lib/use-toast"

// Enhanced error types for DeFi operations
export type DeFiError =
  | "INVALID_AMOUNT"
  | "AMOUNT_TOO_LARGE_UINT64"
  | "INSUFFICIENT_BALANCE"
  | "INSUFFICIENT_COLLATERAL"
  | "RELAYER_OFFLINE"
  | "NETWORK_ERROR"
  | "TRANSACTION_FAILED"
  | "LIQUIDATION_RISK"
  | "MAX_LTV_EXCEEDED"

interface ErrorConfig {
  title: string
  description: string
  variant: "default" | "destructive"
  action?: {
    label: string
    onClick: () => void
  }
}

const ERROR_CONFIGS: Record<DeFiError, ErrorConfig> = {
  INVALID_AMOUNT: {
    title: "Invalid Amount",
    description: "Please enter a valid amount greater than 0",
    variant: "destructive",
  },
  AMOUNT_TOO_LARGE_UINT64: {
    title: "Amount Too Large",
    description: "Amount exceeds maximum allowed value (uint64 limit). Please enter a smaller amount.",
    variant: "destructive",
  },
  INSUFFICIENT_BALANCE: {
    title: "Insufficient Balance",
    description: "You don't have enough tokens for this transaction",
    variant: "destructive",
  },
  INSUFFICIENT_COLLATERAL: {
    title: "Insufficient Collateral",
    description: "You need to deposit more collateral before borrowing",
    variant: "destructive",
  },
  RELAYER_OFFLINE: {
    title: "Service Unavailable",
    description: "Transaction relayer is offline. Please try again later.",
    variant: "destructive",
  },
  NETWORK_ERROR: {
    title: "Network Error",
    description: "Unable to connect to the network. Check your connection.",
    variant: "destructive",
  },
  TRANSACTION_FAILED: {
    title: "Transaction Failed",
    description: "Your transaction could not be processed. Please try again.",
    variant: "destructive",
  },
  LIQUIDATION_RISK: {
    title: "Liquidation Risk",
    description: "Your position is at risk of liquidation. Consider adding collateral.",
    variant: "destructive",
  },
  MAX_LTV_EXCEEDED: {
    title: "LTV Limit Exceeded",
    description: "This borrow amount would exceed your maximum LTV ratio",
    variant: "destructive",
  },
}

export function useEnhancedErrorHandling() {
  const { toast } = useToast()

  const showError = (errorType: DeFiError, customAction?: () => void) => {
    const config = ERROR_CONFIGS[errorType]

    toast({
      title: config.title,
      description: config.description,
      variant: config.variant,
      action:
        config.action || customAction ? (
          <button onClick={config.action?.onClick || customAction} className="text-sm underline">
            {config.action?.label || "Retry"}
          </button>
        ) : undefined,
    })
  }

  const showSuccess = (title: string, description: string) => {
    toast({
      title,
      description,
      variant: "default",
    })
  }

  // Validation helpers
  const validateAmount = (amount: string): DeFiError | null => {
    const numAmount = Number.parseFloat(amount)

    if (!amount || numAmount <= 0) {
      return "INVALID_AMOUNT"
    }

    // Check for uint64 overflow (approximately 18.4 * 10^18)
    if (numAmount > 18400000000000000000) {
      return "AMOUNT_TOO_LARGE_UINT64"
    }

    return null
  }

  const validateBalance = (amount: string, balance: number): DeFiError | null => {
    const numAmount = Number.parseFloat(amount)

    if (numAmount > balance) {
      return "INSUFFICIENT_BALANCE"
    }

    return null
  }

  const validateLTV = (borrowAmount: string, maxBorrow: number): DeFiError | null => {
    const numAmount = Number.parseFloat(borrowAmount)

    if (numAmount > maxBorrow) {
      return "MAX_LTV_EXCEEDED"
    }

    return null
  }

  return {
    showError,
    showSuccess,
    validateAmount,
    validateBalance,
    validateLTV,
  }
}
