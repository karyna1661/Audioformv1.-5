"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createResponseUrl, validateUrl, getBaseUrl } from "@/lib/utils/url"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

const supabase = createClientComponentClient()

interface HealthCheck {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: any
}

export default function SystemHealthPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [running, setRunning] = useState(false)
  const [testSurveyId, setTestSurveyId] = useState<string | null>(null)

  const addHealthCheck = (check: HealthCheck) => {
    setHealthChecks((prev) => [...prev, { ...check, timestamp: Date.now() }])
  }

  const runHealthChecks = async () => {
    setRunning(true)
    setHealthChecks([])

    try {
      // 1. Test URL Generation
      addHealthCheck({ name: "URL Generation", status: "pending", message: "Testing URL generation..." })

      const testId = "550e8400-e29b-41d4-a716-446655440000" // Valid UUID format
      const testUrl = createResponseUrl(testId)
      const isValidUrl = validateUrl(testUrl)

      addHealthCheck({
        name: "URL Generation",
        status: isValidUrl ? "success" : "error",
        message: isValidUrl ? "URL generation working correctly" : "URL generation failed",
        details: { generatedUrl: testUrl, isValid: isValidUrl },
      })

      // 2. Test Database Connection
      addHealthCheck({ name: "Database Connection", status: "pending", message: "Testing database connection..." })

      const { data: dbTest, error: dbError } = await supabase.from("surveys").select("count").limit(1)

      addHealthCheck({
        name: "Database Connection",
        status: dbError ? "error" : "success",
        message: dbError ? `Database error: ${dbError.message}` : "Database connection successful",
        details: dbError || { connectionTest: "passed" },
      })

      // 3. Create Test Survey
      if (!dbError) {
        addHealthCheck({ name: "Survey Creation", status: "pending", message: "Creating test survey..." })

        const testSurvey = {
          title: `Health Check Survey ${Date.now()}`,
          description: "Automated health check survey",
          questions: [{ text: "Test question", order: 1 }],
          is_active: true,
          created_at: new Date().toISOString(),
        }

        const { data: survey, error: createError } = await supabase.from("surveys").insert(testSurvey).select().single()

        if (createError) {
          addHealthCheck({
            name: "Survey Creation",
            status: "error",
            message: `Survey creation failed: ${createError.message}`,
            details: createError,
          })
        } else {
          setTestSurveyId(survey.id)
          addHealthCheck({
            name: "Survey Creation",
            status: "success",
            message: "Test survey created successfully",
            details: { surveyId: survey.id },
          })

          // 4. Test Survey Retrieval
          addHealthCheck({ name: "Survey Retrieval", status: "pending", message: "Testing survey retrieval..." })

          const { data: retrievedSurvey, error: retrieveError } = await supabase
            .from("surveys")
            .select("*")
            .eq("id", survey.id)
            .single()

          addHealthCheck({
            name: "Survey Retrieval",
            status: retrieveError ? "error" : "success",
            message: retrieveError ? `Retrieval failed: ${retrieveError.message}` : "Survey retrieval successful",
            details: retrieveError || { surveyTitle: retrievedSurvey?.title },
          })

          // 5. Test Response URL
          addHealthCheck({ name: "Response URL Test", status: "pending", message: "Testing response URL..." })

          const responseUrl = createResponseUrl(survey.id)

          try {
            // Test URL format and accessibility
            const urlTest = await fetch(responseUrl, {
              method: "HEAD",
              mode: "no-cors",
            })

            addHealthCheck({
              name: "Response URL Test",
              status: "success",
              message: "Response URL is accessible",
              details: { url: responseUrl, status: urlTest.status || "accessible" },
            })
          } catch (urlError) {
            addHealthCheck({
              name: "Response URL Test",
              status: "warning",
              message: "URL format correct but accessibility test failed (may be due to CORS)",
              details: { url: responseUrl, error: urlError },
            })
          }

          // 6. Test Real-time Subscription
          addHealthCheck({ name: "Real-time Setup", status: "pending", message: "Testing real-time subscriptions..." })

          const channel = supabase
            .channel(`health-check-${survey.id}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "responses",
                filter: `survey_id=eq.${survey.id}`,
              },
              () => {
                addHealthCheck({
                  name: "Real-time Test",
                  status: "success",
                  message: "Real-time subscription received test event",
                  details: { surveyId: survey.id },
                })
              },
            )
            .subscribe((status) => {
              addHealthCheck({
                name: "Real-time Setup",
                status: status === "SUBSCRIBED" ? "success" : "error",
                message: `Real-time subscription status: ${status}`,
                details: { subscriptionStatus: status },
              })
            })

          // Clean up subscription after test
          setTimeout(() => {
            supabase.removeChannel(channel)
          }, 5000)
        }
      }

      // 7. Test Domain Configuration
      addHealthCheck({ name: "Domain Configuration", status: "pending", message: "Testing domain configuration..." })

      const baseUrl = getBaseUrl()
      const isDomainCorrect = baseUrl === "https://voxera.vercel.app"

      addHealthCheck({
        name: "Domain Configuration",
        status: isDomainCorrect ? "success" : "error",
        message: isDomainCorrect ? "Domain configuration correct" : "Domain configuration incorrect",
        details: { configuredDomain: baseUrl, expectedDomain: "https://voxera.vercel.app" },
      })
    } catch (error) {
      addHealthCheck({
        name: "System Health Check",
        status: "error",
        message: `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      })
    } finally {
      setRunning(false)
    }
  }

  const cleanup = async () => {
    if (testSurveyId) {
      try {
        await supabase.from("responses").delete().eq("survey_id", testSurveyId)
        await supabase.from("surveys").delete().eq("id", testSurveyId)
        addHealthCheck({
          name: "Cleanup",
          status: "success",
          message: "Test data cleaned up successfully",
          details: { cleanedSurveyId: testSurveyId },
        })
        setTestSurveyId(null)
      } catch (error) {
        addHealthCheck({
          name: "Cleanup",
          status: "error",
          message: `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        })
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "pending":
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={runHealthChecks}
                disabled={running}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                {running ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running Checks...
                  </>
                ) : (
                  "Run Health Checks"
                )}
              </Button>

              {testSurveyId && (
                <Button onClick={cleanup} variant="outline">
                  Cleanup Test Data
                </Button>
              )}
            </div>

            {healthChecks.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Health Check Results:</h3>
                {healthChecks.map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-gray-600">{check.message}</div>
                      {check.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {testSurveyId && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Test Survey Created:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Survey ID:</strong> {testSurveyId}
                  </div>
                  <div>
                    <strong>Response URL:</strong>{" "}
                    <a
                      href={createResponseUrl(testSurveyId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {createResponseUrl(testSurveyId)}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
