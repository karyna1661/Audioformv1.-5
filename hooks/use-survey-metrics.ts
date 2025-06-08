"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface SurveyMetrics {
  responseCount: number
  averageTime: number
  completionRate: number
  isLoading: boolean
  error: string | null
}

export const useSurveyMetrics = (surveyId: string) => {
  const [metrics, setMetrics] = useState<SurveyMetrics>({
    responseCount: 0,
    averageTime: 0,
    completionRate: 0,
    isLoading: true,
    error: null,
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetrics((prev) => ({ ...prev, isLoading: true, error: null }))

        // Fetch responses for this survey
        const { data: responses, error: responsesError } = await supabase
          .from("responses")
          .select("duration, created_at, completed_at")
          .eq("survey_id", surveyId)

        if (responsesError) throw responsesError

        // Fetch survey details for completion rate calculation
        const { data: survey, error: surveyError } = await supabase
          .from("surveys")
          .select("questions, created_at")
          .eq("id", surveyId)
          .single()

        if (surveyError) throw surveyError

        const responseCount = responses?.length || 0
        const completedResponses = responses?.filter((r) => r.completed_at) || []
        const averageTime =
          completedResponses.length > 0
            ? Math.round(completedResponses.reduce((acc, r) => acc + (r.duration || 0), 0) / completedResponses.length)
            : 0

        const totalQuestions = Array.isArray(survey.questions) ? survey.questions.length : 1
        const completionRate = responseCount > 0 ? Math.round((completedResponses.length / responseCount) * 100) : 0

        setMetrics({
          responseCount,
          averageTime,
          completionRate,
          isLoading: false,
          error: null,
        })
      } catch (error: any) {
        console.error("Error fetching survey metrics:", error)
        setMetrics((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to load metrics",
        }))
      }
    }

    if (surveyId) {
      fetchMetrics()
    }
  }, [surveyId])

  return metrics
}
