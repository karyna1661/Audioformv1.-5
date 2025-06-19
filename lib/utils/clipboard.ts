/**
 * Enhanced clipboard utilities with fallback support
 */

export class ClipboardManager {
  /**
   * Copy text to clipboard with fallback methods
   */
  static async copyText(text: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Modern Clipboard API (preferred)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return { success: true }
      }

      // Fallback for older browsers or non-secure contexts
      return this.fallbackCopyText(text)
    } catch (error) {
      console.error("Clipboard copy error:", error)
      return this.fallbackCopyText(text)
    }
  }

  /**
   * Fallback copy method using document.execCommand
   */
  private static fallbackCopyText(text: string): { success: boolean; error?: string } {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)

      if (successful) {
        return { success: true }
      } else {
        throw new Error("execCommand failed")
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to copy to clipboard. Please copy the link manually.",
      }
    }
  }

  /**
   * Check if clipboard API is available
   */
  static isSupported(): boolean {
    return !!(navigator.clipboard || document.execCommand)
  }
}
