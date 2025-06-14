import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as File
    const surveyId = formData.get("surveyId") as string
    const questionId = formData.get("questionId") as string

    if (!audio || !surveyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Processing response for survey ${surveyId}, question ${questionId}`)

    // Initialize Supabase client with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Upload to demo-audio bucket with correct path structure
    const filename = `responses/${surveyId}/${questionId}_${Date.now()}.webm`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("demo-audio").upload(filename, audio, {
      cacheControl: "3600",
      upsert: true,
    })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("demo-audio").getPublicUrl(filename)

    // Save response record to database
    const { data: responseData, error: dbError } = await supabase
      .from("responses")
      .insert({
        survey_id: surveyId,
        question_id: questionId,
        audio_path: uploadData.path,
        audio_url: publicUrlData.publicUrl,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    console.log("Response submitted successfully:", responseData)
    return NextResponse.json({
      success: true,
      responseId: responseData.id,
      audioUrl: publicUrlData.publicUrl,
    })
  } catch (error: any) {
    console.error("Response upload error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
