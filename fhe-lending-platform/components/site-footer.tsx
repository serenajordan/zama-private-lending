import { GlassCard } from "@/components/glass-card"

export function SiteFooter() {
  return (
    <footer className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] bg-clip-text text-transparent">
                  FHE Lend
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Confidential lending powered by Fully Homomorphic Encryption on fhEVM.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Launch App
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Whitepaper
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Developers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    SDK
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Bug Bounty
                  </a>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#6C63FF] transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 FHE Lend. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-[#6C63FF] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#6C63FF] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[#6C63FF] transition-colors">
                Security
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  )
}
