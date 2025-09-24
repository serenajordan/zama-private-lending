"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Position {
  asset: { symbol: string; name: string }
  type: "supply" | "borrow"
  amount: string
  value: string
  apy: number
  isProfit: boolean
}

interface PortfolioListProps {
  positions: Position[]
  hasViewerKey: boolean
  onAddViewerKey: () => void
  onManagePosition: (symbol: string, type: "supply" | "borrow") => void
}

export default function PortfolioList({ positions, hasViewerKey, onAddViewerKey, onManagePosition }: PortfolioListProps) {
  const ObfuscatedValue = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help text-gray-400 dark:text-gray-500">•••</span>
        </TooltipTrigger>
        <TooltipContent className="rounded-xl bg-gray-900/90 backdrop-blur-sm dark:bg-gray-100/90">
          <p className="text-sm">Add viewer key to see your positions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Positions</h3>
          {!hasViewerKey && (
            <Button size="sm" variant="outline" onClick={onAddViewerKey} className="rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50">
              Add Viewer Key
            </Button>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/50 dark:bg-gray-800/50" />
            <p className="text-gray-600 dark:text-gray-400">No positions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position, index) => (
              <Card key={`${position.asset.symbol}-${position.type}-${index}`} className="rounded-xl border-white/20 bg-white/5 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">{position.asset.symbol}</p>
                        <Badge variant={position.type === "supply" ? "default" : "secondary"} className={`rounded-lg text-xs ${position.type === "supply" ? "bg-green-500/20 text-green-700 dark:text-green-400" : "bg-blue-500/20 text-blue-700 dark:text-blue-400"}`}>
                          {position.type === "supply" ? "Supplied" : "Borrowed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{position.asset.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {hasViewerKey ? (
                        <>
                          <p className="font-medium text-gray-900 dark:text-white">{position.amount}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">(${position.value})</p>
                        </>
                      ) : (
                        <ObfuscatedValue>
                          {position.amount} (${position.value})
                        </ObfuscatedValue>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-1 text-sm">
                      {hasViewerKey ? (
                        <>
                          {position.isProfit ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={position.isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {position.apy.toFixed(2)}% APY
                          </span>
                        </>
                      ) : (
                        <ObfuscatedValue>{position.apy.toFixed(2)}% APY</ObfuscatedValue>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => onManagePosition(position.asset.symbol, position.type)} className="rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50">
                    Manage
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}


