"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { usePactStore } from "@/lib/stores/pact-store"
import { useWalletStore } from "@/lib/stores/wallet-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { useStreakStore } from "@/lib/stores/streak-store"
import { useCurrencyStore } from "@/lib/stores/currency-store"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Coins,
  Target,
  X,
  User,
  Users,
  Globe,
  Info,
  Flame,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency, formatNaira } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PactBadge } from "@/components/pact-badge"
import { CountdownTimer } from "@/components/countdown-timer"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export function PactDetails({ id }: { id: string }) {
  const router = useRouter()
  const { pacts, fetchPacts, stakePact, completePact, failPact, contributeToCause } = usePactStore()
  const { balance, subtractFunds, addFunds } = useWalletStore()
  const { addNotification } = useNotificationStore()
  const { incrementStreak } = useStreakStore()
  const { currency, toggleCurrency } = useCurrencyStore()
  const [stakeAmount, setStakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isFailing, setIsFailing] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchPacts()
  }, [fetchPacts])

  const pact = pacts.find((p) => p.id === id)

  if (!pact) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Pact not found.{" "}
          <Button variant="link" onClick={() => router.push("/")}>
            Go back
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const progress = (pact.stakedAmount / pact.targetAmount) * 100
  const isComplete = pact.completed
  const isFailed = pact.failed

  const formatAmount = (amount: number) => {
    return currency === "ADA" ? formatCurrency(amount) : formatNaira(amount)
  }

  const handleStake = async () => {
    if (isStaking || !stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      return
    }

    const amount = Number.parseFloat(stakeAmount)

    if (amount > balance) {
      addNotification({
        type: "warning",
        title: "Insufficient funds",
        message: "You don't have enough funds to stake this amount.",
      })
      return
    }

    setIsStaking(true)
    try {
      // Simulate blockchain interaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (pact.type === "cause" && pact.publiclyVisible) {
        contributeToCause(id, amount, "Your Address")
      } else {
        stakePact(id, amount)
      }

      subtractFunds(amount)
      setStakeAmount("")

      addNotification({
        type: "success",
        title: "Stake successful",
        message: `You've staked ${formatCurrency(amount)} in "${pact.title}"`,
      })

      incrementStreak()
    } finally {
      setIsStaking(false)
    }
  }

  const handleComplete = async () => {
    if (isCompleting) {
      return
    }

    setIsCompleting(true)
    try {
      // Simulate blockchain interaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      completePact(id)

      // Add rewards for completion (10% of target)
      const reward = pact.targetAmount * 0.1
      addFunds(reward)

      addNotification({
        type: "achievement",
        title: "Pact Completed! 🎉",
        message: `Congratulations! You've completed "${pact.title}" and earned ${formatCurrency(reward)} in rewards!`,
      })

      incrementStreak()
    } finally {
      setIsCompleting(false)
    }
  }

  const handleFail = async () => {
    if (isFailing) {
      return
    }

    setIsFailing(true)
    try {
      // Simulate blockchain interaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      failPact(id)

      addNotification({
        type: "warning",
        title: "Pact Failed",
        message: `Your pact "${pact.title}" has been marked as failed.`,
      })
    } finally {
      setIsFailing(false)
    }
  }

  const getPactTypeIcon = () => {
    switch (pact.type) {
      case "solo":
        return <User className="h-4 w-4 mr-1 text-blue-500" />
      case "duo":
        return <Users className="h-4 w-4 mr-1 text-purple-500" />
      case "cause":
        return <Globe className="h-4 w-4 mr-1 text-green-500" />
      case "borrow":
        return <Coins className="h-4 w-4 mr-1 text-amber-500" />
      default:
        return null
    }
  }

  const getPactTypeLabel = () => {
    return pact.type.charAt(0).toUpperCase() + pact.type.slice(1)
  }

  // Render different content based on pact type
  const renderTypeSpecificContent = () => {
    switch (pact.type) {
      case "duo":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Duo Partner</CardTitle>
              <CardDescription>This pact is shared with another user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Partner Wallet</p>
                  <p className="text-xs text-muted-foreground truncate">{pact.partnerAddress || "addr1qx...7fyu"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Contribution Split</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${pact.splitRatio || 50}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    You: {pact.splitRatio || 50}% | Partner: {100 - (pact.splitRatio || 50)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "cause":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cause Details</CardTitle>
              <CardDescription>This pact is tied to a public cause</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Cause Address</p>
                  <p className="text-xs text-muted-foreground truncate">{pact.causeAddress || "addr1qx...8gtz"}</p>
                </div>
              </div>

              {pact.publiclyVisible && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Contributors</p>
                      <p className="text-xs text-muted-foreground">
                        {pact.contributors?.length || 1} contributor{(pact.contributors?.length || 1) > 1 ? "s" : ""}
                      </p>
                    </div>

                    <ScrollArea className="h-[120px]">
                      <div className="space-y-2">
                        {(pact.contributors || [{ address: "Your Address", amount: pact.stakedAmount }]).map(
                          (contributor, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {contributor.address.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm truncate max-w-[150px]">{contributor.address}</p>
                              </div>
                              <p className="text-sm font-medium">{formatAmount(contributor.amount)}</p>
                            </div>
                          ),
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>About Cause Pacts</AlertTitle>
                <AlertDescription>
                  If you fail to meet your goal, your staked funds will be donated to the associated cause.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )

      case "borrow":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Borrowing terms and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">Lender</p>
                  <p className="text-xs text-muted-foreground truncate">{pact.lenderAddress || "addr1qx...9ktz"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{pact.interestRate || 5}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repayment Schedule</p>
                  <p className="font-medium capitalize">{pact.repaymentSchedule || "Monthly"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collateral</p>
                  <p className="font-medium">{formatAmount(pact.collateralAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total to Repay</p>
                  <p className="font-medium">{formatAmount(pact.totalRepayment || pact.targetAmount * 1.05)}</p>
                </div>
              </div>

              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Collateral Required</AlertTitle>
                <AlertDescription>Your collateral will be locked until the loan is fully repaid.</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm font-medium">Repayment Progress</p>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paid: {formatAmount(pact.stakedAmount)}</span>
                  <span>
                    Remaining: {formatAmount((pact.totalRepayment || pact.targetAmount * 1.05) - pact.stakedAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "solo":
      default:
        if (pact.category) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Solo Pact</CardTitle>
                <CardDescription>Personal financial goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Category</p>
                    <p className="text-sm">{pact.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" className="pl-0" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleCurrency}
          className="flex items-center gap-1"
        >
          <ArrowRightLeft className="h-3 w-3 mr-1" />
          {currency === "ADA" ? "₦" : "ADA"}
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <PactBadge type={pact.type} progress={progress} size="lg" completed={isComplete} failed={isFailed} />

        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">{pact.title}</h2>
          <div className="flex items-center justify-center mt-1">
            {getPactTypeIcon()}
            <span className="text-sm">{getPactTypeLabel()} Pact</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-6">
              {!isComplete && !isFailed && (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {pact.type === "borrow" ? "Repayment Deadline" : "Time Remaining"}
                  </p>
                  <CountdownTimer deadline={pact.deadline} />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 progress-bar-animate" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="h-4 w-4 mr-1" />
                    {pact.type === "borrow" ? "Loan Amount" : "Target"}
                  </div>
                  <p className="font-semibold">{formatAmount(pact.targetAmount)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Coins className="h-4 w-4 mr-1" />
                    {pact.type === "borrow" ? "Repaid" : pact.type === "cause" ? "Contributed" : "Staked"}
                  </div>
                  <p className="font-semibold">{formatAmount(pact.stakedAmount)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {pact.type === "borrow" ? "Repayment Deadline" : "Deadline"}
                </div>
                <p>{pact.deadline}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{pact.description}</p>
              </div>

              {!isComplete && !isFailed && (
                <div className="space-y-3 pt-2">
                  <Separator />
                  <Label htmlFor="stake-amount">
                    {pact.type === "borrow" 
                      ? "Add Repayment (ADA)" 
                      : pact.type === "cause" 
                        ? "Add Contribution (ADA)" 
                        : "Add Stake (ADA)"\
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <Button
                      onClick={handleStake}
                      disabled={isStaking || !stakeAmount || Number.parseFloat(stakeAmount) <= 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isStaking ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {pact.type === "borrow" ? "Repaying..." : pact.type === "cause" ? "Contributing..." : "Staking..."}
                        </span>
                      ) : (
                        pact.type === "borrow" ? "Repay" : pact.type === "cause" ? "Contribute" : "Stake"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {isComplete ? (
                <Alert className="w-full">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertTitle>Pact Completed</AlertTitle>
                  <AlertDescription>
                    {pact.type === "borrow" 
                      ? "This loan has been fully repaid." 
                      : "This financial pact has been successfully completed."}
                  </AlertDescription>
                </Alert>
              ) : isFailed ? (
                <Alert className="w-full" variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertTitle>Pact Failed</AlertTitle>
                  <AlertDescription>
                    {pact.type === "borrow" 
                      ? "This loan was not repaid by the deadline." 
                      : pact.type === "cause" 
                        ? "This cause pact was not completed by the deadline." 
                        : "This financial pact was not completed by the deadline."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="w-full space-y-3">
                  <Button
                    className="w-full"
                    variant={progress >= 100 ? "default" : "outline"}
                    disabled={progress < 100 || isCompleting}
                    onClick={handleComplete}
                  >
                    {isCompleting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {pact.type === "borrow" ? "Finalizing Repayment..." : "Completing..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {progress >= 100 
                          ? pact.type === "borrow" 
                            ? "Finalize Repayment" 
                            : "Complete Pact" 
                          : pact.type === "borrow" 
                            ? "Repay full amount to complete" 
                            : "Reach target to complete"}
                      </span>
                    )}
                  </Button>

                  <Button className="w-full" variant="outline" onClick={handleFail} disabled={isFailing}>
                    {isFailing ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-destructive">
                        <X className="h-4 w-4" />
                        {pact.type === "borrow" ? "Default on Loan" : "Abandon Pact"}
                      </span>
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          {renderTypeSpecificContent()}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Potential Rewards</CardTitle>
              <CardDescription>Complete this pact to earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Completion Bonus</p>
                    <p className="text-xs text-muted-foreground">10% of target amount</p>
                  </div>
                </div>
                <p className="font-bold text-green-500">{formatAmount(pact.targetAmount * 0.1)}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Streak Bonus</p>
                    <p className="text-xs text-muted-foreground">For maintaining your streak</p>
                  </div>
                </div>
                <p className="font-bold text-orange-500">+1 day</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {pact.type === "borrow" ? "Early Repayment Rewards" : "Staking Rewards"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pact.type === "borrow" 
                    ? "Earn additional rewards by repaying your loan early." 
                    : "Earn additional rewards based on how long you stake your funds. The longer you stake, the more you earn!"}
                </p>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current rewards</span>
                    <span className="text-green-500">{formatAmount(pact.stakedAmount * 0.05)}</span>
                  </div>
                  <Progress value={60} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">60% of maximum rewards earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {pact.type === "borrow" ? "Reliable Borrower" : "Goal Achiever"}
                  </p>
                  <p className="text-xs">{isComplete ? "Completed" : "In progress"}</p>
                </div>
                <Progress value={isComplete ? 100 : progress} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {pact.type === "borrow" ? "Consistent Repayer" : "Consistent Staker"}
                  </p>
                  <p className="text-xs">3/5 stakes</p>
                </div>
                <Progress value={60} className="h-1.5" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {pact.type === "borrow" ? "Early Repayer" : "Early Finisher"}
                  </p>
                  <p className="text-xs">Not started</p>
                </div>
                <Progress value={0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
