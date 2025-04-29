"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Saves a survey response to the database
 */
export async function saveSurveyResponse(data: {
  surveyId: string
  questionId: string
  audioPath: string
  email?: string
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { error } = await supabase.from("responses").insert({
      survey_id: data.surveyId,
      question_id: data.questionId,
      audio_path: data.audioPath,
      email: data.email || null,
      // expires_at will be set by the database trigger
    })

    if (error) throw error

    // Revalidate the survey responses page
    revalidatePath(`/surveys/${data.surveyId}/responses`)

    return { success: true }
  } catch (error) {
    console.error("Error saving survey response:", error)
    return { success: false, error }
  }
}

/**
 * Updates the email for a survey response
 */
export async function updateResponseEmail(responseId: string, email: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { error } = await supabase.from("responses").update({ email }).eq("id", responseId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating response email:", error)
    return { success: false, error }
  }
}
