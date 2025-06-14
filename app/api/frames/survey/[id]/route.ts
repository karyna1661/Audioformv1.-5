import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { validateFrameRequest, generateFrameMetadata } from "@/lib/farcaster/guidelines"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validation = validateFrameRequest(body)

    if (!validation.isValid) {
      return NextResponse.json({ error: "Invalid frame request" }, { status: 400 })
    }

    // Get survey data
    const { data: survey, error } = await supabaseServer
      .from("surveys")
      .select("id, title, description, questions, is_active")
      .eq("id", params.id)
      .single()

    if (error || !survey || !survey.is_active) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"

    // Handle button interactions
    const buttonIndex = validation.buttonIndex

    if (buttonIndex === 1) {
      // "Record Response" button clicked - redirect to response page
      const responseUrl = `${baseUrl}/respond/${params.id}?frame=true`

      return NextResponse.json({
        type: "frame",
        frameUrl: responseUrl,
      })
    }

    // Default frame response
    const frameMetadata = generateFrameMetadata({
      title: survey.title,
      image: `${baseUrl}/api/frames/survey/${params.id}/image`,
      buttons: [
        { text: "🎤 Record Response", action: "post" },
        { text: "📊 View Results", action: "link" },
      ],
      postUrl: `${baseUrl}/api/frames/survey/${params.id}`,
    })

    return NextResponse.json({
      type: "frame",
      ...frameMetadata,
    })
  } catch (error) {
    console.error("Frame API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Return frame metadata for GET requests
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"

  const frameMetadata = generateFrameMetadata({
    title: "Audioform Survey",
    image: `${baseUrl}/api/frames/survey/${params.id}/image`,
    buttons: [{ text: "🎤 Record Response", action: "post" }],
    postUrl: `${baseUrl}/api/frames/survey/${params.id}`,
  })

  return NextResponse.json(frameMetadata)
}
