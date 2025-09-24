import { GlassCard } from "@/components/glass-card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsProps {
  totalValueLocked?: string
  users?: string
  totalDeposits?: string
  liquidationsAvoided?: string
}

export function Stats({ totalValueLocked, users, totalDeposits, liquidationsAvoided }: StatsProps) {
  const stats = [
    {
      label: "Total Value Locked",
      value: totalValueLocked,
      placeholder: "$2.4M",
    },
    {
      label: "Users",
      value: users,
      placeholder: "1,247",
    },
    {
      label: "Total Deposits",
      value: totalDeposits,
      placeholder: "$1.8M",
    },
    {
      label: "Liquidations avoided",
      value: liquidationsAvoided,
      placeholder: "342",
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center">
              <div className="space-y-2">
                {stat.value ? (
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                ) : (
                  <Skeleton className="h-10 w-20 mx-auto bg-gradient-to-r from-[#6C63FF]/20 to-[#12B3C7]/20" />
                )}
                <p className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</p>
                {!stat.value && (
                  <div className="text-2xl md:text-3xl font-bold text-muted-foreground/50">{stat.placeholder}</div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
