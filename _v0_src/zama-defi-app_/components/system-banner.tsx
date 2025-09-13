"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, WifiOff, Server } from "lucide-react"

interface SystemStatus {
  relayerOnline: boolean
  networkConnected: boolean
  lastUpdated: Date
}

export function SystemBanner() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    relayerOnline: true,
    networkConnected: true,
    lastUpdated: new Date(),
  })
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  // Simulate system status changes for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate relayer going offline
      if (Math.random() < 0.1) {
        setSystemStatus((prev) => ({
          ...prev,
          relayerOnline: Math.random() > 0.3,
          networkConnected: Math.random() > 0.1,
          lastUpdated: new Date(),
        }))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]))
  }

  const alerts = []

  if (!systemStatus.relayerOnline && !dismissedAlerts.has("relayer-offline")) {
    alerts.push({
      id: "relayer-offline",
      variant: "destructive" as const,
      icon: Server,
      title: "Relayer Offline",
      description: "The transaction relayer is currently offline. Transactions may be delayed or fail.",
    })
  }

  if (!systemStatus.networkConnected && !dismissedAlerts.has("network-disconnected")) {
    alerts.push({
      id: "network-disconnected",
      variant: "destructive" as const,
      icon: WifiOff,
      title: "Network Connection Lost",
      description: "Unable to connect to the Sepolia testnet. Please check your connection.",
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant={alert.variant} className="relative">
          <alert.icon className="h-4 w-4" />
          <AlertDescription className="pr-8">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{alert.title}</span>
              <span className="text-sm">{alert.description}</span>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => dismissAlert(alert.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
