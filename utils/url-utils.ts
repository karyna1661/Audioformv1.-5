/**
 * Utility functions for URL construction
 */

/**
 * Get the base URL from environment variables with proper formatting
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"
  // Remove trailing slash if present
  return url.replace(/\/$/, "")
}

/**
 * Construct a survey response URL
 */
export function getSurveyResponseUrl(surveyId: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/respond/${surveyId}`
}

/**
 * Construct a survey sharing URL
 */
export function getSurveySharingUrl(surveyId: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/survey/${surveyId}`
}

/**
 * Construct a Farcaster sharing URL
 */
export function getFarcasterShareUrl(text: string, url: string): string {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)
  return `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
}

/**
 * Validate and clean URL
 */
export function cleanUrl(url: string): string {
  // Remove any spaces and ensure proper formatting
  return url.replace(/\s+/g, "").trim()
}
