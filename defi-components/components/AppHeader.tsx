"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Wallet } from "lucide-react"
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
        {/* Product Title */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#12B3C7]" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lending Protocol</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
