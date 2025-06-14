"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface SurveyResponse {
  id: string
  created_at: string
  survey_id: string
  response_data: any
}

const SurveyResponseClient = () => {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResponses = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!surveyId) {
          setError("Survey ID is missing.")
          return
        }

        const { data, error } = await supabase.from("survey_responses").select("*").eq("survey_id", surveyId)

        if (error) {
          console.error("Error fetching survey responses:", error)
          setError(`Error fetching survey responses: ${error.message}`)
        } else {
          setResponses(data || [])
        }
      } catch (err: any) {
        console.error("Unexpected error fetching survey responses:", err)
        setError(`Unexpected error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [surveyId])

  if (loading) {
    return <div>Loading responses...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h2>Survey Responses</h2>
      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <ul>
          {responses.map((response) => (
            <li key={response.id}>
              Response ID: {response.id} <br />
              Created At: {response.created_at} <br />
              Response Data: <pre>{JSON.stringify(response.response_data, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SurveyResponseClient
