"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { env } from "@/lib/env"
import { useState } from "react"

export default function AppHeader() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--accent)]" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Private Lending</h1>
        </div>

        <div className="flex items-center space-x-3">
          <ConnectButton />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
          >
            <span className="sr-only">Toggle theme</span>
            {/* Simple dot to avoid brand icon usage */}
            <span className="inline-block h-4 w-4 rounded-full bg-gray-800 dark:bg-gray-100" />
          </Button>

        </div>
      </div>
    </header>
  )
}


