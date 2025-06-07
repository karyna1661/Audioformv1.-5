import { type NextRequest, NextResponse } from "next/server"
import { surveyServiceServer } from "@/lib/services/survey-service"
import { SurveyDatabaseError } from "@/lib/database/error-handler"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const surveyId = formData.get("surveyId") as string
    const questionId = formData.get("questionId") as string
    const audioFile = formData.get("audio") as File
    const email = formData.get("email") as string | null

    // Validate required fields
    if (!surveyId || !questionId || !audioFile) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          code: "INVALID_INPUT",
          details: {
            surveyId: !!surveyId,
            questionId: !!questionId,
            audioFile: !!audioFile,
          },
        },
        { status: 400 },
      )
    }

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type || "audio/webm",
    })

    // Submit response using service
    const response = await surveyServiceServer.submitResponse({
      surveyId: surveyId.trim(),
      questionId: questionId.trim(),
      audioBlob,
      email: email?.trim() || undefined,
    })

    return NextResponse.json({
      success: true,
      responseId: response.id,
      message: "Response submitted successfully",
    })
  } catch (error) {
    console.error("Error in response submission API:", error)

    if (error instanceof SurveyDatabaseError) {
      const statusCode = getStatusCodeForError(error.code)

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
        { status: statusCode },
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "An unexpected error occurred while submitting your response",
        code: "INTERNAL_ERROR",
        hint: "Please try again or contact support if the issue persists",
      },
      { status: 500 },
    )
  }
}

function getStatusCodeForError(errorCode: string): number {
  switch (errorCode) {
    case "NOT_FOUND":
    case "QUESTION_NOT_FOUND":
      return 404
    case "INVALID_INPUT":
    case "INVALID_SURVEY_ID":
      return 400
    case "SURVEY_INACTIVE":
    case "SURVEY_EXPIRED":
      return 410 // Gone
    case "DUPLICATE_RESPONSE":
      return 409 // Conflict
    case "UPLOAD_FAILED":
      return 507 // Insufficient Storage
    default:
      return 500
  }
}
