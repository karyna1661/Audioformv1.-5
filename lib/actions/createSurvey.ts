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

    // Create the survey/demo
    const surveyData = {
      topic: topic.trim(),
      user_id: userId,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }

    console.log("Inserting survey data:", surveyData)

    const { data, error } = await supabaseServer.from("demos").insert(surveyData).select().single()

    if (error) {
      console.error("Database error:", error)
      throw new Error(`Failed to create survey: ${error.message}`)
    }

    if (!data) {
      console.error("No data returned from insert")
      throw new Error("Failed to create survey: No data returned")
    }

    console.log("Survey created successfully:", data)

    // Revalidate relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/demo")

    return { demoId: data.id }
  } catch (error) {
    console.error("Error in createSurvey:", error)
    throw error
  }
}
