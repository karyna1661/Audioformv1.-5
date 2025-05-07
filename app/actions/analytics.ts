"use server"

import { supabaseServer } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"

/**
 * Track an analytics event from server components
 */
export async function trackServerEvent(
  eventName: string,
  properties: Record<string, any> = {},
  options: { userId?: string; surveyId?: string; sessionId?: string } = {},
) {
  try {
    // Generate a session ID if not provided
    const sessionId = options.sessionId || uuidv4()

    // Add additional context to properties
    const enrichedProperties = {
      ...properties,
      user_id: options.userId || null,
      survey_id: options.surveyId || null,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    }

    // Track the event using the simplified analytics_events table
    await supabaseServer.from("analytics_events").insert({
      event_name: eventName,
      properties: enrichedProperties,
    })

    return { success: true, sessionId }
  } catch (error) {
    console.error("Error tracking server event:", error)
    return { success: false, error }
  }
}

/**
 * Calculate and store aggregated metrics
 */
export async function calculateMetrics(timeframe: "daily" | "weekly" | "monthly" = "daily") {
  try {
    // Define date range based on timeframe
    const endDate = new Date()
    const startDate = new Date()

    if (timeframe === "daily") {
      startDate.setDate(startDate.getDate() - 1)
    } else if (timeframe === "weekly") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeframe === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    // Format dates for database queries
    const startDateStr = startDate.toISOString()
    const endDateStr = endDate.toISOString()

    // Calculate demo creation count
    const { count: demoCount, error: demoError } = await supabaseServer
      .from("analytics_events")
      .select("id", { count: "exact" })
      .eq("event_name", "demo_created")
      .gte("created_at", startDateStr)
      .lt("created_at", endDateStr)

    if (demoError) throw demoError

    // Calculate waitlist signup count
    const { count: waitlistCount, error: waitlistError } = await supabaseServer
      .from("analytics_events")
      .select("id", { count: "exact" })
      .eq("event_name", "waitlist_joined")
      .gte("created_at", startDateStr)
      .lt("created_at", endDateStr)

    if (waitlistError) throw waitlistError

    // Calculate conversion rate
    const conversionRate = demoCount > 0 ? (waitlistCount / demoCount) * 100 : 0

    // Store metrics
    const { error: metricsError } = await supabaseServer.from("analytics_metrics").insert([
      {
        metric_name: "demo_count",
        metric_value: demoCount,
        time_period: timeframe,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
      {
        metric_name: "waitlist_count",
        metric_value: waitlistCount,
        time_period: timeframe,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
      {
        metric_name: "conversion_rate",
        metric_value: conversionRate,
        time_period: timeframe,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
    ])

    if (metricsError) throw metricsError

    return { success: true }
  } catch (error) {
    console.error("Error calculating metrics:", error)
    return { success: false, error }
  }
}
