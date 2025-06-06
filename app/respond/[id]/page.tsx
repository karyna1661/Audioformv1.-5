"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { supabaseServer } from "@/lib/supabase/server"
import { AudioRecorder } from "@/components/AudioRecorder"
import { ArrowLeft, Users, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface SurveyResponsePageProps {
  params: {
    id: string
  }
}

async function SurveyContent({ id }: { id: string }) {
  const supabase = supabaseServer()

  const { data: survey, error } = await supabase.from("surveys").select("*").eq("id", id).single()

  if (error || !survey) {
    notFound()
  }

  const { data: responses } = await supabase.from("survey_responses").select("id").eq("survey_id", id)

  const responseCount = responses?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{responseCount} responses</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>~2 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Survey Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            Voice Survey
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {survey.title}
          </h1>

          {survey.description && (
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">{survey.description}</p>
          )}
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Share Your Voice</h2>
            <p className="text-gray-600">Record your response to this survey question</p>
          </div>

          <AudioRecorder
            onSubmit={async (audioBlob) => {
              // Handle audio submission
              console.log("Audio submitted:", audioBlob)
            }}
            isLoading={false}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">Your response will be anonymous and help improve our understanding</p>
        </div>
      </div>
    </div>
  )
}

export default function SurveyResponsePage({ params }: SurveyResponsePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading survey...</p>
          </div>
        </div>
      }
    >
      <SurveyContent id={params.id} />
    </Suspense>
  )
}
