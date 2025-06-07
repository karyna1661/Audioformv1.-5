import { describe, it, expect, beforeEach, jest } from "@jest/globals"
import { SurveyService } from "@/lib/services/survey-service"
import { SurveyDatabaseError } from "@/lib/database/error-handler"

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}

describe("Survey Response System", () => {
  let surveyService: SurveyService

  beforeEach(() => {
    jest.clearAllMocks()
    surveyService = new SurveyService(false)
    // @ts-ignore
    surveyService.supabase = mockSupabase
  })

  describe("getSurveyById", () => {
    it("should return survey when valid ID is provided", async () => {
      const mockSurveyData = {
        id: "test-survey-id",
        title: "Test Survey",
        is_active: true,
        expires_at: null,
      }

      const mockQuestionsData = [{ id: "q1", survey_id: "test-survey-id", prompt: "Question 1", order: 1 }]

      mockSupabase.from.mockImplementation((table) => {
        if (table === "surveys") {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockSurveyData, error: null }),
              }),
            }),
          }
        }
        if (table === "questions") {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: mockQuestionsData, error: null }),
              }),
            }),
          }
        }
      })

      const result = await surveyService.getSurveyById("test-survey-id")

      expect(result).toEqual({
        ...mockSurveyData,
        questions: mockQuestionsData,
      })
    })

    it("should throw error when survey is not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: "PGRST116" } }),
          }),
        }),
      })

      await expect(surveyService.getSurveyById("non-existent-id")).rejects.toThrow(SurveyDatabaseError)
    })

    it("should throw error when survey is inactive", async () => {
      const mockSurveyData = {
        id: "test-survey-id",
        title: "Test Survey",
        is_active: false,
        expires_at: null,
      }

      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockSurveyData, error: null }),
          }),
        }),
      })

      await expect(surveyService.getSurveyById("test-survey-id")).rejects.toThrow("This survey is no longer active")
    })

    it("should throw error when survey is expired", async () => {
      const mockSurveyData = {
        id: "test-survey-id",
        title: "Test Survey",
        is_active: true,
        expires_at: "2023-01-01T00:00:00Z", // Past date
      }

      mockSupabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: mockSurveyData, error: null }),
          }),
        }),
      })

      await expect(surveyService.getSurveyById("test-survey-id")).rejects.toThrow("This survey has expired")
    })
  })

  describe("submitResponse", () => {
    it("should successfully submit response with valid data", async () => {
      const mockSurveyData = {
        id: "test-survey-id",
        title: "Test Survey",
        is_active: true,
        expires_at: null,
        questions: [{ id: "q1", survey_id: "test-survey-id", prompt: "Question 1", order: 1 }],
      }

      const mockQuestionData = {
        id: "q1",
        survey_id: "test-survey-id",
      }

      const mockUploadData = {
        path: "responses/test-survey-id/q1/audio.webm",
      }

      const mockResponseData = {
        id: "response-id",
        survey_id: "test-survey-id",
        question_id: "q1",
        audio_path: "responses/test-survey-id/q1/audio.webm",
      }

      // Mock getSurveyById
      jest.spyOn(surveyService, "getSurveyById").mockResolvedValue(mockSurveyData as any)

      mockSupabase.from.mockImplementation((table) => {
        if (table === "questions") {
          return {
            select: () => ({
              eq: (field: string, value: string) => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: mockQuestionData, error: null }),
                }),
              }),
            }),
          }
        }
        if (table === "responses") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: () => Promise.resolve({ data: null, error: null }),
                  }),
                }),
              }),
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: mockResponseData, error: null }),
              }),
            }),
          }
        }
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: () => Promise.resolve({ data: mockUploadData, error: null }),
      })

      const audioBlob = new Blob(["test audio"], { type: "audio/webm" })

      const result = await surveyService.submitResponse({
        surveyId: "test-survey-id",
        questionId: "q1",
        audioBlob,
        email: "test@example.com",
      })

      expect(result).toEqual(mockResponseData)
    })

    it("should throw error when required fields are missing", async () => {
      await expect(
        surveyService.submitResponse({
          surveyId: "",
          questionId: "q1",
          audioBlob: new Blob(),
          email: "test@example.com",
        }),
      ).rejects.toThrow("Missing required fields")
    })
  })
})
