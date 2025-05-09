import { NextResponse } from "next/server"
import { getSupabaseServer, supabaseBrowser } from "@/lib/supabaseClient"
import { trackServerEvent } from "@/app/actions/analytics"
import { createDemoSurveyFallback } from "@/app/actions/demo-fallback"

export async function POST(req: Request) {
  try {
    const { title, questions, email, sessionId } = await req.json()

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Try to get the server client
    const supabaseServer = getSupabaseServer()

    // First attempt: Try with service role key
    let survey
    let surveyError

    try {
      const result = await supabaseServer
        .from("surveys")
        .insert({
          title: title || "Demo Survey",
          questions,
          type: "demo",
          expires_at: expiresAt.toISOString(),
        })
        .select("id")
        .single()

      survey = result.data
      surveyError = result.error
    } catch (error) {
      console.error("Error with service role insertion:", error)
      surveyError = error
    }

    // If service role approach failed, try the fallback method
    if (surveyError) {
      console.warn("Service role insertion failed, trying fallback method")

      try {
        // Use the fallback server action that uses RLS policies
        const fallbackResult = await createDemoSurveyFallback({
          title: title || "Demo Survey",
          questions,
          expiresAt: expiresAt.toISOString(),
        })

        if (fallbackResult.error) {
          throw new Error(fallbackResult.error)
        }

        survey = { id: fallbackResult.demoId }
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError)
        return NextResponse.json({ error: "Failed to create survey using both methods" }, { status: 500 })
      }
    }

    // If we have a survey ID, create a demo session
    if (survey && survey.id) {
      // Create demo session - try with service role first
      let sessionError

      try {
        const result = await supabaseServer.from("demo_sessions").insert({
          survey_id: survey.id,
          expires_at: expiresAt.toISOString(),
          email: email || null,
        })

        sessionError = result.error
      } catch (error) {
        console.error("Error with service role session creation:", error)
        sessionError = error
      }

      // If service role failed for session, try with browser client
      if (sessionError) {
        console.warn("Service role session creation failed, trying with browser client")

        try {
          const result = await supabaseBrowser.from("demo_sessions").insert({
            survey_id: survey.id,
            expires_at: expiresAt.toISOString(),
            email: email || null,
          })

          if (result.error) {
            console.error("Browser client session creation also failed:", result.error)
            // Not fatal, continue
          }
        } catch (browserError) {
          console.error("Browser client session creation error:", browserError)
          // Not fatal, continue
        }
      }

      // Track the demo creation event if analytics tracking is available
      if (typeof trackServerEvent === "function") {
        try {
          await trackServerEvent(
            "demo_created",
            {
              title,
              question_count: questions?.length || 0,
              has_email: !!email,
            },
            {
              surveyId: survey.id,
              sessionId,
            },
          )
        } catch (analyticsError) {
          console.error("Error tracking demo creation:", analyticsError)
          // Non-fatal, continue
        }
      }

      return NextResponse.json(
        {
          demoId: survey.id,
          expiresAt: expiresAt.toISOString(),
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in demo-create API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
