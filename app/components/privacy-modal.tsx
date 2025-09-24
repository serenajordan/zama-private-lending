"use client"

import * as React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Calculator, Info, ExternalLink } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"

interface PrivacyModalProps {
  children: React.ReactNode
}

function PrivacyContent() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Privacy-First DeFi</h3>
        <p className="text-sm text-muted-foreground">
          Zama Private Lending uses Fully Homomorphic Encryption (FHE) to keep your financial data private
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Encrypted Transactions</h4>
                <p className="text-sm text-muted-foreground">
                  All deposits, borrows, and repayments are encrypted on-chain. Transaction amounts and balances remain
                  hidden from public view.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Private Computations</h4>
                <p className="text-sm text-muted-foreground">
                  Health scores and liquidation calculations are performed on encrypted data without revealing your
                  position details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Selective Disclosure</h4>
                <p className="text-sm text-muted-foreground">
                  You control what information is visible. Share proofs of solvency without revealing exact balances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <Shield className="w-3 h-3 mr-1" />
            FHE Powered
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Zero Knowledge
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Learn more about Zama's FHE technology</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

export function PrivacyModal({ children }: PrivacyModalProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy & Security</DialogTitle>
            <DialogDescription>How Zama Private Lending protects your financial privacy</DialogDescription>
          </DialogHeader>
          <PrivacyContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Privacy & Security</DrawerTitle>
          <DrawerDescription>How Zama Private Lending protects your financial privacy</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <PrivacyContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
