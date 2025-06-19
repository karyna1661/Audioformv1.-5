"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AudioRecorder } from "@/components/AudioRecorder"

const supabase = createClientComponentClient()

export default function TestDiagnosticsPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [testSurveyId, setTestSurveyId] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults((prev) => [...prev, `${timestamp}: ${message}`])
  }

  const runDiagnostics = async () => {
    setTestResults([])
    addResult("🔍 Starting comprehensive diagnostics...")

    try {
      // Test 1: Create a test survey
      addResult("📝 Creating test survey...")
      const testSurvey = {
        title: `Diagnostic Test Survey ${Date.now()}`,
        description: "Test survey for diagnostics",
        questions: [
          { text: "Test question 1", order: 1 },
          { text: "Test question 2", order: 2 },
        ],
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const { data: survey, error: createError } = await supabase.from("surveys").insert(testSurvey).select().single()

      if (createError) {
        addResult(`❌ Survey creation failed: ${createError.message}`)
        return
      }

      addResult(`✅ Survey created with ID: ${survey.id}`)
      setTestSurveyId(survey.id)

      // Test 2: Test URL generation
      addResult("🔗 Testing URL generation...")
      const baseUrl = "https://voxera.vercel.app"
      const responseUrl = `${baseUrl}/respond/${survey.id}`
      addResult(`✅ Generated URL: ${responseUrl}`)

      // Test 3: Test URL accessibility
      addResult("🌐 Testing URL accessibility...")
      try {
        const response = await fetch(responseUrl, { method: "HEAD" })
        addResult(`✅ URL response status: ${response.status}`)
      } catch (error) {
        addResult(`❌ URL fetch error: ${error}`)
      }

      // Test 4: Test survey retrieval
      addResult("📊 Testing survey retrieval...")
      const { data: retrievedSurvey, error: retrieveError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", survey.id)
        .single()

      if (retrieveError) {
        addResult(`❌ Survey retrieval failed: ${retrieveError.message}`)
      } else {
        addResult(`✅ Survey retrieved successfully: ${retrievedSurvey.title}`)
      }

      addResult("🎉 Diagnostics completed!")
    } catch (error) {
      addResult(`❌ Diagnostic error: ${error}`)
    }
  }

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    setRecordingDuration(duration)
    addResult(`🎤 Recording completed with duration: ${duration} seconds`)
  }

  const cleanupTest = async () => {
    if (testSurveyId) {
      try {
        await supabase.from("responses").delete().eq("survey_id", testSurveyId)
        await supabase.from("surveys").delete().eq("id", testSurveyId)
        addResult("🧹 Test data cleaned up")
        setTestSurveyId(null)
      } catch (error) {
        addResult(`❌ Cleanup error: ${error}`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Application Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={runDiagnostics}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                Run Diagnostics
              </Button>
              {testSurveyId && (
                <Button onClick={cleanupTest} variant="outline">
                  Cleanup Test Data
                </Button>
              )}
            </div>

            {testResults.length > 0 && (
              <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            )}

            {testSurveyId && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Test Survey Links:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Survey ID:</strong> {testSurveyId}
                  </div>
                  <div>
                    <strong>Response URL:</strong>{" "}
                    <a
                      href={`https://voxera.vercel.app/respond/${testSurveyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      https://voxera.vercel.app/respond/{testSurveyId}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recording Counter Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Test the recording counter functionality below:</p>
              <AudioRecorder onRecordingComplete={handleRecordingComplete} questionIndex={0} />
              {recordingDuration > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-green-800">✅ Last recording duration: {recordingDuration} seconds</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
