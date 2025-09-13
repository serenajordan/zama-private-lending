"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"

export function Navigation() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")

  const connectWallet = () => {
    // Mock wallet connection
    setIsConnected(true)
    setAddress("0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c")
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress("")
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

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

          {!isConnected ? (
            <Button onClick={connectWallet} className="gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={copyAddress} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={disconnectWallet} className="gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
