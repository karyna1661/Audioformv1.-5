import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get survey data
    const { data: survey, error } = await supabaseServer
      .from("surveys")
      .select("id, title, description")
      .eq("id", params.id)
      .single()

    if (error || !survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 })
    }

    // Generate SVG image for the frame
    const svg = `
      <svg width="955" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="955" height="500" fill="url(#bg)"/>
        <circle cx="477" cy="150" r="40" fill="white" opacity="0.2"/>
        <circle cx="477" cy="150" r="25" fill="white"/>
        <text x="477" y="160" text-anchor="middle" fill="#667eea" font-family="Arial, sans-serif" font-size="20" font-weight="bold">🎤</text>
        <text x="477" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${survey.title}</text>
        <text x="477" y="260" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" opacity="0.9">${survey.description || "Share your voice"}</text>
        <text x="477" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" opacity="0.8">Tap to record your audio response</text>
        <rect x="377" y="380" width="200" height="50" rx="25" fill="white" opacity="0.2"/>
        <text x="477" y="410" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">🎤 Record Response</text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Frame image generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
