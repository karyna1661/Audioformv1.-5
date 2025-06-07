import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required Supabase environment variables")
}

// Browser client for client-side operations
export const supabaseBrowser: SupabaseClient<Database> = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "audioform.auth",
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Server client for server-side operations (requires service role key)
export const supabaseServer: SupabaseClient<Database> = createSupabaseClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon key if service key not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

// Export supabase as a named export (REQUIRED by the error)
export const supabase: SupabaseClient<Database> = supabaseBrowser

// Export createClient as a named export for compatibility
export const createClient = (): SupabaseClient<Database> => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "audioform.auth",
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Additional factory functions for flexibility
export const createBrowserSupabaseClient = (): SupabaseClient<Database> => supabaseBrowser

export const createServerSupabaseClient = (): SupabaseClient<Database> => supabaseServer

// Helper function to get the appropriate client based on context
export function getSupabaseClient(useAdmin = false): SupabaseClient<Database> {
  // Only use the admin client server-side when explicitly requested
  if (useAdmin && typeof window === "undefined" && supabaseServiceKey) {
    return supabaseServer
  }
  return supabaseBrowser
}

// Default export for backward compatibility
export default supabaseBrowser
