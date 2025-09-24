"use client"

import AppHeader from "@/components/ui/AppHeader"
import StatCard from "@/components/ui/StatCard"
import HealthCard from "@/components/ui/HealthCard"
import MarketsTable from "@/components/ui/MarketsTable"
import ActionModal from "@/components/ui/ActionModal"
import ViewerKeyEmpty from "@/components/ui/ViewerKeyEmpty"
import ViewerKeyPanel from "@/components/ui/ViewerKeyPanel"
import PortfolioList from "@/components/ui/PortfolioList"
import FaucetCard from "@/components/ui/FaucetCard"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useViewer } from "@/hooks/useViewer"
import { usePoolWrite, usePoolRead, PoolFns, useTokenWrite, tokenHasFunction } from "@/lib/contracts"
import { encryptAmount64, hasFHEVM, reencryptDecode } from "@/lib/fhe"
import { env } from "@/lib/env"
import { toast } from "sonner"

export default function Home() {
  const [modal, setModal] = useState<{ open: boolean; mode: "deposit" | "borrow" | "repay"; token: string }>({ open: false, mode: "deposit", token: "CUSD" })
  const [showViewerKeyPanel, setShowViewerKeyPanel] = useState(false)
  const [stats, setStats] = useState({ tvl: "$1.23M", collateral: "$420k", debt: "$210k", health: 1.89 })
  const [positions, setPositions] = useState<any[]>([])
  
  const { address, isConnected } = useAccount()
  const { publicKey, publicKeyHash, secretKey, setKeys } = useViewer()

  const { writeAsync: poolWrite, isPending: poolPending } = usePoolWrite("")
  const { writeAsync: tokenWrite, isPending: tokenPending } = useTokenWrite("")

  const markets = [
    { asset: { symbol: "CUSD", name: "Confidential USD" }, supplyAPR: 2.5, totalSupply: "1,200,000", utilization: 42 },
  ]

  // Load portfolio data when viewer key is available
  useEffect(() => {
    if (publicKeyHash && address) {
      loadPortfolioData()
    }
  }, [publicKeyHash, address])

  async function loadPortfolioData() {
    if (!publicKeyHash || !address) return
    
    try {
      // In a real implementation, you'd call peekDeposit/peekDebt here
      // For now, we'll use mock data
      const mockPositions = [
        {
          asset: { symbol: "CUSD", name: "Confidential USD" },
          type: "supply" as const,
          amount: "1,000.00",
          value: "1,000.00",
          apy: 2.5,
          isProfit: true
        }
      ]
      setPositions(mockPositions)
    } catch (error) {
      console.error("Failed to load portfolio:", error)
    }
  }

  async function onConfirm(amount: string) {
    if (!address) {
      toast.error("Please connect your wallet")
      return
    }

    try {
      if (env.demo || !(await hasFHEVM(window.ethereum))) {
        // Demo mode - show success without actual transaction
        toast.success(`Demo ${modal.mode} of ${amount} ${modal.token} successful!`)
        setModal({ open: false, mode: "deposit", token: "CUSD" })
        return
      }

      const { encryptedInput, proof } = await encryptAmount64(amount, address)
      const fn = modal.mode === "deposit" ? PoolFns.deposit : modal.mode === "borrow" ? PoolFns.borrow : PoolFns.repay
      
      if (!fn) {
        throw new Error("Pool function not found in ABI")
      }

      await poolWrite([encryptedInput, proof])
      toast.success(`${modal.mode} transaction submitted!`)
      setModal({ open: false, mode: "deposit", token: "CUSD" })
    } catch (error: any) {
      console.error("Transaction failed:", error)
      
      // Map common errors to user-friendly messages
      if (error.message?.includes("Borrow cap exceeded")) {
        toast.error("Borrow cap exceeded")
      } else if (error.message?.includes("Health factor too low")) {
        toast.error("Health factor too low")
      } else if (error.message?.includes("Amount exceeds outstanding debt")) {
        toast.error("Amount exceeds outstanding debt")
      } else {
        toast.error(error.message || "Transaction failed")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto space-y-6 px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="TVL" value={stats.tvl} />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Collateral" value={stats.collateral} />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Debt" value={stats.debt} />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Health" value={stats.health.toString()} />
        </div>

        {/* Health Card */}
        <HealthCard healthFactor={stats.health} />

        {/* Faucet Card */}
        <FaucetCard />

        {/* Markets Table */}
        <MarketsTable
          markets={markets}
          onSupply={(token) => setModal({ open: true, mode: "deposit", token })}
          onBorrow={(token) => setModal({ open: true, mode: "borrow", token })}
        />

        {/* Viewer Key Section */}
        {!publicKeyHash && (
          <ViewerKeyEmpty onAddViewerKey={() => setShowViewerKeyPanel(true)} />
        )}

        {/* Portfolio */}
        <PortfolioList
          positions={positions}
          hasViewerKey={!!publicKeyHash}
          onAddViewerKey={() => setShowViewerKeyPanel(true)}
          onManagePosition={(symbol, type) => setModal({ open: true, mode: type === "supply" ? "repay" : "deposit", token: symbol })}
        />

        {/* Modals */}
        <ActionModal
          isOpen={modal.open}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
          mode={modal.mode}
          tokenSymbol={modal.token}
          onConfirm={onConfirm}
          maxAmount="1000"
          balance="1000"
        />

        {showViewerKeyPanel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ViewerKeyPanel onClose={() => setShowViewerKeyPanel(false)} />
          </div>
        )}
      </main>
    </div>
  )
}
