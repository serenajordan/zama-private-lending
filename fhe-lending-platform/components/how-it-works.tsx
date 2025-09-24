import { GlassCard } from "@/components/glass-card"
import { GradientHeader } from "@/components/gradient-header"
import { Smartphone, Server, Eye } from "lucide-react"

const steps = [
  {
    icon: Smartphone,
    title: "Encrypt locally",
    description: "Your browser encrypts amounts before sending.",
    step: "1",
  },
  {
    icon: Server,
    title: "Interact privately",
    description: "Contracts perform math and checks over ciphertext.",
    step: "2",
  },
  {
    icon: Eye,
    title: "Peek securely",
    description: "Provide a viewer key to re-encrypt balances to you only.",
    step: "3",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <GradientHeader
          title="How It Works"
          subtitle="Three simple steps to private lending powered by FHE"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <GlassCard className="p-8 text-center h-full">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#12B3C7] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-lg text-balance">{step.description}</p>
                </div>
              </GlassCard>

              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
