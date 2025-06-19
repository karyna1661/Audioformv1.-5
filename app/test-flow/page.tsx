"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface TestResult {
  step: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function TestFlowPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testSurveyId, setTestSurveyId] = useState<string | null>(null)

  const updateResult = (step: string, status: TestResult["status"], message: string, data?: any) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.step === step)
      if (existing) {
        return prev.map((r) => (r.step === step ? { ...r, status, message, data } : r))
      }
      return [...prev, { step, status, message, data }]
    })
  }

  const runEndToEndTest = async () => {
    setIsRunning(true)
    setResults([])

    try {
      // Step 1: Test survey creation
      updateResult("create-survey", "pending", "Creating test survey...")

      const testSurvey = {
        title: `Test Survey ${Date.now()}`,
        description: "This is a test survey for end-to-end testing",
        questions: [
          { id: "1", text: "What is your name?", order: 1 },
          { id: "2", text: "How are you feeling today?", order: 2 },
        ],
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const { data: survey, error: createError } = await supabase.from("surveys").insert(testSurvey).select().single()

      if (createError) {
        updateResult("create-survey", "error", `Failed to create survey: ${createError.message}`)
        return
      }

      updateResult("create-survey", "success", "Survey created successfully", survey)
      setTestSurveyId(survey.id)

      // Step 2: Test survey retrieval
      updateResult("fetch-survey", "pending", "Fetching survey data...")

      const { data: fetchedSurvey, error: fetchError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", survey.id)
        .single()

      if (fetchError) {
        updateResult("fetch-survey", "error", `Failed to fetch survey: ${fetchError.message}`)
        return
      }

      updateResult("fetch-survey", "success", "Survey fetched successfully", fetchedSurvey)

      // Step 3: Test URL generation
      updateResult("url-generation", "pending", "Testing URL generation...")

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const responseUrl = `${baseUrl}/respond/${survey.id}`

      updateResult("url-generation", "success", `Response URL: ${responseUrl}`, { url: responseUrl })

      // Step 4: Test response submission (mock)
      updateResult("response-submission", "pending", "Testing response submission...")

      const mockResponse = {
        survey_id: survey.id,
        audio_path: "test/mock-audio.webm",
        question_index: 0,
        created_at: new Date().toISOString(),
      }

      const { data: response, error: responseError } = await supabase
        .from("responses")
        .insert(mockResponse)
        .select()
        .single()

      if (responseError) {
        updateResult("response-submission", "error", `Failed to submit response: ${responseError.message}`)
        return
      }

      updateResult("response-submission", "success", "Response submitted successfully", response)

      // Step 5: Test response count
      updateResult("response-count", "pending", "Testing response count...")

      const { count, error: countError } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", survey.id)

      if (countError) {
        updateResult("response-count", "error", `Failed to count responses: ${countError.message}`)
        return
      }

      updateResult("response-count", "success", `Response count: ${count}`, { count })
    } catch (error) {
      console.error("Test error:", error)
      updateResult("general-error", "error", `Unexpected error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const cleanupTest = async () => {
    if (!testSurveyId) return

    try {
      // Delete responses first
      await supabase.from("responses").delete().eq("survey_id", testSurveyId)

      // Delete survey
      await supabase.from("surveys").delete().eq("id", testSurveyId)

      setTestSurveyId(null)
      setResults([])
    } catch (error) {
      console.error("Cleanup error:", error)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>End-to-End Survey Flow Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={runEndToEndTest} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                {isRunning ? "Running Tests..." : "Run End-to-End Test"}
              </Button>

              {testSurveyId && (
                <Button onClick={cleanupTest} variant="outline" disabled={isRunning}>
                  Cleanup Test Data
                </Button>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>

                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium capitalize">{result.step.replace("-", " ")}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.message}</div>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">View Data</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {testSurveyId && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Test Survey Created</h4>
                <p className="text-sm text-blue-700 mb-2">Survey ID: {testSurveyId}</p>
                <div className="flex gap-2">
                  <a
                    href={`/surveys/${testSurveyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Survey Details
                  </a>
                  <span className="text-gray-400">|</span>
                  <a
                    href={`/respond/${testSurveyId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Test Response Form
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
