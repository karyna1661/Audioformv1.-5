// Legacy compatibility file - exports all Supabase clients
import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Browser client for client-side usage
export const supabaseBrowser = createBrowserClient<Database>(
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

// Server client with service role key
export const supabaseServer = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Default export for backward compatibility
export const supabase = supabaseBrowser

// Default export
export default supabase
