// Force dynamic rendering so cookies() works in this route
export const dynamic = "force-dynamic"

// Server component: fetch survey by ID via Supabase with cookies
import { createSupabaseServerClient } from "@/lib/supabaseClient"
import type { Database } from "@/types/database.types"
import RespondUI from "@/components/respond/RespondUI"
import { notFound } from "next/navigation"

type Survey = Database["public"]["Tables"]["surveys"]["Row"]

export default async function RespondPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()

  try {
    const { data: survey, error } = await supabase
      .from("surveys")
      .select("id, title, description, questions, is_active, expires_at, created_at")
      .eq("id", params.id)
      .single()

    if (error || !survey) {
      console.error("Survey fetch error:", error)
      return notFound()
    }

    // Check if survey is active and not expired
    if (!survey.is_active) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Unavailable</h1>
            <p className="text-gray-600 mb-6">This survey is currently not active.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      )
    }

    if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Survey Expired</h1>
            <p className="text-gray-600 mb-6">This survey is no longer accepting responses.</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      )
    }

    // Pass the fetched survey to a client component for UI & response flow
    return <RespondUI survey={survey} />
  } catch (error) {
    console.error("Unexpected error in RespondPage:", error)
    return notFound()
  }
}
