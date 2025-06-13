// Safe for both client and server environments
export function getBaseUrl(): string {
  // Server-side: use environment variable or fallback
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://audioform.vercel.app"
  }

  // Client-side: use window.location
  const protocol = window.location.protocol
  const host = window.location.host
  return `${protocol}//${host}`
}

export function getSurveyResponseUrl(surveyId: string): string {
  const baseUrl = getBaseUrl()
  const cleanId = surveyId.trim()
  return `${baseUrl}/respond/${cleanId}`
}

export function getFarcasterShareUrl(text: string, url: string): string {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)
  return `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
}
