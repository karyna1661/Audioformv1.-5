"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { trackEvent, trackPageView, getCurrentUserId } from "@/utils/analytics"

interface AnalyticsContextType {
  trackEvent: (eventType: string, properties?: Record<string, any>, options?: { surveyId?: string }) => Promise<boolean>
  trackPageView: (pageName: string, properties?: Record<string, any>) => Promise<boolean>
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: async () => false,
  trackPageView: async () => false,
})

export const useAnalytics = () => useContext(AnalyticsContext)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)

  // Get the current user ID when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId()
      setUserId(id)
    }
    fetchUserId()
  }, [])

  // Track page views automatically
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Track initial page view
      trackPageView(window.location.pathname)

      // Track page views on route changes
      const handleRouteChange = (url: string) => {
        trackPageView(url)
      }

      // Add event listener for route changes
      window.addEventListener("popstate", () => handleRouteChange(window.location.pathname))

      return () => {
        window.removeEventListener("popstate", () => handleRouteChange(window.location.pathname))
      }
    }
  }, [])

  const contextValue = {
    trackEvent: async (eventType: string, properties = {}, options = {}) => {
      return trackEvent(eventType, properties, { userId, ...options })
    },
    trackPageView: async (pageName: string, properties = {}) => {
      return trackPageView(pageName, properties)
    },
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}
