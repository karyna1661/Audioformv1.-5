import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(req: Request) {
  try {
    const { title, questions, email } = await req.json()

    console.log("Demo creation request:", { title, questionCount: questions?.length, hasEmail: !!email })

    // Validate input
    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Title and questions are required" }, { status: 400 })
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Create the survey using the client (which uses anon key with RLS)
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .insert({
        title: title.trim(),
        questions: questions,
        type: "demo",
        expires_at: expiresAt,
        user_id: null, // Demo surveys don't have a user
      })
      .select("id")
      .single()

    if (surveyError) {
      console.error("Survey creation error:", surveyError)
      return NextResponse.json({ error: `Failed to create survey: ${surveyError.message}` }, { status: 500 })
    }

    if (!surveyData?.id) {
      console.error("No survey data returned")
      return NextResponse.json({ error: "Failed to create survey - no ID returned" }, { status: 500 })
    }

    console.log("Survey created successfully:", surveyData.id)

    // Create demo session (optional - don't fail if this fails)
    try {
      const { error: sessionError } = await supabase.from("demo_sessions").insert({
        survey_id: surveyData.id,
        expires_at: expiresAt,
        email: email || null,
      })

      if (sessionError) {
        console.warn("Demo session creation failed:", sessionError)
        // Don't fail the whole request for this
      }
    } catch (sessionErr) {
      console.warn("Demo session creation exception:", sessionErr)
      // Don't fail the whole request for this
    }

    return NextResponse.json(
      {
        demoId: surveyData.id,
        expiresAt,
        message: "Survey created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unhandled error in demo-create:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
