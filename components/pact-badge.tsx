"use client"

import { useEffect, useState } from "react"

interface PactBadgeProps {
  type: string
  progress: number
  size?: "sm" | "md" | "lg"
  completed?: boolean
  failed?: boolean
}

export function PactBadge({ type, progress, size = "md", completed = false, failed = false }: PactBadgeProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Add animation after component mounts
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Size configurations
  const sizeConfig = {
    sm: { width: 40, height: 40, strokeWidth: 3 },
    md: { width: 80, height: 80, strokeWidth: 4 },
    lg: { width: 120, height: 120, strokeWidth: 5 },
  }

  const { width, height, strokeWidth } = sizeConfig[size]
  const radius = width / 2 - strokeWidth * 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Badge colors based on pact type
  const getTypeColors = () => {
    switch (type) {
      case "solo":
        return { fill: "#3B82F6", stroke: "#60A5FA" }
      case "duo":
        return { fill: "#8B5CF6", stroke: "#A78BFA" }
      case "cause":
        return { fill: "#10B981", stroke: "#34D399" }
      default:
        return { fill: "#6B7280", stroke: "#9CA3AF" }
    }
  }

  const { fill, stroke } = getTypeColors()

  // Status-based styling
  const getStatusStyles = () => {
    if (completed) {
      return {
        iconColor: "#10B981",
        ringColor: "#10B981",
        glow: "filter drop-shadow(0 0 0.5rem rgba(16, 185, 129, 0.5))",
      }
    }
    if (failed) {
      return {
        iconColor: "#EF4444",
        ringColor: "#EF4444",
        glow: "filter drop-shadow(0 0 0.5rem rgba(239, 68, 68, 0.5))",
      }
    }
    return {
      iconColor: stroke,
      ringColor: stroke,
      glow: progress >= 75 ? "badge-glow" : "",
    }
  }

  const { iconColor, ringColor, glow } = getStatusStyles()

  // Icon based on pact type
  const renderIcon = () => {
    const iconSize = size === "sm" ? 16 : size === "md" ? 32 : 48

    if (completed) {
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }

    if (failed) {
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    }

    switch (type) {
      case "solo":
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 20C18 16.6863 15.3137 14 12 14C8.68629 14 6 16.6863 6 20"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "duo":
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17 20C17 18.3431 14.7614 17 12 17C9.23858 17 7 18.3431 7 20"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 13C16.6569 13 18 11.6569 18 10C18 8.34315 16.6569 7 15 7"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 13C7.34315 13 6 11.6569 6 10C6 8.34315 7.34315 7 9 7"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "cause":
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 16V12" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8H12.01" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      default:
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
    }
  }

  return (
    <div className={`relative ${glow}`} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill={fill}
          fillOpacity="0.2"
          stroke={stroke}
          strokeWidth={strokeWidth / 2}
          strokeOpacity="0.3"
        />

        {/* Progress ring */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? strokeDashoffset : circumference}
          className="countdown-ring"
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">{renderIcon()}</div>
    </div>
  )
}
