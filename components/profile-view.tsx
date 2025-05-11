"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { usePactStore } from "@/lib/stores/pact-store"
import { useCurrencyStore } from "@/lib/stores/currency-store"
import { Copy, ExternalLink, LogOut, WalletIcon, Award, ArrowRightLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { formatCurrency, formatNaira } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ReputationScore } from "@/components/reputation-score"
import { Progress } from "@/components/ui/progress"

export function ProfileView() {
  const { balance, disconnect } = useWalletStore()
  const { pacts, fetchPacts, resetPacts } = usePactStore()
  const { currency, toggleCurrency } = useCurrencyStore()
  const [copied, setCopied] = useState(false)
  const address =
    "addr1qxy8rzd5h5gqgdkgwak2vxnp0zucsq6qvj2qnxvl7lsdhnktp3mzl85lh9cxvj5s8zlj4ztzy52n8krmf2nx7fy8qxsqvz2a9c"

  useEffect(() => {
    fetchPacts()
  }, [fetchPacts])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all pacts? This is for demo purposes only.")) {
      resetPacts()
    }
  }

  const formatAmount = (amount: number) => {
    return currency === "ADA" ? formatCurrency(amount) : formatNaira(amount)
  }

  const totalStaked = pacts.reduce((sum, pact) => sum + pact.stakedAmount, 0)
  const completedPacts = pacts.filter((pact) => pact.completed).length
  const failedPacts = pacts.filter((pact) => pact.failed).length
  const activePacts = pacts.filter((pact) => !pact.completed && !pact.failed).length

  // Calculate achievement stats
  const achievements = [
    {
      name: "Pact Creator",
      description: "Create your first pact",
      progress: pacts.length > 0 ? 100 : 0,
      completed: pacts.length > 0,
    },
    {
      name: "Goal Achiever",
      description: "Complete a pact successfully",
      progress: completedPacts > 0 ? 100 : 0,
      completed: completedPacts > 0,
    },
    {
      name: "Diversifier",
      description: "Create all three types of pacts",
      progress: Math.min(100, (new Set(pacts.map((p) => p.type)).size / 3) * 100),
      completed: new Set(pacts.map((p) => p.type)).size === 3,
    },
    {
      name: "Big Staker",
      description: "Stake over 10,000 ADA in total",
      progress: Math.min(100, (totalStaked / 10000) * 100),
      completed: totalStaked >= 10000,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-4">
        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
          <WalletIcon className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Your Profile</h2>
        <div className="mt-2">
          <ReputationScore />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wallet</CardTitle>
            <Button variant="outline" size="sm" onClick={toggleCurrency} className="flex items-center gap-1">
              <ArrowRightLeft className="h-3 w-3 mr-1" />
              {currency === "ADA" ? "Show in ₦" : "Show in ADA"}
            </Button>
          </div>
          <CardDescription>Your connected wallet details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Address</p>
            <div className="flex items-center gap-2">
              <code className="bg-muted p-2 rounded text-xs w-full overflow-x-auto">{address}</code>
              <Button variant="outline" size="icon" onClick={copyAddress}>
                {copied ? <span className="text-green-500">✓</span> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-xl font-bold">{formatAmount(balance)}</p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your PulsePact activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold">{activePacts}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-green-500">{completedPacts}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-xl font-bold text-red-500">{failedPacts}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Staked</p>
            <p className="text-xl font-bold">{formatAmount(totalStaked)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Track your PulsePact milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${achievement.completed ? "bg-green-500" : "bg-muted"}`}
                    >
                      {achievement.completed ? (
                        <Award className="h-3 w-3 text-white" />
                      ) : (
                        <Award className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium">{Math.round(achievement.progress)}%</span>
                </div>
                <Progress value={achievement.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
              This is a demo application. All data is stored locally and no real transactions are made.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleReset}>
              <span className="text-red-500 mr-2">↺</span>
              Reset Demo Data
            </Button>

            <Separator />

            <Button variant="outline" className="w-full justify-start text-destructive" onClick={disconnect}>
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
