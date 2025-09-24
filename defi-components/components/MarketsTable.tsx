"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Market {
  asset: {
    symbol: string
    name: string
    icon: string
  }
  supplyAPR: number
  totalSupply: string
  utilization: number
}

interface MarketsTableProps {
  markets: Market[]
  onSupply: (symbol: string) => void
  onBorrow: (symbol: string) => void
}

export default function MarketsTable({ markets, onSupply, onBorrow }: MarketsTableProps) {
  return (
    <Card className="rounded-2xl border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Markets</h3>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-xl">
            <table className="w-full">
              <thead className="bg-white/20 dark:bg-gray-700/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Asset</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Supply APR
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Supply
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Utilization
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market, index) => (
                  <tr key={market.asset.symbol} className="border-t border-white/10 dark:border-gray-700/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#12B3C7]" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{market.asset.symbol}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{market.asset.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="rounded-xl bg-green-500/20 text-green-700 dark:text-green-400">
                        {market.supplyAPR.toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gray-900 dark:text-white">{market.totalSupply}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200/50 dark:bg-gray-700/50">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#12B3C7]"
                            style={{ width: `${market.utilization}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{market.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onSupply(market.asset.symbol)}
                          className="rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90"
                        >
                          Supply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onBorrow(market.asset.symbol)}
                          className="rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50"
                        >
                          Borrow
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {markets.map((market) => (
            <Card
              key={market.asset.symbol}
              className="rounded-xl border-white/20 bg-white/5 p-4 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#12B3C7]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{market.asset.symbol}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{market.asset.name}</p>
                  </div>
                </div>
                <Badge className="rounded-xl bg-green-500/20 text-green-700 dark:text-green-400">
                  {market.supplyAPR.toFixed(2)}%
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Supply</span>
                  <span className="text-gray-900 dark:text-white">{market.totalSupply}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                  <span className="text-gray-900 dark:text-white">{market.utilization}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#12B3C7]"
                    style={{ width: `${market.utilization}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onSupply(market.asset.symbol)}
                  className="flex-1 rounded-xl bg-[#6C63FF] hover:bg-[#6C63FF]/90"
                >
                  Supply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBorrow(market.asset.symbol)}
                  className="flex-1 rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50"
                >
                  Borrow
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
}
