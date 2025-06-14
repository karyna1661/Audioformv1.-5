// Farcaster Frame Development Guidelines
// Source: https://miniapps.farcaster.xyz/llms-full.txt

export const FARCASTER_GUIDELINES = {
  // Core principles for Farcaster Frame development
  frameStructure: {
    // Frames must have proper meta tags
    requiredMetaTags: ["fc:frame", "fc:frame:image", "fc:frame:button:1", "fc:frame:post_url"],
    // Image requirements
    imageSpecs: {
      aspectRatio: "1.91:1",
      minWidth: 955,
      minHeight: 500,
      maxSize: "10MB",
      formats: ["png", "jpg", "gif"],
    },
  },

  // Button specifications
  buttons: {
    maxButtons: 4,
    types: ["post", "post_redirect", "mint", "link", "tx"],
    maxTextLength: 32,
  },

  // Input specifications
  input: {
    maxLength: 32,
    placeholder: "Enter text...",
  },

  // Best practices
  bestPractices: {
    // Always validate frame data
    validateFrameData: true,
    // Handle errors gracefully
    errorHandling: true,
    // Optimize images for fast loading
    optimizeImages: true,
    // Use proper CORS headers
    corsHeaders: true,
  },
}

// Frame validation utilities
export function validateFrameRequest(body: any) {
  // Validate incoming frame request
  return {
    isValid: true,
    fid: body?.untrustedData?.fid,
    buttonIndex: body?.untrustedData?.buttonIndex,
    inputText: body?.untrustedData?.inputText,
    castId: body?.untrustedData?.castId,
  }
}

export function generateFrameMetadata(config: {
  title: string
  image: string
  buttons: Array<{ text: string; action?: string }>
  postUrl?: string
  inputText?: string
}) {
  const metadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": config.image,
    "fc:frame:post_url": config.postUrl || "",
  }

  // Add buttons
  config.buttons.forEach((button, index) => {
    metadata[`fc:frame:button:${index + 1}`] = button.text
    if (button.action) {
      metadata[`fc:frame:button:${index + 1}:action`] = button.action
    }
  })

  // Add input if specified
  if (config.inputText) {
    metadata["fc:frame:input:text"] = config.inputText
  }

  return metadata
}
