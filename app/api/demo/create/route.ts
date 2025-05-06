import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { trackServerEvent } from "@/app/actions/analytics"
import { createDemoSurveyFallback } from "@/app/actions/demo-fallback"

// Create a Supabase client with the service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing required environment variables for Supabase admin client")
}

const supabaseAdmin = createClient(supabaseUrl || "", serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: Request) {
  try {
    const { title, questions, email, sessionId } = await req.json()

    // Verify that the service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")

      // Use fallback method if service role key is missing
      const fallbackResult = await createDemoSurveyFallback({
        title,
        questions,
        email,
        sessionId,
      })

      if (fallbackResult.success) {
        return NextResponse.json(
          {
            demoId: fallbackResult.demoId,
            expiresAt: fallbackResult.expiresAt,
          },
          { status: 200 },
        )
      } else {
        return NextResponse.json({ error: fallbackResult.error }, { status: 500 })
      }
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create survey without requiring user creation first
    let userId = null

    // Only attempt to create/find user if email is provided
    if (email) {
      try {
        // Check if user exists
        const { data: existingUser, error: findUserError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle()

        if (findUserError) throw findUserError

        if (existingUser) {
          userId = existingUser.id
        } else {
          // Create new user
          const { data: newUser, error: createUserError } = await supabaseAdmin
            .from("users")
            .insert({ email })
            .select("id")
            .single()

          if (createUserError) throw createUserError
          userId = newUser.id
        }
      } catch (userError) {
        console.error("Error with user operation:", userError)
        // Continue without user ID if there's an error
      }
    }

    // Insert survey row using the admin client
    const { data: surveyData, error: surveyError } = await supabaseAdmin
      .from("surveys")
      .insert({
        title: title || "Demo Survey",
        type: "demo",
        questions,
        expires_at: expiresAt.toISOString(),
        user_id: userId,
      })
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)
      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
    }

    // Create demo session
    if (surveyData.id) {
      const { error: sessionError } = await supabaseAdmin.from("demo_sessions").insert({
        user_id: userId,
        survey_id: surveyData.id,
        expires_at: expiresAt.toISOString(),
      })

      if (sessionError) {
        console.error("Error creating demo session:", sessionError)
        // Continue anyway, as the survey was created successfully
      }
    }

    // Track the demo creation event
    await trackServerEvent(
      "demo_created",
      {
        title,
        question_count: questions.length,
        has_email: !!email,
      },
      {
        userId: userId || undefined,
        surveyId: surveyData.id,
        sessionId,
      },
    )

    return NextResponse.json(
      {
        demoId: surveyData.id,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error creating demo survey:", error)
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
  }
}
