"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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

    // Deactivate any existing active surveys for this user
    if (userId) {
      await supabaseServer.from("surveys").update({ is_active: false }).eq("user_id", userId).eq("is_active", true)
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Format questions as expected by the database schema
    const questions = [
      {
        id: "1",
        text: topic.trim(),
        order: 1,
      },
    ]

    // Create the survey with comprehensive data
    const surveyData = {
      title: topic.trim(),
      type: "demo",
      questions: questions,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      user_id: userId,
      is_active: true,
      settings: {
        allow_anonymous: true,
        max_responses: null,
        require_email: false,
      },
      metadata: {
        created_from: "demo",
        version: "1.0",
      },
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
      status: "active",
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

    // Initialize storage bucket for responses
    try {
      const bucketPath = `surveys/${survey.id}`
      console.log("Initializing storage for survey:", bucketPath)

      // Create a placeholder file to ensure the bucket path exists
      const { error: storageError } = await supabaseServer.storage
        .from("demo-audio")
        .upload(`${bucketPath}/.keep`, new Blob([""], { type: "text/plain" }))

      if (storageError && !storageError.message.includes("already exists")) {
        console.warn("Storage initialization warning:", storageError)
      }
    } catch (storageError) {
      console.warn("Storage initialization failed:", storageError)
      // Don't fail the survey creation for storage issues
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/demo")
    revalidatePath("/surveys")
    revalidatePath(`/survey/${survey.id}`)

    console.log("Survey creation completed successfully, redirecting to response UI")

    // Redirect to the survey response UI
    redirect(`/survey/${survey.id}/respond`)
  } catch (error) {
    console.error("Error in createSurvey:", error)
    throw error
  }
}
