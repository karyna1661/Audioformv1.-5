import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"
import { trackServerEvent } from "@/app/actions/analytics"
import { createDemoSurveyFallback } from "@/app/actions/demo-fallback"

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
        const { data: existingUser, error: findUserError } = await supabaseServer
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle()

        if (findUserError) {
          console.error("Error finding user:", findUserError)
          // Continue without user ID
        } else if (existingUser) {
          // Verify the user ID exists
          const { count, error: countError } = await supabaseServer
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("id", existingUser.id)

          if (countError) {
            console.error("Error verifying user ID:", countError)
          } else if (count && count > 0) {
            userId = existingUser.id
          } else {
            console.error("User ID exists in query but not in database:", existingUser.id)
          }
        } else {
          // Create new user
          const { data: newUser, error: createUserError } = await supabaseServer
            .from("users")
            .insert({ email })
            .select("id")
            .single()

          if (createUserError) {
            console.error("Error creating user:", createUserError)
          } else if (newUser) {
            userId = newUser.id
          }
        }
      } catch (userError) {
        console.error("Error with user operation:", userError)
        // Continue without user ID if there's an error
      }
    }

    // Insert survey row using the admin client
    // Only include user_id if we have a valid one
    const surveyData = {
      title: title || "Demo Survey",
      type: "demo",
      questions,
      expires_at: expiresAt.toISOString(),
      ...(userId ? { user_id: userId } : {}),
    }

    const { data: createdSurvey, error: surveyError } = await supabaseServer
      .from("surveys")
      .insert(surveyData)
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)

      // If there's a foreign key error, try again without the user_id
      if (surveyError.code === "23503" && surveyError.message.includes("violates foreign key constraint")) {
        console.log("Foreign key violation detected, retrying without user_id")

        const { data: retryData, error: retryError } = await supabaseServer
          .from("surveys")
          .insert({
            title: title || "Demo Survey",
            type: "demo",
            questions,
            expires_at: expiresAt.toISOString(),
            // No user_id this time
          })
          .select("id")
          .single()

        if (retryError) {
          console.error("Error in retry attempt:", retryError)
          return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
        }

        // Use the retry data
        if (retryData) {
          // Create demo session without user_id
          const { error: sessionError } = await supabaseServer.from("demo_sessions").insert({
            survey_id: retryData.id,
            expires_at: expiresAt.toISOString(),
          })

          if (sessionError) {
            console.error("Error creating demo session:", sessionError)
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
              surveyId: retryData.id,
              sessionId,
            },
          )

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
    if (createdSurvey.id) {
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
        surveyId: createdSurvey.id,
        sessionId,
      },
    )

    return NextResponse.json(
      {
        demoId: createdSurvey.id,
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error creating demo survey:", error)
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
  }
}
