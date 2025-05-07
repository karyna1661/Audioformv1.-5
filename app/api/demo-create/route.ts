import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseClient"
import { trackServerEvent } from "@/app/actions/analytics"

export async function POST(req: Request) {
  try {
    const { title, questions, email, sessionId } = await req.json()

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Insert survey (service-role key bypasses RLS)
    const { data: survey, error: surveyError } = await supabaseServer
      .from("surveys")
      .insert({
        title: title || "Demo Survey",
        questions,
        type: "demo",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single()

    if (surveyError) {
      console.error("Error creating demo survey:", surveyError)
      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
    }

    // Create demo session
    const { error: sessionError } = await supabaseServer.from("demo_sessions").insert({
      survey_id: survey.id,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      console.error("Error creating demo session:", sessionError)
      // not fatal—proceed
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
  } catch (error) {
    console.error("Error in demo-create API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
