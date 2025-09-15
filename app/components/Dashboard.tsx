"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Info, TrendingUp, TrendingDown, Minus, DollarSign, PiggyBank, CreditCard, Shield } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { ActionsPanel } from "@/components/actions-panel"
import { ActivityTable } from "@/components/activity-table"
import { useAccount } from "wagmi"
import { usePosition } from "@/hooks/usePosition"
import { relayerHealthy, RELAYER_URL } from "@/lib/relayer"
import { useEffect } from "react"

function KPICard({
  title,
  value,
  unit,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string
  value: string | number
  unit?: string
  change?: number
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ElementType
  description?: string
}) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600 dark:text-green-400"
      case "negative":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />
      case "negative":
        return <TrendingDown className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
              </div>
              {change !== undefined && (
                <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span>
                    {change > 0 ? "+" : ""}
                    {change}%
                  </span>
                  <span className="text-muted-foreground">24h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HealthStatus({ health }: { health: number }) {
  const getHealthColor = (health: number) => {
    if (health >= 80) return "text-green-600 dark:text-green-400"
    if (health >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getHealthBgColor = (health: number) => {
    if (health >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (health >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getHealthStatus = (health: number) => {
    if (health >= 80) return "Healthy"
    if (health >= 60) return "Moderate"
    return "At Risk"
  }

  const getHealthIcon = (health: number) => {
    if (health >= 80) return <TrendingUp className="w-4 h-4" />
    if (health >= 60) return <Minus className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Account Health</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Account health indicates your position safety. Below 50% may trigger liquidation.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${getHealthBgColor(health)}`}>
                  <span className={getHealthColor(health)}>{getHealthIcon(health)}</span>
                  <span className={`text-sm font-medium ${getHealthColor(health)}`}>{getHealthStatus(health)}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-2xl font-bold ${getHealthColor(health)}`}>{health}%</p>
              </div>
              <Progress value={health} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { isConnected } = useAccount()
  const { loading, pos } = usePosition()
  const contractAddresses = {
    token: process.env.NEXT_PUBLIC_TOKEN || "0x0000000000000000000000000000000000000000",
    pool: process.env.NEXT_PUBLIC_POOL || "0x0000000000000000000000000000000000000000",
  }
  const disabled = !isConnected

  // Health check on load
  useEffect(() => {
    let on = true;
    (async () => {
      const effectiveUrl = RELAYER_URL ?? "(none)";
      console.log("[relayer] checking health for URL:", effectiveUrl);
      
      const ok = await relayerHealthy();
      if (on) {
        console.log("[relayer] health check result:", ok ? "✅ healthy" : "❌ unhealthy", "| URL:", effectiveUrl);
        if (!ok && effectiveUrl !== "(none)") {
          console.warn("[relayer] relayer is unhealthy - actions will be disabled");
        }
      }
    })();
    return () => { on = false; };
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dashboard Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Token Contract</p>
                  <p className="text-xs text-muted-foreground font-mono">{contractAddresses.token}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(contractAddresses.token)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Pool Contract</p>
                  <p className="text-xs text-muted-foreground font-mono">{contractAddresses.pool}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(contractAddresses.pool)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Token Balance"
              value={pos?.balance ?? '0.00'}
              unit="cUSD"
              change={0}
              changeType="positive"
              icon={DollarSign}
              description="Your current token balance available for transactions"
            />

            <KPICard
              title="Total Deposits"
              value={pos?.deposits ?? '0.00'}
              unit="cUSD"
              change={0}
              changeType="positive"
              icon={PiggyBank}
              description="Total amount deposited as collateral in the lending pool"
            />

            <KPICard
              title="Total Debt"
              value={pos?.debt ?? '0.00'}
              unit="cUSD"
              change={0}
              changeType="negative"
              icon={CreditCard}
              description="Outstanding borrowed amount that needs to be repaid"
            />

            <HealthStatus health={pos?.healthPct ?? 100} />
          </div>

          {/* LTV Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Loan-to-Value Ratio
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>LTV represents the ratio of your debt to collateral value</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max LTV</p>
                  <p className="text-xl font-bold">{pos?.maxLtvPct ?? 80}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current LTV</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{pos?.ltvPct.toFixed(1) ?? '0.0'}%</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={pos?.ltvPct ?? 0} max={pos?.maxLtvPct ?? 80} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Safe Zone</span>
                  <span>Liquidation Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-12" disabled={disabled}>
                  {disabled ? "Connect wallet" : "Deposit"}
                </Button>
                <Button variant="outline" className="h-12 bg-transparent" disabled={disabled}>
                  {disabled ? "Connect wallet" : "Borrow"}
                </Button>
                <Button variant="secondary" className="h-12" disabled={disabled}>
                  {disabled ? "Connect wallet" : "Repay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions Panel */}
        <div className="space-y-6">
          <ActionsPanel />
        </div>
      </div>

      {/* Activity Table */}
      <ActivityTable />
    </div>
  )
}
