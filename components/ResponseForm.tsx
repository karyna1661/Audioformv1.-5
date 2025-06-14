"use client"

import { sdk, FrameEmbed } from "@farcaster/frame-sdk"
import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { toast } from "sonner"

interface ResponseFormProps {
  surveyId: string
  question?: string
  onComplete?: () => void
}

export default function ResponseForm({ surveyId, question, onComplete }: ResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFarcasterFrame, setIsFarcasterFrame] = useState(false)

  useEffect(() => {
    // Check if running in Farcaster frame context
    if (typeof window !== "undefined" && window.location.search.includes("miniApp=true")) {
      setIsFarcasterFrame(true)
      sdk.actions.ready()
    }
  }, [])

  const handleSubmit = async (audioBlob: Blob) => {
    setIsSubmitting(true)

    try {
      // Create file with proper naming
      const timestamp = Date.now()
      const fileName = `${surveyId}_${timestamp}.webm`
      const file = new File([audioBlob], fileName, { type: "audio/webm" })

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("demo-audio")
        .upload(`responses/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload Error:", uploadError)
        toast.error("Failed to upload audio. Please try again.")
        return
      }

      // Insert response record
      const { error: insertError } = await supabase.from("responses").insert({
        survey_id: surveyId,
        audio_path: uploadData.path,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Database Error:", insertError)
        toast.error("Failed to save response. Please try again.")
        return
      }

      toast.success("Thanks for your response!")

      // Notify Farcaster frame if applicable
      if (isFarcasterFrame) {
        sdk.actions.close()
      }

      onComplete?.()
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isFarcasterFrame && <FrameEmbed />}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        {question && <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">{question}</h2>}

        <AudioRecorder onSubmit={handleSubmit} isLoading={isSubmitting} />

        {isFarcasterFrame && <div className="mt-4 text-center text-sm text-gray-500">Recording in Farcaster Frame</div>}
      </div>
    </div>
  )
}
