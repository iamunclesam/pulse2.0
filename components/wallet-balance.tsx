"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useCurrencyStore } from "@/lib/stores/currency-store"
import { formatCurrency, formatNaira } from "@/lib/utils"
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WalletBalance() {
  const { balance, addFunds } = useWalletStore()
  const { currency, toggleCurrency } = useCurrencyStore()
  const [showBalance, setShowBalance] = useState(true)
  const [isAddingFunds, setIsAddingFunds] = useState(false)

  const handleAddFunds = async () => {
    setIsAddingFunds(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      addFunds(1000)
    } finally {
      setIsAddingFunds(false)
    }
  }

  const formatAmount = (amount: number) => {
    return currency === "ADA" ? formatCurrency(amount) : formatNaira(amount)
  }

  return (
    <Card className="shadow-sm border-none bg-gradient-to-r from-background to-accent/30">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-2xl font-bold transition-all", !showBalance && "blur-sm select-none")}>
                  {formatAmount(balance)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full flex items-center gap-1"
                disabled={isAddingFunds}
                onClick={handleAddFunds}
              >
                {isAddingFunds ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ArrowDownLeft className="h-3 w-3" />
                )}
                <span>Add Funds</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>Send</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={toggleCurrency} className="flex items-center gap-1 text-xs">
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              {currency === "ADA" ? "Show in ₦" : "Show in ADA"}
            </Button>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-muted-foreground">Staked</p>
              <p className="font-medium">{formatAmount(5700)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-right">Rewards</p>
              <p className="font-medium text-green-500">+{formatAmount(320)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
