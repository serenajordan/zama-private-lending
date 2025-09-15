"use client"

import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import WalletConnectButton from "@/components/wallet-connect-button"

export function Navigation() {

  return (
    <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-lg">Zama Private Lending</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Sepolia Testnet
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  )
}
