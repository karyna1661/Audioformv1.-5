import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Create the main Supabase client
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

// Export createClient as a named export for compatibility
export const createClient = () => {
  return createBrowserClient<Database>(
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
}

// Export the browser client factory function
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
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
}

// Default export for backward compatibility
export default supabase
