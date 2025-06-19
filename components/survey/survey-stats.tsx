"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

const supabase = createClientComponentClient<Database>()

interface SurveyStatsProps {
  surveyId: string
  responseCount: number
}

export function SurveyStats({ surveyId, responseCount: initialCount }: SurveyStatsProps) {
  const [responseCount, setResponseCount] = useState(initialCount)

  useEffect(() => {
    // Set up real-time subscription for response count updates
    const channel = supabase
      .channel(`survey-${surveyId}-responses`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `survey_id=eq.${surveyId}`,
        },
        () => {
          setResponseCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [surveyId])

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>Survey Response</span>
      <span className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        {responseCount} {responseCount === 1 ? "response" : "responses"}
      </span>
    </div>
  )
}
