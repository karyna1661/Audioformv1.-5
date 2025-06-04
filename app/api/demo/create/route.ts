import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(req: NextRequest): Promise<Response> {
  try {
    console.log("=== Demo Create API Called ===")

    // Parse the request body
    let body
    try {
      body = await req.json()
      console.log("Request body:", body)
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate that body exists
    if (!body || typeof body !== "object") {
      console.error("Invalid request body:", body)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { title, questions, email } = body

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      console.error("Invalid title:", title)
      return NextResponse.json({ error: "Title is required and must be a non-empty string" }, { status: 400 })
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions)) {
      console.error("Invalid questions:", questions)
      return NextResponse.json({ error: "Questions must be an array" }, { status: 400 })
    }

    if (questions.length === 0) {
      console.error("Empty questions array")
      return NextResponse.json({ error: "At least one question is required" }, { status: 400 })
    }

    // Validate each question
    const validQuestions = []
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]

      // Handle both string questions and object questions
      let questionText = ""
      if (typeof question === "string") {
        questionText = question.trim()
      } else if (question && typeof question === "object" && question.text) {
        questionText = question.text.trim()
      }

      if (questionText.length === 0) {
        console.error(`Empty question at index ${i}:`, question)
        return NextResponse.json({ error: `Question ${i + 1} cannot be empty` }, { status: 400 })
      }

      validQuestions.push(questionText)
    }

    console.log("Valid questions:", validQuestions)

    // Validate email if provided
    if (email && (typeof email !== "string" || email.trim().length === 0)) {
      console.error("Invalid email:", email)
      return NextResponse.json({ error: "Email must be a valid string if provided" }, { status: 400 })
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    console.log("Expires at:", expiresAt.toISOString())

    // Prepare survey data
    const surveyData = {
      title: title.trim(),
      type: "demo" as const,
      questions: validQuestions,
      expires_at: expiresAt.toISOString(),
    }

    console.log("Creating survey with data:", surveyData)

    // Insert survey
    const { data: createdSurvey, error: surveyError } = await supabaseServer
      .from("surveys")
      .insert(surveyData)
      .select("id")
      .single()

    if (surveyError) {
      console.error("Supabase error creating survey:", surveyError)
      return NextResponse.json({ error: `Database error: ${surveyError.message}` }, { status: 500 })
    }

    if (!createdSurvey || !createdSurvey.id) {
      console.error("Survey created but no ID returned:", createdSurvey)
      return NextResponse.json({ error: "Survey created but no ID returned" }, { status: 500 })
    }

    console.log("Survey created successfully:", createdSurvey.id)

    // Create demo session
    const sessionData = {
      survey_id: createdSurvey.id,
      expires_at: expiresAt.toISOString(),
    }

    const { error: sessionError } = await supabaseServer.from("demo_sessions").insert(sessionData)

    if (sessionError) {
      console.warn("Error creating demo session (continuing anyway):", sessionError)
    } else {
      console.log("Demo session created successfully")
    }

    const response = {
      demoId: createdSurvey.id,
      expiresAt: expiresAt.toISOString(),
    }

    console.log("Returning response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Unexpected error in demo creation:", error)
    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
