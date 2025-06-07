import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required")
}

if (!supabaseServiceKey && !supabaseAnonKey) {
  throw new Error("Either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
}

// Create server client with service role key (preferred) or anon key (fallback)
export const supabaseServer = createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Export createClient as a named export (REQUIRED by the error)
export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export createServerClient as an alias for compatibility
export const createServerClient = createClient

// Helper function to get server client with admin privileges
export const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.warn("Service role key not available, using anon key")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Default export for backward compatibility
export default supabaseServer
