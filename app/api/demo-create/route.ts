import { NextResponse } from "next/server"
import { getSupabaseServer, supabaseBrowser } from "@/lib/supabaseClient"
import { trackServerEvent } from "@/app/actions/analytics"
import { createDemoSurveyFallback } from "@/app/actions/demo-fallback"

export async function POST(req: Request) {
  try {
    const { title, questions, email, sessionId } = await req.json()

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const expiresAtISO = expiresAt.toISOString()

    console.log("Demo creation request received:", {
      title,
      questionCount: questions?.length || 0,
      hasEmail: !!email,
    })

    // Try multiple approaches to create the survey
    let demoId: string | undefined
    let error: any

    // Approach 1: Try with service role key
    try {
      const supabaseServer = getSupabaseServer()
      const { data, error: surveyError } = await supabaseServer
        .from("surveys")
        .insert({
          title: title || "Demo Survey",
          questions,
          type: "demo",
          expires_at: expiresAtISO,
          // Explicitly set user_id to null for demo surveys
          user_id: null,
        })
        .select("id")
        .single()

      if (surveyError) {
        console.error("Error with service role insertion:", surveyError)
        error = surveyError
      } else if (data) {
        demoId = data.id
        console.log("Demo survey created with service role:", demoId)

        // Create demo session
        try {
          await supabaseServer.from("demo_sessions").insert({
            survey_id: demoId,
            expires_at: expiresAtISO,
            email: email || null,
          })
        } catch (sessionError) {
          console.warn("Error creating demo session with service role:", sessionError)
          // Not fatal, continue
        }
      }
    } catch (serviceRoleError) {
      console.error("Exception with service role insertion:", serviceRoleError)
      error = serviceRoleError
    }

    // Approach 2: If service role failed, try the fallback method
    if (!demoId) {
      console.log("Service role approach failed, trying fallback method")

      try {
        const fallbackResult = await createDemoSurveyFallback({
          title: title || "Demo Survey",
          questions,
          expiresAt: expiresAtISO,
          email,
        })

        if (fallbackResult.error) {
          console.error("Fallback method also failed:", fallbackResult.error)
          error = new Error(fallbackResult.error)
        } else if (fallbackResult.demoId) {
          demoId = fallbackResult.demoId
          console.log("Demo survey created with fallback method:", demoId)
        }
      } catch (fallbackError) {
        console.error("Exception in fallback method:", fallbackError)
        error = fallbackError
      }
    }

    // Approach 3: Direct browser client attempt as last resort
    if (!demoId) {
      console.log("Both approaches failed, trying direct browser client")

      try {
        const { data, error: directError } = await supabaseBrowser
          .from("surveys")
          .insert({
            title: title || "Demo Survey",
            questions,
            type: "demo",
            expires_at: expiresAtISO,
            // Explicitly set user_id to null for demo surveys
            user_id: null,
          })
          .select("id")
          .single()

        if (directError) {
          console.error("Direct browser client insertion failed:", directError)
          error = directError
        } else if (data) {
          demoId = data.id
          console.log("Demo survey created with direct browser client:", demoId)

          // Create demo session
          try {
            await supabaseBrowser.from("demo_sessions").insert({
              survey_id: demoId,
              expires_at: expiresAtISO,
              email: email || null,
            })
          } catch (sessionError) {
            console.warn("Error creating demo session with browser client:", sessionError)
            // Not fatal, continue
          }
        }
      } catch (directError) {
        console.error("Exception with direct browser client:", directError)
        error = directError
      }
    }

    // If we have a demoId, track analytics and return success
    if (demoId) {
      // Track the demo creation event
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
              surveyId: demoId,
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
          demoId,
          expiresAt: expiresAtISO,
        },
        { status: 201 },
      )
    }

    // If we get here, all approaches failed
    console.error("All demo creation approaches failed")
    return NextResponse.json({ error: "Failed to create survey after multiple attempts" }, { status: 500 })
  } catch (error) {
    console.error("Unhandled error in demo-create API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
