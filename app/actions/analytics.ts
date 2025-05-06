"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

/**
 * Track an analytics event from server components
 */
export async function trackServerEvent(
  eventType: string,
  properties: Record<string, any> = {},
  options: { userId?: string; surveyId?: string; sessionId?: string } = {},
) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Generate a session ID if not provided
    const sessionId = options.sessionId || uuidv4()

    // Track the event
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      user_id: options.userId || null,
      session_id: sessionId,
      survey_id: options.surveyId || null,
      properties,
    })

    // If this is a funnel step, update the conversion funnel
    if (
      [
        "demo_created",
        "demo_viewed",
        "demo_shared",
        "responses_received",
        "expiry_notification_shown",
        "waitlist_modal_opened",
        "waitlist_joined",
      ].includes(eventType)
    ) {
      await updateConversionFunnel(eventType, sessionId, properties, options)
    }

    return { success: true, sessionId }
  } catch (error) {
    console.error("Error tracking server event:", error)
    return { success: false, error }
  }
}

/**
 * Update the conversion funnel for a user from server components
 */
async function updateConversionFunnel(
  step: string,
  sessionId: string,
  properties: Record<string, any> = {},
  options: { userId?: string; surveyId?: string } = {},
) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the demo conversion funnel
    const { data: funnels } = await supabase
      .from("analytics_funnels")
      .select("id")
      .eq("name", "Demo to Waitlist Conversion")
      .limit(1)

    if (!funnels || funnels.length === 0) return false

    const funnelId = funnels[0].id

    // Check if the user is already in this funnel
    const { data: existingConversions } = await supabase
      .from("analytics_conversions")
      .select("id, current_step, completed")
      .eq("funnel_id", funnelId)
      .eq("session_id", sessionId)
      .limit(1)

    const isCompleted = step === "waitlist_joined"
    const conversionProperties = {
      ...properties,
      survey_id: options.surveyId,
    }

    if (existingConversions && existingConversions.length > 0) {
      // Update the existing conversion
      await supabase
        .from("analytics_conversions")
        .update({
          current_step: step,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          properties: conversionProperties,
          user_id: options.userId || existingConversions[0].user_id,
        })
        .eq("id", existingConversions[0].id)
    } else {
      // Create a new conversion
      await supabase.from("analytics_conversions").insert({
        funnel_id: funnelId,
        user_id: options.userId || null,
        session_id: sessionId,
        current_step: step,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        properties: conversionProperties,
      })
    }

    return true
  } catch (error) {
    console.error("Error updating conversion funnel:", error)
    return false
  }
}

/**
 * Calculate and store aggregated metrics
 */
export async function calculateMetrics(timeframe: "daily" | "weekly" | "monthly" = "daily") {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

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
    const { count: demoCount } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact" })
      .eq("event_type", "demo_created")
      .gte("created_at", startDateStr)
      .lt("created_at", endDateStr)

    // Calculate waitlist signup count
    const { count: waitlistCount } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact" })
      .eq("event_type", "waitlist_joined")
      .gte("created_at", startDateStr)
      .lt("created_at", endDateStr)

    // Calculate conversion rate
    const conversionRate = demoCount > 0 ? (waitlistCount / demoCount) * 100 : 0

    // Store metrics
    await supabase.from("analytics_metrics").insert([
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

    return { success: true }
  } catch (error) {
    console.error("Error calculating metrics:", error)
    return { success: false, error }
  }
}
