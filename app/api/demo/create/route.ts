import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, questions, email, sessionId } = body

    // Validate required fields
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Questions array is required and must not be empty" }, { status: 400 })
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required and must be a string" }, { status: 400 })
    }

    // Validate questions format
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      if (!question || typeof question !== "string" || question.trim().length === 0) {
        return NextResponse.json({ error: `Question ${i + 1} is invalid or empty` }, { status: 400 })
      }
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    let userId = null

    // Only attempt to create/find user if email is provided
    if (email && typeof email === "string" && email.trim().length > 0) {
      try {
        // Check if user exists
        const { data: existingUser, error: findUserError } = await supabaseServer
          .from("users")
          .select("id")
          .eq("email", email.trim())
          .maybeSingle()

        if (!findUserError && existingUser) {
          userId = existingUser.id
        } else {
          // Create new user
          const { data: newUser, error: createUserError } = await supabaseServer
            .from("users")
            .insert({ email: email.trim() })
            .select("id")
            .single()

          if (!createUserError && newUser) {
            userId = newUser.id
          }
        }
      } catch (userError) {
        console.error("Error with user operation:", userError)
        // Continue without user ID if there's an error
      }
    }

    // Prepare survey data
    const surveyData = {
      title: title.trim(),
      type: "demo" as const,
      questions: questions.map((q) => q.trim()),
      expires_at: expiresAt.toISOString(),
      ...(userId ? { user_id: userId } : {}),
    }

    // Insert survey
    const { data: createdSurvey, error: surveyError } = await supabaseServer
      .from("surveys")
      .insert(surveyData)
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)

      // If there's a foreign key error, try again without the user_id
      if (surveyError.code === "23503") {
        const { data: retryData, error: retryError } = await supabaseServer
          .from("surveys")
          .insert({
            title: title.trim(),
            type: "demo" as const,
            questions: questions.map((q) => q.trim()),
            expires_at: expiresAt.toISOString(),
          })
          .select("id")
          .single()

        if (retryError) {
          console.error("Error in retry attempt:", retryError)
          return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
        }

        if (retryData) {
          // Create demo session without user_id
          const { error: sessionError } = await supabaseServer.from("demo_sessions").insert({
            survey_id: retryData.id,
            expires_at: expiresAt.toISOString(),
          })

          if (sessionError) {
            console.error("Error creating demo session:", sessionError)
          }

          return NextResponse.json(
            {
              demoId: retryData.id,
              expiresAt: expiresAt.toISOString(),
            },
            { status: 200 },
          )
        }
      }

      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
    }

    // Create demo session
    if (createdSurvey?.id) {
      const sessionData = {
        survey_id: createdSurvey.id,
        expires_at: expiresAt.toISOString(),
        ...(userId ? { user_id: userId } : {}),
      }

      const { error: sessionError } = await supabaseServer.from("demo_sessions").insert(sessionData)

      if (sessionError) {
        console.error("Error creating demo session:", sessionError)
        // Continue anyway, as the survey was created successfully
      }
    }

    return NextResponse.json(
      {
        demoId: createdSurvey.id,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error creating demo survey:", error)
    return NextResponse.json({ error: "Invalid request data or server error" }, { status: 500 })
  }
}
