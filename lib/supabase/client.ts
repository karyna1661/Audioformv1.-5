import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

// Create a singleton instance for client components
export const supabase = createClientComponentClient<Database>()

// For compatibility with existing code
export const createClient = () => {
  console.warn("createClient() is deprecated. Please use the supabase instance directly.")
  return createClientComponentClient<Database>()
}

export default supabase
