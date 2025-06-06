/**
 * Utility functions for URL construction
 */

/**
 * Get the base URL from environment variables with proper formatting
 */
export function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"

  // Remove any whitespace and trailing slash
  url = url.trim().replace(/\/$/, "")

  // Ensure it starts with https:// if no protocol is specified
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`
  }

  return url
}

/**
 * Construct a survey response URL
 */
export function getSurveyResponseUrl(surveyId: string): string {
  const baseUrl = getBaseUrl()
  const cleanSurveyId = surveyId.trim()
  return `${baseUrl}/respond/${cleanSurveyId}`
}

/**
 * Construct a survey sharing URL
 */
export function getSurveySharingUrl(surveyId: string): string {
  const baseUrl = getBaseUrl()
  const cleanSurveyId = surveyId.trim()
  return `${baseUrl}/survey/${cleanSurveyId}`
}

/**
 * Construct a Farcaster sharing URL
 */
export function getFarcasterShareUrl(text: string, url: string): string {
  const cleanText = text.trim()
  const cleanUrl = url.trim()
  const encodedText = encodeURIComponent(cleanText)
  const encodedUrl = encodeURIComponent(cleanUrl)
  return `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
}

/**
 * Validate and clean URL
 */
export function cleanUrl(url: string): string {
  // Remove any spaces and ensure proper formatting
  return url.replace(/\s+/g, "").trim()
}
