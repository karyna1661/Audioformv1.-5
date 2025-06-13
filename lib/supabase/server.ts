import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"

export function getServerSupabase() {
  return createServerComponentClient<Database>({ cookies })
}

// Export a singleton instance for convenience
export const supabaseServer = createServerComponentClient<Database>({ cookies })
