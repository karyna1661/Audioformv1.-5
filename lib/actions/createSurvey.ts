"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const schema = z.object({
  topic: z.string().min(1, "Topic is required").max(500, "Topic is too long"),
})

export async function createSurvey(topic: string) {
  console.log("createSurvey called with topic:", topic)

  try {
    // Validate input
    const parsed = schema.safeParse({ topic })
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error)
      throw new Error("Invalid topic: " + parsed.error.errors[0].message)
    }

    // Get user (optional for demo)
    const { data: userData, error: userError } = await supabaseServer.auth.getUser()

    let userId = null
    if (userData?.user && !userError) {
      userId = userData.user.id
      console.log("User authenticated:", userId)
    } else {
      console.log("No authenticated user, creating anonymous demo")
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Format questions as expected by the database schema
    const questions = [
      {
        id: "1",
        text: topic.trim(),
      },
    ]

    // Create the survey
    const surveyData = {
      title: topic.trim(),
      type: "demo",
      questions: questions,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      user_id: userId,
      is_active: true,
    }

    console.log("Inserting survey data:", surveyData)

    const { data: survey, error: surveyError } = await supabaseServer
      .from("surveys")
      .insert(surveyData)
      .select()
      .single()

    if (surveyError) {
      console.error("Database error creating survey:", surveyError)
      throw new Error(`Failed to create survey: ${surveyError.message}`)
    }

    if (!survey) {
      console.error("No data returned from survey insert")
      throw new Error("Failed to create survey: No data returned")
    }

    console.log("Survey created successfully:", survey)

    // Create demo session
    const sessionData = {
      survey_id: survey.id,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      notified: false,
      user_id: userId,
    }

    const { data: session, error: sessionError } = await supabaseServer
      .from("demo_sessions")
      .insert(sessionData)
      .select()

    if (sessionError) {
      console.error("Error creating demo session:", sessionError)
      // Continue anyway since the survey was created
    } else {
      console.log("Demo session created successfully:", session)
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/demo")

    return { demoId: survey.id }
  } catch (error) {
    console.error("Error in createSurvey:", error)
    throw error
  }
}
