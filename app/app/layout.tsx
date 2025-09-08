import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '../components/Toast'
import NetworkGuard from '../components/NetworkGuard'
// Debug hook: attach __fheCheck to window for quick troubleshooting
import { debugCodes } from "@/lib/contracts";
import { useEffect } from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zama Private Lending Protocol',
  description: 'Confidential DeFi lending powered by fully homomorphic encryption',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <NetworkGuard>
            {children}
          </NetworkGuard>
        </ToastProvider>
        {/* Attach once on client */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            (function () {
              if (typeof window !== 'undefined') {
                window.__fheCheck = ${async function () {
                  // dynamically import to avoid breaking SSR
                  try {
                    const m = await import("/lib/contracts");
                    if (!m || !m.debugCodes) { console.log("debug module not ready"); return; }
                    const info = await m.debugCodes();
                    console.log("FHE Debug:", info);
                    return info;
                  } catch (e) {
                    console.log("debug module not ready:", e);
                    return null;
                  }
                }};
              }
            })();`
        }} />
      </body>
    </html>
  )
}
