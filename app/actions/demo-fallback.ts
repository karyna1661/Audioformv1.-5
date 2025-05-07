"use server"

import { supabaseBrowser } from "@/lib/supabaseClient"
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
  try {
    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Insert survey row - explicitly NOT including user_id to avoid foreign key issues
    const { data: surveyData, error: surveyError } = await supabaseBrowser
      .from("surveys")
      .insert({
        title: data.title || "Demo Survey",
        type: "demo",
        questions: data.questions,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)
      return { success: false, error: "Failed to create survey" }
    }

    // Create demo session without user_id
    const { error: sessionError } = await supabaseBrowser.from("demo_sessions").insert({
      survey_id: surveyData.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating demo session:", sessionError)
      // Continue anyway as the survey was created successfully
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
