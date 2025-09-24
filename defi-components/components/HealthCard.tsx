import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Skull } from "lucide-react"

interface HealthCardProps {
  healthFactor: number
}

export default function HealthCard({ healthFactor }: HealthCardProps) {
  const getHealthState = (factor: number) => {
    if (factor >= 2) {
      return {
        status: "Healthy",
        color: "bg-green-500/20 text-green-700 dark:text-green-400",
        icon: <Shield className="h-4 w-4" />,
        bgGradient: "from-green-500/10 to-emerald-500/10",
      }
    } else if (factor >= 1.2) {
      return {
        status: "At Risk",
        color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
        icon: <AlertTriangle className="h-4 w-4" />,
        bgGradient: "from-yellow-500/10 to-orange-500/10",
      }
    } else {
      return {
        status: "Liquidatable",
        color: "bg-red-500/20 text-red-700 dark:text-red-400",
        icon: <Skull className="h-4 w-4" />,
        bgGradient: "from-red-500/10 to-pink-500/10",
      }
    }
  }

  const healthState = getHealthState(healthFactor)

  return (
    <Card
      className={`rounded-2xl border-white/20 bg-gradient-to-br ${healthState.bgGradient} p-6 backdrop-blur-xl dark:border-gray-700/50`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Health Factor</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{healthFactor.toFixed(2)}</p>
        </div>

        <div className="text-right">
          <Badge className={`rounded-xl ${healthState.color} backdrop-blur-sm`}>
            <span className="mr-1">{healthState.icon}</span>
            {healthState.status}
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${
              healthFactor >= 2
                ? "from-green-500 to-emerald-500"
                : healthFactor >= 1.2
                  ? "from-yellow-500 to-orange-500"
                  : "from-red-500 to-pink-500"
            }`}
            style={{ width: `${Math.min(100, (healthFactor / 3) * 100)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
