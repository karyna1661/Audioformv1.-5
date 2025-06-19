export function makeSafeRespondUrl(surveyId: string): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || ""
  return `${origin}/respond/${surveyId}`
}

export function validateSurveyId(id: string): boolean {
  return typeof id === "string" && id.trim().length > 0
}

export function formatQuestionText(question: string | { text?: string; prompt?: string }): string {
  if (typeof question === "string") {
    return question
  }
  return question?.text || question?.prompt || "Please record your response"
}
