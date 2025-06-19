import { type NextRequest, NextResponse } from "next/server"
import { SurveyService } from "@/lib/services/survey-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as File
    const surveyId = formData.get("surveyId") as string
    const questionId = formData.get("questionId") as string
    const questionIndex = Number.parseInt(formData.get("questionIndex") as string) || 0

    if (!audio || !surveyId || !questionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(`Processing response for survey ${surveyId}, question ${questionId}`)

    // Convert File to Blob
    const audioBlob = new Blob([await audio.arrayBuffer()], { type: audio.type })

    // Save response using the service
    const response = await SurveyService.saveResponse({
      surveyId,
      questionId,
      questionIndex,
      audioBlob,
      userId: null, // Anonymous for now
    })

    console.log("Response submitted successfully:", response.id)

    return NextResponse.json({
      success: true,
      responseId: response.id,
      audioUrl: response.audio_url,
    })
  } catch (error: any) {
    console.error("Response upload error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
