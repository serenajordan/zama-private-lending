"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroProps {
  onLaunchApp?: () => void
  onReadDocs?: () => void
}

export function Hero({ onLaunchApp, onReadDocs }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/10 via-transparent to-[#12B3C7]/10" />

      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
        <Badge
          variant="secondary"
          className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 text-sm px-4 py-2 rounded-2xl"
        >
          Live on fhEVM devnet
        </Badge>

        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance">
            <span className="bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] bg-clip-text text-transparent">
              Confidential Lending,
            </span>
            <br />
            <span className="text-foreground">On-Chain.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Borrow and earn with your balances kept private by Fully Homomorphic Encryption (FHE) on fhEVM.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-[#6C63FF] hover:bg-[#6C63FF]/90 text-white px-8 py-6 text-lg rounded-2xl shadow-lg"
            onClick={onLaunchApp}
          >
            Launch App
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-[#12B3C7] text-[#12B3C7] hover:bg-[#12B3C7]/10 px-8 py-6 text-lg rounded-2xl bg-transparent"
            onClick={onReadDocs}
          >
            Read Docs
          </Button>
        </div>
      </div>
    </section>
  )
}
