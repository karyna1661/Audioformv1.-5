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

    // Initialize Supabase client
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Upload to Supabase Storage
    const filename = `responses/${surveyId}/${questionId || "response"}_${Date.now()}.webm`
    const { data, error } = await supabase.storage
      .from("demo-audio") // Use correct bucket name
      .upload(filename, audio, {
        cacheControl: "3600",
        upsert: true,
      })

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("demo-audio").getPublicUrl(filename)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    })
  } catch (error: any) {
    console.error("Response upload error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
