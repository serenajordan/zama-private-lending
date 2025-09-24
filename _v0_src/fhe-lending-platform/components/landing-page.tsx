"use client"

import { Hero } from "@/components/hero"
import { WhyFHE } from "@/components/why-fhe"
import { HowItWorks } from "@/components/how-it-works"
import { Stats } from "@/components/stats"
import { Screenshots } from "@/components/screenshots"
import { Roadmap } from "@/components/roadmap"
import { FAQ } from "@/components/faq"
import { SiteFooter } from "@/components/site-footer"

interface LandingPageProps {
  onLaunchApp?: () => void
  onReadDocs?: () => void
  totalValueLocked?: string
  users?: string
  totalDeposits?: string
  liquidationsAvoided?: string
  dashboard1?: string
  dashboard2?: string
}

export function LandingPage({
  onLaunchApp,
  onReadDocs,
  totalValueLocked,
  users,
  totalDeposits,
  liquidationsAvoided,
  dashboard1,
  dashboard2,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Hero onLaunchApp={onLaunchApp} onReadDocs={onReadDocs} />
      <Stats
        totalValueLocked={totalValueLocked}
        users={users}
        totalDeposits={totalDeposits}
        liquidationsAvoided={liquidationsAvoided}
      />
      <WhyFHE />
      <HowItWorks />
      <Screenshots dashboard1={dashboard1} dashboard2={dashboard2} />
      <Roadmap />
      <FAQ />
      <SiteFooter />
    </div>
  )
}
