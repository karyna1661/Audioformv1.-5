"use client"

import { SurveyDebug } from "@/components/debug/survey-debug"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SurveyDebugPage({ params }: { params: { id: string } }) {
  const surveyId = params.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Survey Debug Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Use this tool to diagnose issues with survey loading.</p>
            <SurveyDebug surveyId={surveyId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
