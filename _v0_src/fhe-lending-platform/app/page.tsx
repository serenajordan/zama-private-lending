"use client"

import { LandingPage } from "@/components/landing-page"

export default function Home() {
  const handleLaunchApp = () => {
    console.log("Launch App clicked")
    // Add your app launch logic here
  }

  const handleReadDocs = () => {
    console.log("Read Docs clicked")
    // Add your docs navigation logic here
  }

  return (
    <LandingPage
      onLaunchApp={handleLaunchApp}
      onReadDocs={handleReadDocs}
      // Uncomment and provide actual values when available:
      // totalValueLocked="$2.4M"
      // users="1,247"
      // totalDeposits="$1.8M"
      // liquidationsAvoided="342"
      // dashboard1="/path/to/dashboard1.png"
      // dashboard2="/path/to/dashboard2.png"
    />
  )
}
