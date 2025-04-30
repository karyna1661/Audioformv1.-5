import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { title, questions } = await req.json()

    // Verify that the service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Calculate expiry date (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Insert survey row using the admin client
    const { data, error } = await supabaseAdmin
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
