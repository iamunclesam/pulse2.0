"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePactStore } from "@/lib/stores/pact-store"
import { useCurrencyStore } from "@/lib/stores/currency-store"
import { formatCurrency, formatNaira } from "@/lib/utils"
import { PactBadge } from "@/components/pact-badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Filter, Plus, Search, User, Users, Globe, Coins } from "lucide-react"

export function AllPactsView() {
  const router = useRouter()
  const { pacts, fetchPacts } = usePactStore()
  const { currency, toggleCurrency } = useCurrencyStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    fetchPacts()
  }, [fetchPacts])

  const formatAmount = (amount: number) => {
    return currency === "ADA" ? formatCurrency(amount) : formatNaira(amount)
  }

  // Calculate totals
  const totalStaked = pacts.reduce((sum, pact) => sum + pact.stakedAmount, 0)
  const totalGoal = pacts.reduce((sum, pact) => sum + pact.targetAmount, 0)

  // Filter pacts based on search, type, and status
  const filteredPacts = pacts.filter((pact) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      pact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pact.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Type filter
    const matchesType = typeFilter === "all" || pact.type === typeFilter

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !pact.completed && !pact.failed) ||
      (statusFilter === "completed" && pact.completed) ||
      (statusFilter === "failed" && pact.failed)

    return matchesSearch && matchesType && matchesStatus
  })

  // Sort pacts
  const sortedPacts = [...filteredPacts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return Number.parseInt(b.id) - Number.parseInt(a.id)
      case "oldest":
        return Number.parseInt(a.id) - Number.parseInt(b.id)
      case "amount-high":
        return b.targetAmount - a.targetAmount
      case "amount-low":
        return a.targetAmount - b.targetAmount
      case "progress-high":
        return b.stakedAmount / b.targetAmount - a.stakedAmount / a.targetAmount
      case "progress-low":
        return a.stakedAmount / a.targetAmount - b.stakedAmount / b.targetAmount
      default:
        return 0
    }
  })

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

  const getPactTypeIcon = (type: string) => {
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

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/90 to-primary">
        <CardContent className="p-4 text-white">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Total Staked</p>
                <p className="text-2xl font-bold">{formatAmount(totalStaked)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90 text-right">Total Goals</p>
                <p className="text-2xl font-bold">{formatAmount(totalGoal)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round((totalStaked / totalGoal) * 100)}%</span>
              </div>
              <Progress
                value={(totalStaked / totalGoal) * 100}
                className="h-2 progress-bar-animate bg-white/20"
                indicatorClassName="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search pacts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={toggleCurrency}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-xs bg-primary hover:bg-primary/90 rounded-full"
            onClick={() => router.push("/create")}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="duo">Duo</SelectItem>
              <SelectItem value="cause">Cause</SelectItem>
              <SelectItem value="borrow">Borrow</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount-high">Highest Amount</SelectItem>
              <SelectItem value="amount-low">Lowest Amount</SelectItem>
              <SelectItem value="progress-high">Most Progress</SelectItem>
              <SelectItem value="progress-low">Least Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pacts List */}
      <div className="space-y-3">
        {sortedPacts.length > 0 ? (
          sortedPacts.map((pact, index) => {
            const progress = (pact.stakedAmount / pact.targetAmount) * 100

            return (
              <Card
                key={pact.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors pact-card-enter shadow-sm"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                      <p className="text-sm text-muted-foreground">
                        {pact.completed ? (
                          <span className="text-green-500">Completed</span>
                        ) : pact.failed ? (
                          <span className="text-red-500">Failed</span>
                        ) : (
                          pact.deadline
                        )}
                      </p>
                    </div>
                    <PactBadge
                      type={pact.type}
                      progress={progress}
                      size="sm"
                      completed={pact.completed}
                      failed={pact.failed}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 mb-1">
                    <p className="text-sm font-medium">{formatAmount(pact.stakedAmount)}</p>
                    <p className="text-xs text-muted-foreground">of {formatAmount(pact.targetAmount)}</p>
                  </div>
                  <Progress
                    value={progress}
                    className={`h-1.5 ${!pact.failed ? "progress-bar-animate" : "bg-muted/50"}`}
                  />
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pacts found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
