"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Creates a new demo session
 */
export async function createDemoSession(data: {
  userId: string | null
  surveyId: string
  email?: string
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // If we have an email but no userId, create or get the user first
    let userId = data.userId
    if (!userId && data.email) {
      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", data.email).single()

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create new user
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert({ email: data.email })
          .select("id")
          .single()

        if (userError) throw userError
        userId = newUser.id
      }
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create demo session
    const { error } = await supabase.from("demo_sessions").insert({
      user_id: userId,
      survey_id: data.surveyId,
      expires_at: expiresAt.toISOString(),
    })

    if (error) throw error

    return { success: true, expiresAt: expiresAt.toISOString() }
  } catch (error) {
    console.error("Error creating demo session:", error)
    return { success: false, error }
  }
}

/**
 * Gets the demo session status
 */
export async function getDemoSessionStatus(surveyId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("demo_sessions")
      .select("*, surveys(is_active)")
      .eq("survey_id", surveyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No session found
        return { exists: false }
      }
      throw error
    }

    const now = new Date()
    const expiresAt = new Date(data.expires_at)
    const isExpired = now >= expiresAt
    const isActive = data.surveys?.is_active || false

    return {
      exists: true,
      isExpired,
      isActive,
      expiresAt: data.expires_at,
      notified: data.notified,
    }
  } catch (error) {
    console.error("Error getting demo session status:", error)
    return { exists: false, error }
  }
}

/**
 * Updates the notification status for a demo session
 */
export async function markDemoSessionNotified(surveyId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { error } = await supabase.from("demo_sessions").update({ notified: true }).eq("survey_id", surveyId)

    if (error) throw error

    revalidatePath(`/demo?demoId=${surveyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating demo session notification status:", error)
    return { success: false, error }
  }
}
