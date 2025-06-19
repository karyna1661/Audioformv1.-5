/**
 * Robust URL utility functions with comprehensive error handling
 */

// Hardcoded domain to prevent any environment variable issues
const PRODUCTION_DOMAIN = "https://voxera.vercel.app"

export function getBaseUrl(): string {
  // Always return the production domain
  return PRODUCTION_DOMAIN
}

export function createResponseUrl(surveyId: string): string {
  if (!surveyId || typeof surveyId !== "string") {
    throw new Error("Invalid survey ID provided")
  }

  // Clean and validate survey ID
  const cleanSurveyId = surveyId.trim().replace(/\s+/g, "")

  if (!cleanSurveyId) {
    throw new Error("Survey ID cannot be empty")
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(cleanSurveyId)) {
    console.warn("Survey ID does not match UUID format:", cleanSurveyId)
  }

  const url = `${PRODUCTION_DOMAIN}/respond/${cleanSurveyId}`
  console.log("Generated response URL:", url)
  return url
}

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === "voxera.vercel.app"
  } catch {
    return false
  }
}

export function debugUrl(url: string): void {
  console.log("URL Debug Info:", {
    url,
    isValid: validateUrl(url),
    hostname: new URL(url).hostname,
    pathname: new URL(url).pathname,
    length: url.length,
    hasSpaces: /\s/.test(url),
  })
}

export function createSurveyUrl(surveyId: string): string {
  if (!surveyId || typeof surveyId !== "string") {
    throw new Error("Invalid survey ID provided")
  }

  // Clean and validate survey ID
  const cleanSurveyId = surveyId.trim().replace(/\s+/g, "")

  if (!cleanSurveyId) {
    throw new Error("Survey ID cannot be empty")
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(cleanSurveyId)) {
    console.warn("Survey ID does not match UUID format:", cleanSurveyId)
  }

  const url = `${PRODUCTION_DOMAIN}/surveys/${cleanSurveyId}`
  console.log("Generated survey URL:", url)
  return url
}

export function cleanUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return ""
  }

  // Remove any extra spaces, double slashes, etc.
  return url
    .trim()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/\/+/g, "/") // Replace multiple slashes with single slash
    .replace(/:\//g, "://") // Fix protocol separator
    .replace(/\/+$/, "") // Remove trailing slashes
}
