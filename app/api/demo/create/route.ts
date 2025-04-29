import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
    const { title, questions } = await req.json()

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Insert survey row
    const { data, error } = await supabase
      .from("surveys")
      .insert({
        title: title || "Demo Survey",
        type: "demo",
        questions,
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating demo survey:", error)
      return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
    }

    return NextResponse.json({ demoId: data.id }, { status: 200 })
  } catch (error) {
    console.error("Error creating demo survey:", error)
    return NextResponse.json({ error: "Failed to create survey" }, { status: 500 })
  }
}
