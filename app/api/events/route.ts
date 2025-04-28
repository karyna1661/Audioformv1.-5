import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, surveyIds } = body

    if (!name || !slug || !surveyIds || !Array.isArray(surveyIds)) {
      return NextResponse.json(
        { error: "Invalid request. Name, slug, and surveyIds array are required." },
        { status: 400 },
      )
    }

    // In a real app, this would create an event in the database
    // and generate a QR code

    // Mock response
    return NextResponse.json({
      eventId: `event_${Date.now()}`,
      qrCodeUrl: "/placeholder.svg?height=200&width=200", // This would be a real QR code URL in production
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
