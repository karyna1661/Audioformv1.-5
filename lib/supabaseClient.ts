import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Browser client for client-side operations
export const supabaseBrowser = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "audioform.auth",
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Server client for server-side operations (requires service role key)
export const supabaseServer = createSupabaseClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Export createClient as a named export (required by the error)
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "audioform.auth",
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Additional factory functions
export const createBrowserSupabaseClient = () => supabaseBrowser
export const createServerSupabaseClient = () => supabaseServer

// Default export
export default supabaseBrowser
