import { GradientHeader } from "@/components/gradient-header"
import { GlassCard } from "@/components/glass-card"

interface ScreenshotsProps {
  dashboard1?: string
  dashboard2?: string
}

export function Screenshots({ dashboard1, dashboard2 }: ScreenshotsProps) {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <GradientHeader
          title="See it in action"
          subtitle="A familiar Aave-style interface—powered by FHE."
          className="mb-16"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-2 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-[#6C63FF]/10 to-[#12B3C7]/10 rounded-xl flex items-center justify-center">
              {dashboard1 ? (
                <img
                  src={dashboard1 || "/placeholder.svg"}
                  alt="FHE Lending Dashboard - Main Interface"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-2 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-[#12B3C7]/10 to-[#6C63FF]/10 rounded-xl flex items-center justify-center">
              {dashboard2 ? (
                <img
                  src={dashboard2 || "/placeholder.svg"}
                  alt="FHE Lending Dashboard - Portfolio View"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#12B3C7] to-[#6C63FF] rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">Portfolio View</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
