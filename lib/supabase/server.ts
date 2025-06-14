import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Add the missing export for backward compatibility
export const createSupabaseServerClient = () => supabaseServer
