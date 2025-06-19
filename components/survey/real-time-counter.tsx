"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Users, TrendingUp, Activity, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { theme } from "@/lib/theme/colors"
import type { Database } from "@/types/database.types"

interface RealTimeCounterProps {
  surveyId: string
  initialCount?: number
  className?: string
}

interface CountData {
  total: number
  today: number
  thisHour: number
}

export function RealTimeCounter({ surveyId, initialCount = 0, className }: RealTimeCounterProps) {
  const [counts, setCounts] = useState<CountData>({ total: initialCount, today: 0, thisHour: 0 })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const supabase = createClientComponentClient<Database>()
  const channelRef = useRef<any>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Enhanced fetch counts with proper error handling
  const fetchCounts = useCallback(async () => {
    if (!surveyId) {
      setError("Survey ID is required")
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      console.log("Fetching counts for survey:", surveyId)

      // Get current date boundaries
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).toISOString()

      // Fetch total count
      const { count: totalCount, error: totalError } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)

      if (totalError) {
        console.error("Error fetching total count:", totalError)
        throw new Error(`Failed to fetch total responses: ${totalError.message}`)
      }

      // Fetch today's count
      const { count: todayCount, error: todayError } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)
        .gte("created_at", todayStart)

      if (todayError) {
        console.error("Error fetching today's count:", todayError)
        throw new Error(`Failed to fetch today's responses: ${todayError.message}`)
      }

      // Fetch this hour's count
      const { count: hourCount, error: hourError } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)
        .gte("created_at", hourStart)

      if (hourError) {
        console.error("Error fetching hour count:", hourError)
        throw new Error(`Failed to fetch hourly responses: ${hourError.message}`)
      }

      const newCounts = {
        total: totalCount || 0,
        today: todayCount || 0,
        thisHour: hourCount || 0,
      }

      setCounts(newCounts)
      setLastUpdate(new Date())
      setError(null)

      console.log("Counts updated successfully:", newCounts)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      console.error("Error in fetchCounts:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [surveyId, supabase])

  // Set up real-time subscription with retry logic
  const setupRealtimeSubscription = useCallback(() => {
    if (!surveyId || channelRef.current) return

    console.log("Setting up real-time subscription for survey:", surveyId)

    const channelName = `survey-responses-${surveyId}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `survey_id=eq.${surveyId}`,
        },
        (payload) => {
          console.log("Real-time response received:", payload)

          setCounts((prev) => {
            const newTotal = prev.total + 1

            // Check if response is from today
            const responseDate = new Date(payload.new.created_at)
            const today = new Date()
            const isToday = responseDate.toDateString() === today.toDateString()
            const isThisHour = isToday && responseDate.getHours() === today.getHours()

            const newCounts = {
              total: newTotal,
              today: isToday ? prev.today + 1 : prev.today,
              thisHour: isThisHour ? prev.thisHour + 1 : prev.thisHour,
            }

            console.log("Counts updated via real-time:", newCounts)
            return newCounts
          })

          setLastUpdate(new Date())
        },
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status)
        setIsConnected(status === "SUBSCRIBED")

        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          // Retry connection after delay
          retryTimeoutRef.current = setTimeout(() => {
            console.log("Retrying real-time connection...")
            setupRealtimeSubscription()
          }, 5000)
        }
      })

    channelRef.current = channel
  }, [surveyId, supabase])

  // Initial data fetch
  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // Set up real-time subscription
  useEffect(() => {
    setupRealtimeSubscription()

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up real-time subscription")
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [setupRealtimeSubscription, supabase])

  // Manual refresh function
  const handleRefresh = () => {
    setIsLoading(true)
    fetchCounts()
  }

  if (isLoading && counts.total === 0) {
    return (
      <Card className={`border-indigo-100 shadow-sm ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-600">Loading response data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-indigo-100 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with connection status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">{isConnected ? "Live Updates Active" : "Connecting..."}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${theme.primary.border} ${theme.primary.text}`}>
                <Activity className="w-3 h-3 mr-1" />
                Real-time
              </Badge>
              <button
                onClick={handleRefresh}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 text-sm">
                {error}
                <button onClick={handleRefresh} className="ml-2 underline hover:no-underline">
                  Try again
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Response counts grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {counts.total}
              </div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Total
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${theme.success.text}`}>{counts.today}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Today
              </div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold ${theme.secondary.text}`}>{counts.thisHour}</div>
              <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                This Hour
              </div>
            </div>
          </div>

          {/* Last update timestamp */}
          {lastUpdate && (
            <div className="text-center">
              <p className="text-xs text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          )}

          {/* Connection indicator */}
          <div className="flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
