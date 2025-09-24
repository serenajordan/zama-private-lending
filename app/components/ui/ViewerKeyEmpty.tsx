"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

interface ViewerKeyEmptyProps {
  onAddViewerKey: () => void
}

export default function ViewerKeyEmpty({ onAddViewerKey }: ViewerKeyEmptyProps) {
  return (
    <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50 shadow-[var(--shadow-md)]">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[color-mix(in_hsl,theme(colors.primary.DEFAULT),transparent_80%)] to-[color-mix(in_hsl,theme(colors.accent.DEFAULT),transparent_80%)]">
        <Eye className="h-10 w-10 text-[var(--brand)]" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Add Viewer Key</h3>

      <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
        To view your portfolio positions and history, add a viewer key. This gives read-only access to encrypted data.
      </p>

      <Button onClick={onAddViewerKey} className="rounded-xl bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] px-8 py-2 font-medium text-white hover:opacity-90">
        Add Viewer Key
      </Button>
    </Card>
  )
}


