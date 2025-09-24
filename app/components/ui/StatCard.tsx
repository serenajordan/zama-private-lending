import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ReactNode } from "react"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  sublabel?: string
  trendBadge?: {
    text: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
}

export default function StatCard({ icon, label, value, sublabel, trendBadge }: StatCardProps) {
  return (
    <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/10 p-6 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-xl bg-gradient-to-br from-[color-mix(in_hsl,theme(colors.primary.DEFAULT),transparent_80%)] to-[color-mix(in_hsl,theme(colors.accent.DEFAULT),transparent_80%)] p-2">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sublabel && <p className="text-xs text-gray-500 dark:text-gray-500">{sublabel}</p>}
          </div>
        </div>

        {trendBadge && (
          <Badge variant={trendBadge.variant} className="rounded-xl bg-white/20 backdrop-blur-sm dark:bg-gray-700/50">
            {trendBadge.text}
          </Badge>
        )}
      </div>
    </Card>
  )
}


