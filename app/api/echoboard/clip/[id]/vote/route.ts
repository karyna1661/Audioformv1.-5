import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const clipId = params.id
    const body = await request.json()
    const { voteType } = body

    if (voteType !== "echo" && voteType !== "mute") {
      return NextResponse.json({ error: "Invalid vote type. Must be 'echo' or 'mute'." }, { status: 400 })
    }

    // In a real app, this would update the vote count in the database

    // Mock response
    return NextResponse.json({
      newCount: Math.floor(Math.random() * 20) + 1, // Random count for demo
    })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 })
  }
}
