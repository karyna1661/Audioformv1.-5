"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export const useSurveyStats = (surveyId: string) => {
  const [stats, setStats] = useState({ count: 0, avgTime: 0 })
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.from("responses").select("duration").eq("survey_id", surveyId)

        if (error) throw error

        if (data && data.length > 0) {
          const count = data.length
          const avgTime = data.reduce((acc, d) => acc + (d.duration || 0), 0) / count || 0
          setStats({ count, avgTime: Math.round(avgTime) })
        }
      } catch (error) {
        console.error("Error fetching survey stats:", error)
      }
    }

    if (surveyId) {
      fetchStats()
    }
  }, [surveyId])

  return stats
}
