/**
 * Farcaster sharing utilities for survey links
 */

export interface FarcasterShareOptions {
  text: string
  url: string
  embeds?: string[]
}

export class FarcasterShare {
  private static readonly WARPCAST_COMPOSE_URL = "https://warpcast.com/~/compose"

  /**
   * Generate a Farcaster share URL
   */
  static generateShareUrl({ text, url, embeds = [] }: FarcasterShareOptions): string {
    const params = new URLSearchParams()

    // Add text content
    params.append("text", text)

    // Add main URL as embed
    params.append("embeds[]", url)

    // Add additional embeds if provided
    embeds.forEach((embed) => {
      params.append("embeds[]", embed)
    })

    return `${this.WARPCAST_COMPOSE_URL}?${params.toString()}`
  }

  /**
   * Open Farcaster share dialog
   */
  static async share(options: FarcasterShareOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const shareUrl = this.generateShareUrl(options)

      // Open in new window with specific dimensions
      const popup = window.open(shareUrl, "farcaster-share", "width=600,height=700,scrollbars=yes,resizable=yes")

      if (!popup) {
        throw new Error("Popup blocked - please allow popups for this site")
      }

      return { success: true }
    } catch (error) {
      console.error("Farcaster share error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to share on Farcaster",
      }
    }
  }

  /**
   * Generate survey-specific share content
   */
  static createSurveyShareContent(surveyTitle: string, surveyUrl: string) {
    return {
      text: `🎤 "${surveyTitle}" - Share your voice and thoughts!\n\nJoin this audio survey and let your authentic voice be heard. Your responses matter! 🗣️✨`,
      url: surveyUrl,
      embeds: [],
    }
  }
}
