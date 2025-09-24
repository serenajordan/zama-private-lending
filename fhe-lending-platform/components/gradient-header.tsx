import { cn } from "@/lib/utils"

interface GradientHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function GradientHeader({ title, subtitle, className }: GradientHeaderProps) {
  return (
    <div className={cn("text-center space-y-4", className)}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">{subtitle}</p>
      )}
    </div>
  )
}
