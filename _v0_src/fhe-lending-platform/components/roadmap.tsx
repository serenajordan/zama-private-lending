import { GlassCard } from "@/components/glass-card"
import { GradientHeader } from "@/components/gradient-header"
import { Clock, Zap, Rocket } from "lucide-react"

const roadmapItems = [
  {
    icon: Clock,
    title: "Now",
    description: "Private deposits/borrows, encrypted LTV, liquidation guards, viewer key peeks.",
    status: "current",
  },
  {
    icon: Zap,
    title: "Next",
    description: "Interest model tuning, multi-collateral markets, keeper integration, UI polish.",
    status: "upcoming",
  },
  {
    icon: Rocket,
    title: "Later",
    description: "Cross-chain deployment, audits, governance, permissionless markets.",
    status: "future",
  },
]

export function Roadmap() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <GradientHeader title="Roadmap" subtitle="Our journey to revolutionize private DeFi" className="mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roadmapItems.map((item, index) => (
            <div key={index} className="relative">
              <GlassCard
                className={`p-8 h-full transition-all duration-300 ${
                  item.status === "current"
                    ? "ring-2 ring-[#6C63FF]/50 bg-[#6C63FF]/5"
                    : item.status === "upcoming"
                      ? "ring-1 ring-[#12B3C7]/30 bg-[#12B3C7]/5"
                      : "opacity-75"
                }`}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.status === "current"
                          ? "bg-[#6C63FF] text-white"
                          : item.status === "upcoming"
                            ? "bg-[#12B3C7] text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                  </div>

                  <p className="text-muted-foreground text-balance leading-relaxed">{item.description}</p>

                  {item.status === "current" && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-[#6C63FF] rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Connection line */}
              {index < roadmapItems.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] transform -translate-y-1/2 opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
