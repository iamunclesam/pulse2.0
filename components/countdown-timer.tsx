"use client"

import { useEffect, useState } from "react"
import { parse, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns"

interface CountdownTimerProps {
  deadline: string
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    percentage: 100,
  })

  useEffect(() => {
    // Parse the deadline string to a Date object
    const deadlineDate = parse(deadline, "MMMM d, yyyy", new Date())

    // Set initial time
    const calculateTimeLeft = () => {
      const now = new Date()

      if (deadlineDate <= now) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentage: 0,
        }
      }

      // Calculate total seconds between now and deadline
      const totalSeconds = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000)

      // Calculate percentage based on 30 days as 100%
      const totalSecondsIn30Days = 30 * 24 * 60 * 60
      const percentage = Math.min(100, (totalSeconds / totalSecondsIn30Days) * 100)

      return {
        days: differenceInDays(deadlineDate, now),
        hours: differenceInHours(deadlineDate, now) % 24,
        minutes: differenceInMinutes(deadlineDate, now) % 60,
        seconds: differenceInSeconds(deadlineDate, now) % 60,
        percentage,
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  // SVG parameters for the countdown ring
  const size = 120
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (timeLeft.percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeOpacity={0.2}
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="countdown-ring"
          />
        </svg>

        {/* Time display in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{timeLeft.days}d</div>
          <div className="text-sm">
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  )
}
