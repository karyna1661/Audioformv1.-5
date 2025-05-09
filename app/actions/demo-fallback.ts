"use server"

import { supabaseBrowser } from "@/lib/supabaseClient"

type CreateDemoSurveyParams = {
  title: string
  questions: any[]
  expiresAt: string
}

type CreateDemoSurveyResult = {
  demoId?: string
  expiresAt?: string
  error?: string
}

export async function createDemoSurveyFallback(params: CreateDemoSurveyParams): Promise<CreateDemoSurveyResult> {
  try {
    const { title, questions, expiresAt } = params

    // Use the browser client which will use RLS policies
    const { data, error } = await supabaseBrowser
      .from("surveys")
      .insert({
        title,
        questions,
        type: "demo",
        expires_at: expiresAt,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error in fallback demo creation:", error)
      return { error: `Failed to create demo survey: ${error.message}` }
    }

    return {
      demoId: data.id,
      expiresAt,
    }
  } catch (error) {
    console.error("Exception in fallback demo creation:", error)
    return { error: "An unexpected error occurred" }
  }
}
