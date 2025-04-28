import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { surveyId: string } }) {
  try {
    const surveyId = params.surveyId

    // In a real app, this would fetch analysis data from the database
    // For now, we'll return mock data

    return NextResponse.json({
      clips: [
        {
          id: "clip1",
          transcript:
            "I've had a great experience with your product. It's intuitive and solves my problems efficiently.",
          sentiment: "positive",
        },
        {
          id: "clip2",
          transcript: "The product is okay, but there are some areas that could be improved.",
          sentiment: "neutral",
        },
        {
          id: "clip3",
          transcript: "The mobile app is frustrating to use and crashes frequently. Please fix these issues.",
          sentiment: "negative",
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 })
  }
}
