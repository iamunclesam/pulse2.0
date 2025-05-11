"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePactStore } from "@/lib/stores/pact-store"
import { formatCurrency, formatNaira } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { User, Users, Globe, Coins, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrencyStore } from "@/lib/stores/currency-store"

export function StatsView() {
  const { pacts, fetchPacts } = usePactStore()
  const { currency, toggleCurrency } = useCurrencyStore()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchPacts()
  }, [fetchPacts])

  const totalStaked = pacts.reduce((sum, pact) => sum + pact.stakedAmount, 0)
  const totalGoal = pacts.reduce((sum, pact) => sum + pact.targetAmount, 0)
  const completedPacts = pacts.filter((pact) => pact.completed).length
  const failedPacts = pacts.filter((pact) => pact.failed).length
  const activePacts = pacts.filter((pact) => !pact.completed && !pact.failed).length

  // Data for status pie chart
  const statusData = [
    { name: "Completed", value: completedPacts, color: "#10b981" },
    { name: "Active", value: activePacts, color: "#6366f1" },
    { name: "Failed", value: failedPacts, color: "#ef4444" },
  ].filter((item) => item.value > 0)

  // Data for type pie chart
  const typeCounts = pacts.reduce(
    (acc, pact) => {
      acc[pact.type] = (acc[pact.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const typeData = [
    { name: "Solo", value: typeCounts.solo || 0, color: "#3b82f6" },
    { name: "Duo", value: typeCounts.duo || 0, color: "#8b5cf6" },
    { name: "Cause", value: typeCounts.cause || 0, color: "#10b981" },
    { name: "Borrow", value: typeCounts.borrow || 0, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  // Data for bar chart
  const pactsData = pacts.map((pact) => ({
    name: pact.title.length > 10 ? pact.title.substring(0, 10) + "..." : pact.title,
    staked: pact.stakedAmount,
    target: pact.targetAmount,
    type: pact.type,
  }))

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "solo":
        return <User className="h-4 w-4 text-blue-500" />
      case "duo":
        return <Users className="h-4 w-4 text-purple-500" />
      case "cause":
        return <Globe className="h-4 w-4 text-green-500" />
      case "borrow":
        return <Coins className="h-4 w-4 text-amber-500" />
      default:
        return null
    }
  }

  const formatAmount = (amount: number) => {
    return currency === "ADA" ? formatCurrency(amount) : formatNaira(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Financial Overview</h2>
        <Button variant="outline" size="sm" onClick={toggleCurrency} className="flex items-center gap-1">
          <ArrowRightLeft className="h-3 w-3 mr-1" />
          {currency === "ADA" ? "Show in ₦" : "Show in ADA"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatAmount(totalStaked)}</p>
            <p className="text-sm text-muted-foreground">of {formatAmount(totalGoal)} goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pacts.length}</p>
            <p className="text-sm text-muted-foreground">{completedPacts} completed</p>
          </CardContent>
        </Card>
      </div>

      {pacts.length > 0 && (
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pact Status</CardTitle>
                <CardDescription>Distribution of pact statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Coins className="h-4 w-4 text-green-500" />
                      </div>
                      <span>Total Staked</span>
                    </div>
                    <span className="font-bold">{formatAmount(totalStaked)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-500" />
                      </div>
                      <span>Solo Pacts</span>
                    </div>
                    <span className="font-bold">
                      {formatAmount(pacts.filter((p) => p.type === "solo").reduce((sum, p) => sum + p.stakedAmount, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-500" />
                      </div>
                      <span>Duo Pacts</span>
                    </div>
                    <span className="font-bold">
                      {formatAmount(pacts.filter((p) => p.type === "duo").reduce((sum, p) => sum + p.stakedAmount, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-green-500" />
                      </div>
                      <span>Cause Pacts</span>
                    </div>
                    <span className="font-bold">
                      {formatAmount(
                        pacts.filter((p) => p.type === "cause").reduce((sum, p) => sum + p.stakedAmount, 0),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Coins className="h-4 w-4 text-amber-500" />
                      </div>
                      <span>Borrow Pacts</span>
                    </div>
                    <span className="font-bold">
                      {formatAmount(
                        pacts.filter((p) => p.type === "borrow").reduce((sum, p) => sum + p.stakedAmount, 0),
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pact Types</CardTitle>
                <CardDescription>Distribution of pact types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type Breakdown</CardTitle>
                <CardDescription>Details by pact type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeData.map((type, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type.name.toLowerCase())}
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <span className="text-sm">{type.value} pacts</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total staked</span>
                        <span>
                          {formatAmount(
                            pacts
                              .filter((p) => p.type === type.name.toLowerCase())
                              .reduce((sum, p) => sum + p.stakedAmount, 0),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completion rate</span>
                        <span>
                          {Math.round(
                            (pacts.filter((p) => p.type === type.name.toLowerCase() && p.completed).length /
                              Math.max(1, pacts.filter((p) => p.type === type.name.toLowerCase()).length)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pact Progress</CardTitle>
                <CardDescription>Staked amount vs target for each pact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pactsData}
                      margin={{
                        top: 20,
                        right: 0,
                        left: 0,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatAmount(value as number)}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-background p-2 border rounded-md shadow-sm">
                                <p className="font-bold flex items-center gap-1">
                                  {getTypeIcon(data.type)} {label}
                                </p>
                                <p className="text-sm">
                                  <span className="text-[#10b981]">Staked: </span>
                                  {formatAmount(data.staked)}
                                </p>
                                <p className="text-sm">
                                  <span className="text-[#6366f1]">Target: </span>
                                  {formatAmount(data.target)}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="staked" name="Staked" fill="#10b981" />
                      <Bar dataKey="target" name="Target" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rates</CardTitle>
                <CardDescription>Success rates by pact type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {typeData.map((type, index) => {
                    const typePacts = pacts.filter((p) => p.type === type.name.toLowerCase())
                    const completedCount = typePacts.filter((p) => p.completed).length
                    const failedCount = typePacts.filter((p) => p.failed).length
                    const totalFinished = completedCount + failedCount
                    const successRate = totalFinished > 0 ? (completedCount / totalFinished) * 100 : 0

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type.name.toLowerCase())}
                            <span className="font-medium">{type.name}</span>
                          </div>
                          <span className="text-sm">{Math.round(successRate)}% success</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${successRate}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{completedCount} completed</span>
                          <span>{failedCount} failed</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
