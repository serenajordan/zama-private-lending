"use client"

import { useState } from "react"
import AppHeader from "@/components/AppHeader"
import StatCard from "@/components/StatCard"
import HealthCard from "@/components/HealthCard"
import MarketsTable from "@/components/MarketsTable"
import ActionModal from "@/components/ActionModal"
import ViewerKeyEmpty from "@/components/ViewerKeyEmpty"
import PortfolioList from "@/components/PortfolioList"
import { DollarSign, TrendingUp, Users, Zap } from "lucide-react"

// Mock data for demonstration
const mockMarkets = [
  {
    asset: { symbol: "ETH", name: "Ethereum", icon: "" },
    supplyAPR: 4.25,
    totalSupply: "$2.4B",
    utilization: 75,
  },
  {
    asset: { symbol: "USDC", name: "USD Coin", icon: "" },
    supplyAPR: 2.15,
    totalSupply: "$1.8B",
    utilization: 85,
  },
  {
    asset: { symbol: "BTC", name: "Bitcoin", icon: "" },
    supplyAPR: 3.45,
    totalSupply: "$950M",
    utilization: 65,
  },
]

const mockPositions = [
  {
    asset: { symbol: "ETH", name: "Ethereum" },
    type: "supply" as const,
    amount: "2.45 ETH",
    value: "5,890.50",
    apy: 4.25,
    isProfit: true,
  },
  {
    asset: { symbol: "USDC", name: "USD Coin" },
    type: "borrow" as const,
    amount: "1,500 USDC",
    value: "1,500.00",
    apy: 5.75,
    isProfit: false,
  },
]

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"deposit" | "borrow" | "repay">("deposit")
  const [selectedToken, setSelectedToken] = useState("")
  const [hasViewerKey, setHasViewerKey] = useState(false)

  const handleSupply = (symbol: string) => {
    setSelectedToken(symbol)
    setModalMode("deposit")
    setModalOpen(true)
  }

  const handleBorrow = (symbol: string) => {
    setSelectedToken(symbol)
    setModalMode("borrow")
    setModalOpen(true)
  }

  const handleConfirm = async (amount: string) => {
    console.log(`${modalMode} ${amount} ${selectedToken}`)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const handleAddViewerKey = () => {
    setHasViewerKey(true)
  }

  const handleManagePosition = (symbol: string, type: "supply" | "borrow") => {
    setSelectedToken(symbol)
    setModalMode(type === "supply" ? "deposit" : "repay")
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-[#6C63FF]" />}
            label="Total Value Locked"
            value="$5.2B"
            sublabel="24h change"
            trendBadge={{ text: "+2.4%", variant: "default" }}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-[#12B3C7]" />}
            label="Total Borrowed"
            value="$3.8B"
            sublabel="Utilization rate"
            trendBadge={{ text: "73%", variant: "secondary" }}
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-[#6C63FF]" />}
            label="Active Users"
            value="24.5K"
            sublabel="This month"
            trendBadge={{ text: "+12%", variant: "default" }}
          />
          <StatCard
            icon={<Zap className="h-5 w-5 text-[#12B3C7]" />}
            label="Avg APY"
            value="4.2%"
            sublabel="Supply rate"
          />
        </div>

        {/* Health Factor */}
        <div className="mb-8">
          <HealthCard healthFactor={2.45} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Markets Table */}
          <div className="lg:col-span-2">
            <MarketsTable markets={mockMarkets} onSupply={handleSupply} onBorrow={handleBorrow} />
          </div>

          {/* Portfolio or Viewer Key Empty State */}
          {hasViewerKey ? (
            <div className="lg:col-span-2">
              <PortfolioList
                positions={mockPositions}
                hasViewerKey={hasViewerKey}
                onAddViewerKey={handleAddViewerKey}
                onManagePosition={handleManagePosition}
              />
            </div>
          ) : (
            <div className="lg:col-span-2">
              <ViewerKeyEmpty onAddViewerKey={handleAddViewerKey} />
            </div>
          )}
        </div>
      </main>

      {/* Action Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        tokenSymbol={selectedToken}
        onConfirm={handleConfirm}
        maxAmount="1000"
        balance="2500"
      />
    </div>
  )
}
