/**
 * URL utilities for survey application
 * Focused on social sharing and survey management
 */

export function getBaseUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return "https://voxera.vercel.app"
  }
  return "http://localhost:3000"
}

export function createSurveyUrl(surveyId: string): string {
  if (!surveyId || typeof surveyId !== "string") {
    throw new Error("Invalid survey ID provided")
  }

  const cleanId = surveyId.trim()
  if (!cleanId) {
    throw new Error("Survey ID cannot be empty")
  }

  return `${getBaseUrl()}/surveys/${cleanId}`
}

export function createResponseUrl(surveyId: string): string {
  // Deprecated: Direct response functionality removed
  // This function is kept for backward compatibility but redirects to survey page
  console.warn("createResponseUrl is deprecated. Direct response functionality has been removed.")
  return createSurveyUrl(surveyId)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function cleanUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return ""
  }

  return url
    .trim()
    .replace(/\/+/g, "/") // Replace multiple slashes with single slash
    .replace(/([^:]\/)\/+/g, "$1") // Fix protocol separators
}

export function debugUrl(url: string): void {
  console.log("URL Debug Info:", {
    url,
    isValid: validateUrl(url),
    baseUrl: getBaseUrl(),
    timestamp: new Date().toISOString(),
  })
}
