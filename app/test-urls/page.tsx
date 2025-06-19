"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createResponseUrl, createSurveyUrl, validateUrl, cleanUrl } from "@/lib/utils/url"

export default function TestUrlsPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runUrlTests = async () => {
    setIsLoading(true)
    setTestResults([])

    try {
      // Test 1: Basic URL generation
      addResult("🧪 Testing basic URL generation...")
      const testSurveyId = "55c76346-be13-4ce2-8d68-a6d6fb1c2a04"
      const responseUrl = createResponseUrl(testSurveyId)
      const surveyUrl = createSurveyUrl(testSurveyId)

      addResult(`✅ Response URL: ${responseUrl}`)
      addResult(`✅ Survey URL: ${surveyUrl}`)

      // Test 2: URL validation
      addResult("🧪 Testing URL validation...")
      const isResponseUrlValid = validateUrl(responseUrl)
      const isSurveyUrlValid = validateUrl(surveyUrl)

      addResult(`✅ Response URL valid: ${isResponseUrlValid}`)
      addResult(`✅ Survey URL valid: ${isSurveyUrlValid}`)

      // Test 3: URL cleaning
      addResult("🧪 Testing URL cleaning...")
      const dirtyUrl = "https://voxera.vercel.app //respond/ 55c76346-be13-4ce2-8d68-a6d6fb1c2a04 "
      const cleanedUrl = cleanUrl(dirtyUrl)
      addResult(`✅ Cleaned URL: ${cleanedUrl}`)

      // Test 4: Test actual navigation
      addResult("🧪 Testing URL navigation...")
      try {
        const testResponse = await fetch(responseUrl, { method: "HEAD" })
        addResult(`✅ Response URL accessible: ${testResponse.status}`)
      } catch (error) {
        addResult(`❌ Response URL error: ${error}`)
      }

      // Test 5: Test with various survey IDs
      addResult("🧪 Testing with various survey IDs...")
      const testIds = ["test-id-123", "55c76346-be13-4ce2-8d68-a6d6fb1c2a04", " spaced-id ", "special-chars-!@#"]

      testIds.forEach((id) => {
        const url = createResponseUrl(id)
        const isValid = validateUrl(url)
        addResult(`✅ ID "${id}" -> ${url} (valid: ${isValid})`)
      })

      addResult("🎉 All URL tests completed!")
    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>URL Generation Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={runUrlTests}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                {isLoading ? "Running Tests..." : "Run URL Tests"}
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
