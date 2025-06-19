import { supabaseServer } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"

type Survey = Database["public"]["Tables"]["surveys"]["Row"]
type SurveyInsert = Database["public"]["Tables"]["surveys"]["Insert"]
type Response = Database["public"]["Tables"]["responses"]["Row"]
type ResponseInsert = Database["public"]["Tables"]["responses"]["Insert"]
type DemoSession = Database["public"]["Tables"]["demo_sessions"]["Insert"]

export class SurveyService {
  /**
   * Creates a new survey with proper schema compliance
   */
  static async createSurvey(data: {
    title: string
    questions: Array<{ id: string; text: string; order: number }>
    type?: string
    userId?: string | null
  }): Promise<{ survey: Survey; session?: any }> {
    try {
      // Calculate expiry date (24 hours from now for demos)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      // Deactivate any existing active surveys for this user (if authenticated)
      if (data.userId) {
        await supabaseServer
          .from("surveys")
          .update({ is_active: false })
          .eq("user_id", data.userId)
          .eq("is_active", true)
      }

      // Prepare survey data according to schema
      const surveyData: SurveyInsert = {
        title: data.title.trim(),
        type: data.type || "demo",
        questions: data.questions,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        user_id: data.userId,
        is_active: true,
        settings: {
          allow_anonymous: true,
          max_responses: null,
          require_email: false,
          auto_expire: true,
        },
        metadata: {
          created_from: "demo_flow",
          version: "1.0",
          question_count: data.questions.length,
        },
      }

      console.log("Creating survey with data:", surveyData)

      // Insert survey
      const { data: survey, error: surveyError } = await supabaseServer
        .from("surveys")
        .insert(surveyData)
        .select()
        .single()

      if (surveyError) {
        console.error("Survey creation error:", surveyError)
        throw new Error(`Failed to create survey: ${surveyError.message}`)
      }

      if (!survey) {
        throw new Error("No survey data returned from database")
      }

      console.log("Survey created successfully:", survey.id)

      // Create demo session
      const sessionData: DemoSession = {
        survey_id: survey.id,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        notified: false,
        user_id: data.userId,
        created_at: new Date().toISOString(),
      }

      const { data: session, error: sessionError } = await supabaseServer
        .from("demo_sessions")
        .insert(sessionData)
        .select()
        .single()

      if (sessionError) {
        console.warn("Demo session creation warning:", sessionError)
        // Continue without failing - survey is created
      }

      // Initialize storage bucket structure
      await this.initializeStorageBucket(survey.id)

      return { survey, session }
    } catch (error) {
      console.error("Survey service error:", error)
      throw error
    }
  }

  /**
   * Initializes storage bucket structure for a survey
   */
  static async initializeStorageBucket(surveyId: string): Promise<void> {
    try {
      const bucketPath = `surveys/${surveyId}/responses`

      // Create a placeholder file to ensure the directory structure exists
      const { error } = await supabaseServer.storage
        .from("demo-audio")
        .upload(`${bucketPath}/.keep`, new Blob([""], { type: "text/plain" }), {
          upsert: true,
        })

      if (error && !error.message.includes("already exists")) {
        console.warn("Storage initialization warning:", error)
      } else {
        console.log("Storage bucket initialized for survey:", surveyId)
      }
    } catch (error) {
      console.warn("Storage initialization failed:", error)
      // Don't fail survey creation for storage issues
    }
  }

  /**
   * Saves an audio response with proper schema compliance
   */
  static async saveResponse(data: {
    surveyId: string
    questionId: string
    questionIndex: number
    audioBlob: Blob
    userId?: string | null
  }): Promise<Response> {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `surveys/${data.surveyId}/responses/${data.questionId}_${timestamp}.webm`

      console.log("Uploading audio to:", filename)

      // Upload audio file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("demo-audio")
        .upload(filename, data.audioBlob, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Audio upload error:", uploadError)
        throw new Error(`Failed to upload audio: ${uploadError.message}`)
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("demo-audio").getPublicUrl(filename)

      // Prepare response data according to schema
      const responseData: ResponseInsert = {
        survey_id: data.surveyId,
        question_id: data.questionId,
        question_index: data.questionIndex,
        audio_path: uploadData.path,
        audio_url: publicUrlData.publicUrl,
        created_at: new Date().toISOString(),
        user_id: data.userId,
        metadata: {
          file_size: data.audioBlob.size,
          mime_type: data.audioBlob.type,
          upload_timestamp: timestamp,
        },
      }

      console.log("Saving response data:", responseData)

      // Insert response record
      const { data: response, error: responseError } = await supabase
        .from("responses")
        .insert(responseData)
        .select()
        .single()

      if (responseError) {
        console.error("Response save error:", responseError)
        throw new Error(`Failed to save response: ${responseError.message}`)
      }

      if (!response) {
        throw new Error("No response data returned from database")
      }

      console.log("Response saved successfully:", response.id)
      return response
    } catch (error) {
      console.error("Response service error:", error)
      throw error
    }
  }

  /**
   * Gets survey with response count
   */
  static async getSurveyWithStats(surveyId: string): Promise<Survey & { response_count: number }> {
    try {
      // Get survey
      const { data: survey, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single()

      if (surveyError || !survey) {
        throw new Error("Survey not found")
      }

      // Get response count
      const { count } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)

      return {
        ...survey,
        response_count: count || 0,
      }
    } catch (error) {
      console.error("Get survey error:", error)
      throw error
    }
  }

  /**
   * Gets all responses for a survey
   */
  static async getSurveyResponses(surveyId: string): Promise<Response[]> {
    try {
      const { data: responses, error } = await supabase
        .from("responses")
        .select("*")
        .eq("survey_id", surveyId)
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch responses: ${error.message}`)
      }

      return responses || []
    } catch (error) {
      console.error("Get responses error:", error)
      throw error
    }
  }

  /**
   * Updates survey status
   */
  static async updateSurveyStatus(surveyId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase.from("surveys").update({ is_active: isActive }).eq("id", surveyId)

      if (error) {
        throw new Error(`Failed to update survey: ${error.message}`)
      }
    } catch (error) {
      console.error("Update survey error:", error)
      throw error
    }
  }

  /**
   * Deletes a survey and its associated data
   */
  static async deleteSurvey(surveyId: string): Promise<void> {
    try {
      // Delete responses first (due to foreign key constraint)
      await supabase.from("responses").delete().eq("survey_id", surveyId)

      // Delete demo session
      await supabase.from("demo_sessions").delete().eq("survey_id", surveyId)

      // Delete survey
      const { error } = await supabase.from("surveys").delete().eq("id", surveyId)

      if (error) {
        throw new Error(`Failed to delete survey: ${error.message}`)
      }

      // Clean up storage (optional - files can remain for backup)
      try {
        const { data: files } = await supabase.storage.from("demo-audio").list(`surveys/${surveyId}/responses`)

        if (files && files.length > 0) {
          const filePaths = files.map((file) => `surveys/${surveyId}/responses/${file.name}`)
          await supabase.storage.from("demo-audio").remove(filePaths)
        }
      } catch (storageError) {
        console.warn("Storage cleanup warning:", storageError)
      }
    } catch (error) {
      console.error("Delete survey error:", error)
      throw error
    }
  }
}
