import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storageKey: "audioform.auth",
      autoRefreshToken: true,
      persistSession: true,
    },
  },
)

// Additional exports for compatibility
export const supabaseBrowser = supabase
export default supabase
