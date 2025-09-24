"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Eye, Shield } from "lucide-react"

interface ViewerKeyEmptyProps {
  onAddViewerKey: () => void
}

export default function ViewerKeyEmpty({ onAddViewerKey }: ViewerKeyEmptyProps) {
  return (
    <Card className="rounded-2xl border-white/20 bg-white/10 p-8 text-center backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/50">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#12B3C7]/20">
        <Lock className="h-10 w-10 text-[#6C63FF] dark:text-[#8B7FFF]" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Add Viewer Key</h3>

      <p className="mb-6 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        To view your portfolio positions and transaction history, you need to add a viewer key. This allows read-only
        access to your account data while keeping your funds secure.
      </p>

      <div className="mb-6 flex justify-center space-x-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Eye className="h-4 w-4 text-[#12B3C7]" />
          <span>Read-only access</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Shield className="h-4 w-4 text-[#12B3C7]" />
          <span>Funds stay secure</span>
        </div>
      </div>

      <Button
        onClick={onAddViewerKey}
        className="rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#12B3C7] px-8 py-2 font-medium text-white hover:from-[#6C63FF]/90 hover:to-[#12B3C7]/90"
      >
        Add Viewer Key
      </Button>
    </Card>
  )
}
