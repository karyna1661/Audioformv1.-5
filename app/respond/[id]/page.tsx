// Force dynamic rendering so cookies() works in this route
export const dynamic = "force-dynamic"

// Server component: fetch survey by ID via Supabase with cookies
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import RespondUI from "@/components/respond/RespondUI"

export default async function RespondPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: survey, error } = await supabase
    .from("surveys")
    .select("id, title, description, questions, is_active, expires_at")
    .eq("id", params.id)
    .single()

  if (error || !survey) {
    throw new Error(`Survey ${params.id} not found`)
  }

  // Check if survey is active and not expired
  if (!survey.is_active) {
    throw new Error(`Survey ${params.id} is not active`)
  }

  if (survey.expires_at && new Date(survey.expires_at) < new Date()) {
    throw new Error(`Survey ${params.id} has expired`)
  }

  // Pass the fetched survey to a client component for UI & response flow
  return <RespondUI survey={survey} />
}
