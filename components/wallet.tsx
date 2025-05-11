"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { WalletIcon } from "lucide-react"

export function Wallet() {
  const { connected, address, connect, disconnect } = useWalletStore()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
    } finally {
      setIsConnecting(false)
    }
  }

  if (connected) {
    return (
      <Button variant="outline" className="flex items-center gap-2 text-xs" onClick={disconnect}>
        <WalletIcon className="h-4 w-4" />
        <span className="truncate max-w-[100px]">{address}</span>
      </Button>
    )
  }

  return (
    <Button variant="outline" className="flex items-center gap-2" onClick={handleConnect} disabled={isConnecting}>
      <WalletIcon className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
