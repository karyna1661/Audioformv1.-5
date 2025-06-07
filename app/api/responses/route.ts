import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("Received response submission request")

  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as File
    const surveyId = formData.get("surveyId") as string
    const email = formData.get("email") as string

    if (!audio || !surveyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Processing response for survey ${surveyId}`)

    // Initialize Supabase client with server credentials
    const supabase = createClient()

    // Upload audio file to Supabase Storage
    const fileName = `${surveyId}/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.webm`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("responses").upload(fileName, audio, {
      contentType: "audio/webm",
    })

    if (uploadError) {
      console.error("Error uploading audio:", uploadError)
      return NextResponse.json({ error: "Failed to upload audio" }, { status: 500 })
    }

    // Save response record in database
    const { data: responseData, error: responseError } = await supabase
      .from("responses")
      .insert({
        survey_id: surveyId,
        audio_path: uploadData.path,
        email: email || null,
      })
      .select()
      .single()

    if (responseError) {
      console.error("Error saving response:", responseError)
      return NextResponse.json({ error: "Failed to save response" }, { status: 500 })
    }

    console.log("Response submitted successfully")
    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
