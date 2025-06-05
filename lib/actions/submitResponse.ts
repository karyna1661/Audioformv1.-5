"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const schema = z.object({
  surveyId: z.string().uuid("Invalid survey ID"),
  questionId: z.string().min(1, "Question ID is required"),
  audioBlob: z.instanceof(Blob, { message: "Audio recording is required" }),
  email: z.string().email("Invalid email").optional().nullable(),
})

export async function submitResponse(formData: FormData) {
  try {
    const surveyId = formData.get("surveyId") as string
    const questionId = formData.get("questionId") as string
    const audioBlob = formData.get("audio") as Blob
    const email = formData.get("email") as string | null

    // Validate input
    const parsed = schema.safeParse({
      surveyId,
      questionId,
      audioBlob,
      email,
    })

    if (!parsed.success) {
      console.error("Validation failed:", parsed.error)
      return { success: false, error: parsed.error.errors[0].message }
    }

    // Check if survey exists and is active
    const { data: survey, error: surveyError } = await supabaseServer
      .from("surveys")
      .select("id, expires_at, is_active")
      .eq("id", surveyId)
      .single()

    if (surveyError || !survey) {
      console.error("Survey not found:", surveyError)
      return { success: false, error: "Survey not found" }
    }

    if (!survey.is_active) {
      return { success: false, error: "This survey is no longer active" }
    }

    if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
      return { success: false, error: "This survey has expired" }
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Upload audio file
    const fileName = `response_${surveyId}_${questionId}_${Date.now()}.webm`
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from("audio-responses")
      .upload(fileName, audioBlob, {
        contentType: "audio/webm",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading audio:", uploadError)
      return { success: false, error: "Failed to upload audio" }
    }

    // Save response to database
    const responseData = {
      survey_id: surveyId,
      question_id: questionId,
      audio_path: uploadData.path,
      email: email || null,
      expires_at: expiresAt.toISOString(),
    }

    const { data: response, error: responseError } = await supabaseServer
      .from("responses")
      .insert(responseData)
      .select()
      .single()

    if (responseError) {
      console.error("Error saving response:", responseError)
      return { success: false, error: "Failed to save response" }
    }

    // Revalidate paths
    revalidatePath(`/survey/${surveyId}`)

    return { success: true, responseId: response.id }
  } catch (error) {
    console.error("Error in submitResponse:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
