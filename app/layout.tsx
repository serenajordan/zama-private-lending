import * as React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './app/globals.css'
import Providers from './app/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zama Private Lending',
  description: 'Confidential lending on fhEVM with FHE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}