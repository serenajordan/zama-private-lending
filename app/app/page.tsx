"use client"

import AppHeader from "@/components/ui/AppHeader"
import StatCard from "@/components/ui/StatCard"
import HealthCard from "@/components/ui/HealthCard"
import MarketsTable from "@/components/ui/MarketsTable"
import ActionModal from "@/components/ui/ActionModal"
import ViewerKeyEmpty from "@/components/ui/ViewerKeyEmpty"
import PortfolioList from "@/components/ui/PortfolioList"
import { useState } from "react"
import { useViewer } from "@/hooks/useViewer"
import { usePoolWrite, PoolFns, useTokenWrite, tokenHasFunction } from "@/lib/contracts-viem"
import { encryptAmount64, hasFHEVM } from "@/lib/fhe"

export default function Home() {
  const [modal, setModal] = useState<{ open: boolean; mode: "deposit" | "borrow" | "repay"; token: string }>({ open: false, mode: "deposit", token: "CUSD" })
  const { publicKey, publicKeyHash, secretKey, setKeys } = useViewer()

  const { writeAsync: poolWrite, isPending } = usePoolWrite("")
  const { writeAsync: tokenWrite } = useTokenWrite("")

  const markets = [
    { asset: { symbol: "CUSD", name: "Confidential USD" }, supplyAPR: 2.5, totalSupply: "1,200,000", utilization: 42 },
  ]

  const positions: any[] = []

  async function onConfirm(amount: string) {
    const account = "0x" as const // wagmi would provide in real wiring
    const { encryptedInput, proof } = await encryptAmount64(amount, account)
    const fn = modal.mode === "deposit" ? PoolFns.deposit : modal.mode === "borrow" ? PoolFns.borrow : PoolFns.repay
    if (!fn) throw new Error("Pool function not found in ABI")
    await poolWrite([encryptedInput, proof])
  }

  async function onFaucet() {
    if (tokenHasFunction("faucet")) {
      await tokenWrite([BigInt(1_000_000)])
    } else if (tokenHasFunction("mint")) {
      // requires minter role; if not allowed, this will revert
      await tokenWrite(["0x0000000000000000000000000000000000000000", BigInt(1_000_000)])
    } else {
      alert("No faucet on this network.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="TVL" value="$1.23M" />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Collateral" value="$420k" />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Debt" value="$210k" />
          <StatCard icon={<div className="h-6 w-6 rounded bg-[var(--brand)]" />} label="Health" value="1.89" />
        </div>

        <HealthCard healthFactor={1.89} />

        <MarketsTable
          markets={markets}
          onSupply={(token) => setModal({ open: true, mode: "deposit", token })}
          onBorrow={(token) => setModal({ open: true, mode: "borrow", token })}
        />

        {!publicKeyHash && <ViewerKeyEmpty onAddViewerKey={() => { /* open viewer key modal in future */ }} />}

        <PortfolioList
          positions={positions}
          hasViewerKey={!!publicKeyHash}
          onAddViewerKey={() => {}}
          onManagePosition={(symbol, type) => setModal({ open: true, mode: type === "supply" ? "repay" : "deposit", token: symbol })}
        />

        <ActionModal
          isOpen={modal.open}
          onClose={() => setModal((m) => ({ ...m, open: false }))}
          mode={modal.mode}
          tokenSymbol={modal.token}
          onConfirm={onConfirm}
          maxAmount="1000"
          balance="1000"
        />
      </main>
    </div>
  )
}
