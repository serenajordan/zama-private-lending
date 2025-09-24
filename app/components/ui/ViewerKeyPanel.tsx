"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useViewer } from "@/hooks/useViewer"
import { publicKeyHash } from "@/lib/fhe"
import { Eye, EyeOff, Key } from "lucide-react"

interface ViewerKeyPanelProps {
  onClose: () => void
}

export default function ViewerKeyPanel({ onClose }: ViewerKeyPanelProps) {
  const [publicKey, setPublicKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { setKeys } = useViewer()

  const handleSubmit = async () => {
    if (!publicKey.trim()) return
    
    setIsLoading(true)
    try {
      const hash = await publicKeyHash(publicKey.trim())
      setKeys({ 
        publicKey: publicKey.trim(), 
        publicKeyHash: hash,
        secretKey: secretKey.trim() || undefined 
      })
      onClose()
    } catch (error) {
      console.error("Failed to compute public key hash:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="rounded-[var(--radius-xl)] border-white/20 bg-white/90 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90 p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-[var(--brand)]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Viewer Key</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</label>
            <Input
              placeholder="Enter your public key..."
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="rounded-xl border-white/20 bg-white/50 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secret Key <span className="text-xs text-gray-500">(optional, for decryption)</span>
            </label>
            <Input
              type="password"
              placeholder="Enter secret key for decryption..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="rounded-xl border-white/20 bg-white/50 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:border-gray-700/50 dark:bg-gray-800/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!publicKey.trim() || isLoading}
            className="flex-1 rounded-xl bg-[var(--brand)] hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Add Key"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
