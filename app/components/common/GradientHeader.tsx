import { cn } from "@/lib/utils"

interface GradientHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function GradientHeader({ title, subtitle, className }: GradientHeaderProps) {
  return (
    <div className={cn("space-y-4 text-center", className)}>
      <h2 className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">{subtitle}</p>}
    </div>
  )
}


