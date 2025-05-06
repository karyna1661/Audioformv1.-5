"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { trackServerEvent } from "./analytics"

/**
 * Fallback method to create a demo survey without requiring the service role key
 * This uses the authenticated client with RLS policies instead
 */
export async function createDemoSurveyFallback(data: {
  title: string
  questions: Array<{ id: string; text: string }>
  email?: string
  sessionId?: string
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Insert survey row
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .insert({
        title: data.title || "Demo Survey",
        type: "demo",
        questions: data.questions,
        expires_at: expiresAt.toISOString(),
        // No user_id here as we're using the anonymous client
      })
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)
      return { success: false, error: "Failed to create survey" }
    }

    // Track the demo creation event
    await trackServerEvent(
      "demo_created",
      {
        title: data.title,
        question_count: data.questions.length,
        has_email: !!data.email,
      },
      {
        surveyId: surveyData.id,
        sessionId: data.sessionId,
      },
    )

    return {
      success: true,
      demoId: surveyData.id,
      expiresAt: expiresAt.toISOString(),
    }
  } catch (error) {
    console.error("Error in fallback demo creation:", error)
    return { success: false, error: "Failed to create survey" }
  }
}
