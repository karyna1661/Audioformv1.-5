"use server"

import { SurveyService } from "@/lib/services/survey-service"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { supabaseServer } from "@/lib/supabase/server"

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

    // Format questions according to schema
    const questions = [
      {
        id: "1",
        text: topic.trim(),
        order: 1,
      },
    ]

    // Create survey using the service
    const { survey } = await SurveyService.createSurvey({
      title: topic.trim(),
      questions,
      type: "demo",
      userId,
    })

    console.log("Survey created successfully:", survey.id)

    // Revalidate relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/demo")
    revalidatePath("/surveys")
    revalidatePath(`/survey/${survey.id}`)

    // Return survey ID for redirect
    return { demoId: survey.id }
  } catch (error) {
    console.error("Error in createSurvey:", error)
    throw error
  }
}
