import { formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns"

/**
 * Calculates and formats the time remaining until expiration
 */
export function getTimeRemaining(expiresAt: string | Date): {
  formatted: string
  hours: number
  minutes: number
  isExpired: boolean
  isWarning: boolean
} {
  const now = new Date()
  const expiry = new Date(expiresAt)

  if (now >= expiry) {
    return {
      formatted: "Expired",
      hours: 0,
      minutes: 0,
      isExpired: true,
      isWarning: false,
    }
  }

  const hours = differenceInHours(expiry, now)
  const minutes = differenceInMinutes(expiry, now) % 60
  const formatted = formatDistanceToNow(expiry, { addSuffix: false })

  // Consider it a warning if less than 3 hours remaining
  const isWarning = hours < 3

  return {
    formatted,
    hours,
    minutes,
    isExpired: false,
    isWarning,
  }
}
