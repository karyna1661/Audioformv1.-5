"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle } from "lucide-react"
import { getTimeRemaining } from "@/utils/date-utils"
import { cn } from "@/lib/utils"

interface ExpirationStatusProps {
  expiresAt: string
  isExpired?: boolean
  className?: string
  showIcon?: boolean
  variant?: "default" | "outline" | "warning" | "danger"
}

export function ExpirationStatus({
  expiresAt,
  isExpired: initialIsExpired,
  className,
  showIcon = true,
  variant = "outline",
}: ExpirationStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt))

  useEffect(() => {
    // Update time remaining every minute
    const interval = setInterval(() => {
      const newTimeRemaining = getTimeRemaining(expiresAt)
      setTimeRemaining(newTimeRemaining)
    }, 60000)

    return () => clearInterval(interval)
  }, [expiresAt])

  // Determine the variant based on time remaining
  const computedVariant = timeRemaining.isExpired ? "danger" : timeRemaining.isWarning ? "warning" : variant

  // Determine the badge styles based on variant
  const badgeStyles = {
    default: "",
    outline: "",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-800 border-red-200",
  }

  return (
    <Badge
      variant={computedVariant === "default" || computedVariant === "outline" ? computedVariant : "outline"}
      className={cn("flex items-center gap-1", badgeStyles[computedVariant], className)}
    >
      {showIcon &&
        (timeRemaining.isExpired || timeRemaining.isWarning ? (
          <AlertTriangle className="h-3 w-3" />
        ) : (
          <Clock className="h-3 w-3" />
        ))}
      {timeRemaining.isExpired ? "Expired" : `${timeRemaining.formatted} remaining`}
    </Badge>
  )
}
