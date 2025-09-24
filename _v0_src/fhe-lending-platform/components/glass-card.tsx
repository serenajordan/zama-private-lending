import type React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "backdrop-blur-md bg-white/5 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-2xl shadow-md",
        className,
      )}
    >
      {children}
    </Card>
  )
}
