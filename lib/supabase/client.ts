import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing required Supabase environment variables")
}

// Create the main Supabase client
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "audioform.auth",
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Export createClient as a named export for compatibility
export const createClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "audioform.auth",
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Export the browser client factory function
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "audioform.auth",
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Default export for backward compatibility
export default supabase
