"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { usePactStore } from "@/lib/stores/pact-store"
import { Plus, TrendingUp, Award, Bell, Layers } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { NavBar } from "@/components/nav-bar"
import { PactBadge } from "@/components/pact-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReputationScore } from "@/components/reputation-score"
import { StreakCounter } from "@/components/streak-counter"
import { NotificationIndicator } from "@/components/notification-indicator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NotificationList } from "@/components/notification-list"
import { WalletBalance } from "@/components/wallet-balance"

export function Dashboard() {
  const router = useRouter()
  const { pacts, fetchPacts } = usePactStore()
  const [activeTab, setActiveTab] = useState("active")

  useEffect(() => {
    fetchPacts()
  }, [fetchPacts])

  const activePacts = pacts.filter((pact) => !pact.completed && !pact.failed)
  const completedPacts = pacts.filter((pact) => pact.completed)
  const failedPacts = pacts.filter((pact) => pact.failed)

  const getPactTypeColor = (type: string) => {
    switch (type) {
      case "solo":
        return "bg-blue-500/10 text-blue-500"
      case "duo":
        return "bg-purple-500/10 text-purple-500"
      case "cause":
        return "bg-green-500/10 text-green-500"
      case "borrow":
        return "bg-amber-500/10 text-amber-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <>
      <header className="p-4 border-b sticky top-0 bg-background z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">PulsePact</h1>
            <StreakCounter />
          </div>
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <NotificationIndicator />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <NotificationList />
              </SheetContent>
            </Sheet>
            <ReputationScore />
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <WalletBalance />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Pacts</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs rounded-full"
                onClick={() => router.push("/pacts")}
              >
                <Layers className="h-4 w-4 mr-1" />
                View All
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90 rounded-full"
                onClick={() => router.push("/create")}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Pact
              </Button>
            </div>
          </div>

          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="active" className="text-xs">
                Active ({activePacts.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Completed ({completedPacts.length})
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">
                Failed ({failedPacts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-3 mt-0">
              {activePacts.length > 0 ? (
                <div className="space-y-3">
                  {activePacts.slice(0, 3).map((pact, index) => (
                    <Card
                      key={pact.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors pact-card-enter shadow-sm"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => router.push(`/pact/${pact.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{pact.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPactTypeColor(pact.type)}`}>
                                {pact.type.charAt(0).toUpperCase() + pact.type.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{pact.deadline}</p>
                          </div>
                          <PactBadge
                            type={pact.type}
                            progress={(pact.stakedAmount / pact.targetAmount) * 100}
                            size="sm"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3 mb-1">
                          <p className="text-sm font-medium">{formatCurrency(pact.stakedAmount)}</p>
                          <p className="text-xs text-muted-foreground">of {formatCurrency(pact.targetAmount)}</p>
                        </div>
                        <Progress
                          value={(pact.stakedAmount / pact.targetAmount) * 100}
                          className="h-1.5 progress-bar-animate"
                        />
                      </CardContent>
                    </Card>
                  ))}

                  {activePacts.length > 3 && (
                    <Button variant="outline" className="w-full text-sm" onClick={() => router.push("/pacts")}>
                      View {activePacts.length - 3} more active pacts
                    </Button>
                  )}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No active pacts</h3>
                    <p className="text-sm text-muted-foreground">Create your first financial goal to get started</p>
                    <Button className="mt-2 bg-primary hover:bg-primary/90" onClick={() => router.push("/create")}>
                      Create Pact
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-0">
              {completedPacts.length > 0 ? (
                <div className="space-y-3">
                  {completedPacts.slice(0, 3).map((pact, index) => (
                    <Card
                      key={pact.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors pact-card-enter shadow-sm"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => router.push(`/pact/${pact.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{pact.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPactTypeColor(pact.type)}`}>
                                {pact.type.charAt(0).toUpperCase() + pact.type.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-green-500">Completed</p>
                          </div>
                          <PactBadge type={pact.type} progress={100} size="sm" completed={true} />
                        </div>
                        <div className="flex justify-between items-center mt-3 mb-1">
                          <p className="text-sm font-medium">{formatCurrency(pact.stakedAmount)}</p>
                          <p className="text-xs text-muted-foreground">of {formatCurrency(pact.targetAmount)}</p>
                        </div>
                        <Progress value={100} className="h-1.5" />
                      </CardContent>
                    </Card>
                  ))}

                  {completedPacts.length > 3 && (
                    <Button variant="outline" className="w-full text-sm" onClick={() => router.push("/pacts")}>
                      View {completedPacts.length - 3} more completed pacts
                    </Button>
                  )}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <Award className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No completed pacts</h3>
                    <p className="text-sm text-muted-foreground">Complete your active pacts to see them here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-3 mt-0">
              {failedPacts.length > 0 ? (
                <div className="space-y-3">
                  {failedPacts.slice(0, 3).map((pact, index) => (
                    <Card
                      key={pact.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors opacity-70 pact-card-enter shadow-sm"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => router.push(`/pact/${pact.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{pact.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPactTypeColor(pact.type)}`}>
                                {pact.type.charAt(0).toUpperCase() + pact.type.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-destructive">Failed</p>
                          </div>
                          <PactBadge
                            type={pact.type}
                            progress={(pact.stakedAmount / pact.targetAmount) * 100}
                            size="sm"
                            failed={true}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3 mb-1">
                          <p className="text-sm font-medium">{formatCurrency(pact.stakedAmount)}</p>
                          <p className="text-xs text-muted-foreground">of {formatCurrency(pact.targetAmount)}</p>
                        </div>
                        <Progress value={(pact.stakedAmount / pact.targetAmount) * 100} className="h-1.5 bg-muted/50" />
                      </CardContent>
                    </Card>
                  ))}

                  {failedPacts.length > 3 && (
                    <Button variant="outline" className="w-full text-sm" onClick={() => router.push("/pacts")}>
                      View {failedPacts.length - 3} more failed pacts
                    </Button>
                  )}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <Award className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No failed pacts</h3>
                    <p className="text-sm text-muted-foreground">Keep up the good work!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NavBar />
    </>
  )
}
