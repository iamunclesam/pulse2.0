"use client"

import { useEffect, useState } from "react"
import { usePactStore } from "@/lib/stores/pact-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ReputationScore() {
  const { pacts } = usePactStore()
  const [score, setScore] = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Calculate reputation score based on pact completion rate
    const completedPacts = pacts.filter((pact) => pact.completed).length
    const failedPacts = pacts.filter((pact) => pact.failed).length
    const totalPacts = completedPacts + failedPacts

    let calculatedScore = 0
    if (totalPacts > 0) {
      calculatedScore = Math.round((completedPacts / totalPacts) * 100)
    } else if (pacts.length > 0) {
      // If there are active pacts but no completed/failed ones yet, give a base score
      calculatedScore = 70
    } else {
      // New user with no pacts
      calculatedScore = 50
    }

    // Animate the score change
    setAnimate(true)
    const timer = setTimeout(() => {
      setScore(calculatedScore)
      setAnimate(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pacts])

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  // Determine reputation level
  const getReputationLevel = () => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Average"
    if (score >= 30) return "Poor"
    return "Very Poor"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full bg-background border cursor-help ${animate ? "scale-110" : "scale-100"} transition-transform`}
          >
            <span className="text-xs text-muted-foreground">Rep:</span>
            <span className={`text-sm font-bold ${getScoreColor()}`}>{score}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 p-1">
            <p className="font-semibold">Reputation Score: {getReputationLevel()}</p>
            <p className="text-xs text-muted-foreground">Based on your pact completion history</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
