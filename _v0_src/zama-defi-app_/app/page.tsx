import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { SystemBanner } from "@/components/system-banner"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6 space-y-4">
        <SystemBanner />
        <Dashboard />
      </main>
    </div>
  )
}
