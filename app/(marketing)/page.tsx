import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, ArrowRight, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Private Lending</h1>
            </div>
            <Link href="/app">
              <Button className="rounded-xl bg-[var(--brand)] hover:opacity-90">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 rounded-full bg-[var(--brand)]/20 text-[var(--brand)] border-[var(--brand)]/30">
            <Shield className="mr-2 h-4 w-4" />
            Powered by FHE
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
            Confidential Lending, On-Chain
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Borrow and earn with balances kept private by Fully Homomorphic Encryption on fhEVM. 
            Your financial data stays encrypted while you participate in DeFi.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="rounded-xl bg-[var(--brand)] hover:opacity-90 px-8">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-xl border-gray-300 dark:border-gray-600">
              Read Docs
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy-First DeFi
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience the future of private finance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--brand)]/20 to-[var(--accent)]/20 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Encrypted Balances
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your deposit and borrow amounts are encrypted on-chain. Only you can decrypt your positions with your viewer key.
              </p>
            </Card>

            <Card className="p-8 rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--brand)]/20 to-[var(--accent)]/20 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Selective Transparency
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your positions with trusted parties using viewer keys, while keeping your data private from everyone else.
              </p>
            </Card>

            <Card className="p-8 rounded-[var(--radius-xl)] border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--brand)]/20 to-[var(--accent)]/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Full DeFi Functionality
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Deposit, borrow, and earn with the same features as traditional DeFi, but with complete privacy protection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Experience Private DeFi?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start lending and borrowing with complete privacy protection
          </p>
          <Link href="/app">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] hover:opacity-90 px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Built with ❤️ using fhEVM and FHE technology
          </p>
        </div>
      </footer>
    </div>
  )
}
