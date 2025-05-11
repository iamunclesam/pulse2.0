"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useStreakStore } from "@/lib/stores/streak-store"

export function StreakCounter() {
  const { streak, checkStreak } = useStreakStore()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    checkStreak()

    // Add animation effect
    const timer = setTimeout(() => {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 1000)
    }, 500)

    return () => clearTimeout(timer)
  }, [checkStreak])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 cursor-help ${animate ? "scale-110" : "scale-100"} transition-transform`}
          >
            <Flame
              className={`h-4 w-4 ${streak >= 7 ? "text-orange-500" : "text-orange-400"} ${animate ? "animate-pulse" : ""}`}
            />
            <span className="text-sm font-bold">{streak}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2 p-1">
            <p className="font-semibold">
              {streak === 0
                ? "Start your streak today!"
                : streak === 1
                  ? "1 day streak! Keep it up!"
                  : `${streak} day streak!`}
            </p>
            <p className="text-xs text-muted-foreground">
              {streak < 3
                ? "Visit daily to build your streak"
                : streak < 7
                  ? "You're building momentum!"
                  : "You're on fire! 🔥"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
