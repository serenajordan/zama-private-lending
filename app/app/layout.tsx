import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '../components/Toast'
import NetworkGuard from '../components/NetworkGuard'

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
      </body>
    </html>
  )
}
