import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AudioResponse {
  questionId: string
  audioUrl: string
  duration: number
  timestamp: Date
}

interface SurveyProgress {
  surveyId: string
  currentQuestionIndex: number
  responses: AudioResponse[]
  isCompleted: boolean
  startedAt: Date
  completedAt?: Date
}

interface SurveyStore {
  surveys: Record<string, SurveyProgress>
  currentSurveyId: string | null

  // Actions
  initializeSurvey: (surveyId: string, totalQuestions: number) => void
  setCurrentSurvey: (surveyId: string) => void
  navigateToQuestion: (surveyId: string, questionIndex: number) => void
  addResponse: (surveyId: string, response: AudioResponse) => void
  markSurveyComplete: (surveyId: string) => void
  resetSurvey: (surveyId: string) => void
  clearAllSurveys: () => void

  // Getters
  getCurrentSurvey: () => SurveyProgress | null
  getSurveyProgress: (surveyId: string) => SurveyProgress | null
  getCompletedSurveys: () => SurveyProgress[]
  getTotalResponses: () => number
}

export const useSurveyStore = create<SurveyStore>()(
  persist(
    (set, get) => ({
      surveys: {},
      currentSurveyId: null,

      initializeSurvey: (surveyId: string, totalQuestions: number) => {
        set((state) => ({
          surveys: {
            ...state.surveys,
            [surveyId]: {
              surveyId,
              currentQuestionIndex: 0,
              responses: [],
              isCompleted: false,
              startedAt: new Date(),
            },
          },
          currentSurveyId: surveyId,
        }))
      },

      setCurrentSurvey: (surveyId: string) => {
        set({ currentSurveyId: surveyId })
      },

      navigateToQuestion: (surveyId: string, questionIndex: number) => {
        set((state) => ({
          surveys: {
            ...state.surveys,
            [surveyId]: {
              ...state.surveys[surveyId],
              currentQuestionIndex: questionIndex,
            },
          },
        }))
      },

      addResponse: (surveyId: string, response: AudioResponse) => {
        set((state) => {
          const survey = state.surveys[surveyId]
          if (!survey) return state

          const existingIndex = survey.responses.findIndex((r) => r.questionId === response.questionId)
          const newResponses = [...survey.responses]

          if (existingIndex >= 0) {
            newResponses[existingIndex] = response
          } else {
            newResponses.push(response)
          }

          return {
            surveys: {
              ...state.surveys,
              [surveyId]: {
                ...survey,
                responses: newResponses,
              },
            },
          }
        })
      },

      markSurveyComplete: (surveyId: string) => {
        set((state) => ({
          surveys: {
            ...state.surveys,
            [surveyId]: {
              ...state.surveys[surveyId],
              isCompleted: true,
              completedAt: new Date(),
            },
          },
        }))
      },

      resetSurvey: (surveyId: string) => {
        set((state) => {
          const { [surveyId]: removed, ...rest } = state.surveys
          return { surveys: rest }
        })
      },

      clearAllSurveys: () => {
        set({ surveys: {}, currentSurveyId: null })
      },

      getCurrentSurvey: () => {
        const state = get()
        return state.currentSurveyId ? state.surveys[state.currentSurveyId] || null : null
      },

      getSurveyProgress: (surveyId: string) => {
        return get().surveys[surveyId] || null
      },

      getCompletedSurveys: () => {
        return Object.values(get().surveys).filter((s) => s.isCompleted)
      },

      getTotalResponses: () => {
        return Object.values(get().surveys).reduce((total, survey) => total + survey.responses.length, 0)
      },
    }),
    {
      name: "survey-storage",
      version: 1,
    },
  ),
)
