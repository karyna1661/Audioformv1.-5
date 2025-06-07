import { createClient } from "@/lib/supabase/client"
import { supabaseServer } from "@/lib/supabase/server"
import { handleDatabaseError, logDatabaseOperation, SurveyDatabaseError } from "@/lib/database/error-handler"

export interface Survey {
  id: string
  title: string
  description?: string
  questions: Question[]
  is_active: boolean
  expires_at?: string
  created_at: string
  user_id?: string
}

export interface Question {
  id: string
  survey_id: string
  prompt: string
  order: number
  type: string
  required: boolean
}

export interface SurveyResponse {
  id: string
  survey_id: string
  question_id: string
  audio_path: string
  email?: string
  created_at: string
  transcript?: string
  sentiment?: string
}

export class SurveyService {
  private supabase: ReturnType<typeof createClient>
  private isServer: boolean

  constructor(isServer = false) {
    this.isServer = isServer
    this.supabase = isServer ? supabaseServer : createClient()
  }

  async getSurveyById(surveyId: string): Promise<Survey> {
    try {
      logDatabaseOperation("getSurveyById", { surveyId })

      // Validate survey ID format
      if (!surveyId || typeof surveyId !== "string" || surveyId.trim().length === 0) {
        throw new SurveyDatabaseError({
          code: "INVALID_SURVEY_ID",
          message: "Invalid survey ID provided",
          hint: "Survey ID must be a non-empty string",
        })
      }

      const cleanSurveyId = surveyId.trim()

      // First, check if survey exists and get basic info
      const { data: surveyData, error: surveyError } = await this.supabase
        .from("surveys")
        .select(`
          id,
          title,
          description,
          is_active,
          expires_at,
          created_at,
          user_id
        `)
        .eq("id", cleanSurveyId)
        .single()

      if (surveyError) {
        logDatabaseOperation("getSurveyById", { surveyId: cleanSurveyId }, null, surveyError)
        throw handleDatabaseError(surveyError)
      }

      if (!surveyData) {
        throw new SurveyDatabaseError({
          code: "NOT_FOUND",
          message: "Survey not found",
          hint: "The survey may have been deleted or the ID is incorrect",
        })
      }

      // Check if survey is active
      if (!surveyData.is_active) {
        throw new SurveyDatabaseError({
          code: "SURVEY_INACTIVE",
          message: "This survey is no longer active",
          hint: "The survey has been deactivated by the creator",
        })
      }

      // Check if survey has expired
      if (surveyData.expires_at && new Date(surveyData.expires_at) < new Date()) {
        throw new SurveyDatabaseError({
          code: "SURVEY_EXPIRED",
          message: "This survey has expired",
          hint: `Survey expired on ${new Date(surveyData.expires_at).toLocaleDateString()}`,
        })
      }

      // Get questions for the survey
      const { data: questionsData, error: questionsError } = await this.supabase
        .from("questions")
        .select("*")
        .eq("survey_id", cleanSurveyId)
        .order("order", { ascending: true })

      if (questionsError) {
        logDatabaseOperation("getSurveyQuestions", { surveyId: cleanSurveyId }, null, questionsError)
        throw handleDatabaseError(questionsError)
      }

      const survey: Survey = {
        ...surveyData,
        questions: questionsData || [],
      }

      logDatabaseOperation("getSurveyById", { surveyId: cleanSurveyId }, survey)
      return survey
    } catch (error) {
      if (error instanceof SurveyDatabaseError) {
        throw error
      }
      throw handleDatabaseError(error)
    }
  }

  async submitResponse(responseData: {
    surveyId: string
    questionId: string
    audioBlob: Blob
    email?: string
  }): Promise<SurveyResponse> {
    try {
      const { surveyId, questionId, audioBlob, email } = responseData

      logDatabaseOperation("submitResponse", {
        surveyId,
        questionId,
        email,
        audioBlobSize: audioBlob.size,
      })

      // Validate input data
      if (!surveyId || !questionId || !audioBlob) {
        throw new SurveyDatabaseError({
          code: "INVALID_INPUT",
          message: "Missing required fields for response submission",
          hint: "Survey ID, question ID, and audio recording are required",
        })
      }

      // Verify survey exists and is valid
      await this.getSurveyById(surveyId)

      // Verify question exists and belongs to survey
      const { data: questionData, error: questionError } = await this.supabase
        .from("questions")
        .select("id, survey_id")
        .eq("id", questionId)
        .eq("survey_id", surveyId)
        .single()

      if (questionError) {
        logDatabaseOperation("verifyQuestion", { questionId, surveyId }, null, questionError)
        throw handleDatabaseError(questionError)
      }

      if (!questionData) {
        throw new SurveyDatabaseError({
          code: "QUESTION_NOT_FOUND",
          message: "Question not found or does not belong to this survey",
          hint: "The question may have been deleted or modified",
        })
      }

      // Check for existing response (if we want to prevent duplicates)
      const { data: existingResponse, error: existingError } = await this.supabase
        .from("responses")
        .select("id")
        .eq("survey_id", surveyId)
        .eq("question_id", questionId)
        .eq("email", email || "")
        .maybeSingle() // Use maybeSingle to avoid error if no rows found

      if (existingError) {
        logDatabaseOperation("checkExistingResponse", { surveyId, questionId, email }, null, existingError)
        // Don't throw error here, just log it
        console.warn("Error checking existing response:", existingError)
      }

      if (existingResponse) {
        throw new SurveyDatabaseError({
          code: "DUPLICATE_RESPONSE",
          message: "You have already responded to this question",
          hint: "Each person can only respond once per question",
        })
      }

      // Upload audio file
      const fileName = `responses/${surveyId}/${questionId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webm`

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from("audio-responses")
        .upload(fileName, audioBlob, {
          contentType: "audio/webm",
          upsert: false,
        })

      if (uploadError) {
        logDatabaseOperation("uploadAudio", { fileName }, null, uploadError)
        throw new SurveyDatabaseError({
          code: "UPLOAD_FAILED",
          message: "Failed to upload audio recording",
          details: uploadError,
          hint: "Please check your internet connection and try again",
        })
      }

      // Save response to database
      const responseRecord = {
        survey_id: surveyId,
        question_id: questionId,
        audio_path: uploadData.path,
        email: email || null,
        created_at: new Date().toISOString(),
      }

      const { data: savedResponse, error: saveError } = await this.supabase
        .from("responses")
        .insert(responseRecord)
        .select()
        .single()

      if (saveError) {
        logDatabaseOperation("saveResponse", responseRecord, null, saveError)

        // Try to clean up uploaded file if database save failed
        try {
          await this.supabase.storage.from("audio-responses").remove([uploadData.path])
        } catch (cleanupError) {
          console.error("Failed to cleanup uploaded file:", cleanupError)
        }

        throw handleDatabaseError(saveError)
      }

      logDatabaseOperation("submitResponse", responseData, savedResponse)
      return savedResponse
    } catch (error) {
      if (error instanceof SurveyDatabaseError) {
        throw error
      }
      throw handleDatabaseError(error)
    }
  }

  async getResponseCount(surveyId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from("responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", surveyId)

      if (error) {
        logDatabaseOperation("getResponseCount", { surveyId }, null, error)
        console.warn("Error getting response count:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.warn("Error getting response count:", error)
      return 0
    }
  }
}

// Export singleton instances
export const surveyService = new SurveyService(false) // Client-side
export const surveyServiceServer = new SurveyService(true) // Server-side
