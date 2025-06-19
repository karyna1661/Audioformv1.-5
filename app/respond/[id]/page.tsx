"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function RespondPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Feature Temporarily Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Direct response links are currently being updated. Please visit the main survey page to participate.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Go to Home
            </Button>

            <Button
              onClick={() => router.push("/demo")}
              variant="outline"
              className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-600"
            >
              Create New Survey
            </Button>
          </div>

          <p className="text-xs text-gray-400">Redirecting automatically in 5 seconds...</p>
        </CardContent>
      </Card>
    </div>
  )
}
