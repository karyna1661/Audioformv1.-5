import { createClient } from "@/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Get or create a session ID for the current user
function getSessionId(): string {
  if (typeof window === "undefined") return ""

  let sessionId = localStorage.getItem("audioform_session_id")
  if (!sessionId) {
    sessionId = uuidv4()
    localStorage.setItem("audioform_session_id", sessionId)
  }
  return sessionId
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: string,
  properties: Record<string, any> = {},
  options: { userId?: string; surveyId?: string } = {},
) {
  try {
    const supabase = createClient()
    const sessionId = getSessionId()

    // Get user agent
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : ""

    // Track the event
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      user_id: options.userId || null,
      session_id: sessionId,
      survey_id: options.surveyId || null,
      properties,
      user_agent: userAgent,
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

    return true
  } catch (error) {
    console.error("Error tracking event:", error)
    return false
  }
}

/**
 * Update the conversion funnel for a user
 */
async function updateConversionFunnel(
  step: string,
  sessionId: string,
  properties: Record<string, any> = {},
  options: { userId?: string; surveyId?: string } = {},
) {
  try {
    const supabase = createClient()

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
 * Track a page view
 */
export function trackPageView(pageName: string, properties: Record<string, any> = {}) {
  return trackEvent("page_view", { page: pageName, ...properties })
}

/**
 * Get the current user ID if available
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id || null
  } catch (error) {
    return null
  }
}
