import { GlassCard } from "@/components/glass-card"
import { GradientHeader } from "@/components/gradient-header"
import { Shield, Lock, Layers, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Privacy by default",
    description: "Deposits, debt, and health stay encrypted end-to-end.",
  },
  {
    icon: Lock,
    title: "Safety checks on-chain",
    description: "LTV and liquidation gates run in the encrypted domain (no plaintext leaks).",
  },
  {
    icon: Layers,
    title: "Composable by design",
    description: 'Standard ERC interfaces with encrypted "peek" views for authorized clients.',
  },
  {
    icon: Users,
    title: "Familiar UX",
    description: "Deposit, borrow, repay—just private.",
  },
]

export function WhyFHE() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <GradientHeader
          title="Why FHE?"
          subtitle="Experience the future of private DeFi with cutting-edge encryption technology"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <GlassCard key={index} className="p-6 h-full">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-balance">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}
