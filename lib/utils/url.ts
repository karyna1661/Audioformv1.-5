/**
 * Clean URL utility functions to prevent malformed URLs
 */

const BASE_DOMAIN = "https://voxera.vercel.app"

export function getBaseUrl(): string {
  // Always return the clean base domain
  return BASE_DOMAIN
}

export function createResponseUrl(surveyId: string): string {
  // Clean the survey ID and create proper response URL
  const cleanSurveyId = surveyId.trim()
  return `${BASE_DOMAIN}/respond/${cleanSurveyId}`
}

export function createSurveyUrl(surveyId: string): string {
  // Clean the survey ID and create proper survey URL
  const cleanSurveyId = surveyId.trim()
  return `${BASE_DOMAIN}/surveys/${cleanSurveyId}`
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
  // Remove any extra spaces, double slashes, etc.
  return url
    .trim()
    .replace(/\s+/g, "") // Remove all whitespace
    .replace(/\/+/g, "/") // Replace multiple slashes with single slash
    .replace(/:\//g, "://") // Fix protocol separator
}
