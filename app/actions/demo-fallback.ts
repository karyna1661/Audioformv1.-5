"use server"

import { supabaseBrowser } from "@/lib/supabaseClient"

type CreateDemoSurveyParams = {
  title: string
  questions: any[]
  expiresAt?: string
  email?: string
}

type CreateDemoSurveyResult = {
  demoId?: string
  expiresAt?: string
  error?: string
}

export async function createDemoSurveyFallback(params: CreateDemoSurveyParams): Promise<CreateDemoSurveyResult> {
  try {
    const { title, questions, expiresAt, email } = params

    // Calculate expiry date if not provided (24 hours from now)
    const calculatedExpiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    console.log("Attempting fallback demo creation with:", {
      title,
      questionCount: questions?.length || 0,
      expiresAt: calculatedExpiresAt,
    })

    // Use the browser client which will use RLS policies
    const { data, error } = await supabaseBrowser
      .from("surveys")
      .insert({
        title: title || "Demo Survey",
        questions: questions || [],
        type: "demo",
        expires_at: calculatedExpiresAt,
        // Explicitly set user_id to null for demo surveys
        user_id: null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error in fallback demo creation:", error)
      return { error: `Failed to create demo survey: ${error.message}` }
    }

    console.log("Demo survey created successfully:", data.id)

    // Create demo session
    try {
      const { error: sessionError } = await supabaseBrowser.from("demo_sessions").insert({
        survey_id: data.id,
        expires_at: calculatedExpiresAt,
        email: email || null,
      })

      if (sessionError) {
        console.warn("Error creating demo session:", sessionError)
        // Not fatal, continue
      }
    } catch (sessionError) {
      console.warn("Exception creating demo session:", sessionError)
      // Not fatal, continue
    }

    return {
      demoId: data.id,
      expiresAt: calculatedExpiresAt,
    }
  } catch (error) {
    console.error("Exception in fallback demo creation:", error)
    return { error: "An unexpected error occurred" }
  }
}
