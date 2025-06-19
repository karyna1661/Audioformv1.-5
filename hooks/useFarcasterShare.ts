"use client"

import { useState } from "react"

interface FarcasterShareOptions {
  text: string
  url: string
}

export function useFarcasterShare() {
  const [isSharing, setIsSharing] = useState(false)

  const shareToFarcaster = async ({ text, url }: FarcasterShareOptions) => {
    setIsSharing(true)

    try {
      // Create Farcaster share URL
      const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`

      // Open in new window
      window.open(farcasterUrl, "_blank", "width=600,height=400")

      return { success: true }
    } catch (error) {
      console.error("Failed to share to Farcaster:", error)
      return { success: false, error }
    } finally {
      setIsSharing(false)
    }
  }

  return {
    shareToFarcaster,
    isSharing,
  }
}
