"use client"

import { useState, useEffect } from "react"
import { AudioRecorder } from "@/components/AudioRecorder"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

interface ResponseFormProps {
  surveyId: string
  question?: string
  onComplete?: () => void
  isFrame?: boolean
}

export default function ResponseForm({ surveyId, question, onComplete, isFrame = false }: ResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [frameContext, setFrameContext] = useState<any>(null)

  useEffect(() => {
    // Check if we're in a Farcaster frame
    if (isFrame || (typeof window !== "undefined" && window.location.search.includes("frame=true"))) {
      // Get frame context from URL parameters or postMessage
      const urlParams = new URLSearchParams(window.location.search)
      const fid = urlParams.get("fid")
      const castId = urlParams.get("castId")

      if (fid || castId) {
        setFrameContext({ fid, castId })
      }

      // Listen for frame messages
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "frame_context") {
          setFrameContext(event.data.context)
        }
      }

      window.addEventListener("message", handleMessage)
      return () => window.removeEventListener("message", handleMessage)
    }
  }, [isFrame])

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

      // Insert response record with frame context
      const responseData: any = {
        survey_id: surveyId,
        audio_path: uploadData.path,
        created_at: new Date().toISOString(),
      }

      // Add Farcaster context if available
      if (frameContext?.fid) {
        responseData.farcaster_fid = frameContext.fid
      }
      if (frameContext?.castId) {
        responseData.farcaster_cast_id = frameContext.castId
      }

      const { error: insertError } = await supabase.from("responses").insert(responseData)

      if (insertError) {
        console.error("Database Error:", insertError)
        toast.error("Failed to save response. Please try again.")
        return
      }

      toast.success("Thanks for your response!")

      // Handle frame completion
      if (isFrame) {
        // Post back to frame
        if (window.parent !== window) {
          window.parent.postMessage(
            {
              type: "frame_complete",
              success: true,
              message: "Response recorded successfully!",
            },
            "*",
          )
        }
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {question && <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">{question}</h2>}

        <AudioRecorder onSubmit={handleSubmit} isLoading={isSubmitting} />

        {isFrame && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500">Recording in Farcaster Frame</div>
            {frameContext?.fid && <div className="text-xs text-gray-400 mt-1">FID: {frameContext.fid}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
