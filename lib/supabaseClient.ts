import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables.")
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your environment variables.")
}

// Common options for both clients
const commonOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
  telemetry: false,
}

// Public (browser) client — only anon key
export const supabaseBrowser: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  ...commonOptions,
  auth: {
    ...commonOptions.auth,
    persistSession: true, // Enable session persistence for browser client
  },
})

// Server (service‑role) client — only created if the key is available
let _supabaseServer: SupabaseClient<Database> | null = null

// Function to get the server client, with lazy initialization
export function getSupabaseServer(): SupabaseClient<Database> {
  // Only create the server client if we're in a server context and have the key
  if (typeof window === "undefined" && SUPABASE_SERVICE_ROLE_KEY) {
    if (!_supabaseServer) {
      _supabaseServer = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        ...commonOptions,
        auth: {
          ...commonOptions.auth,
          persistSession: false, // Disable session persistence for server client
        },
      })
    }
    return _supabaseServer
  }

  // If we're on the client side or don't have the service role key, use the browser client
  console.warn(
    "Attempted to use supabaseServer in a client context or without a service role key. Falling back to supabaseBrowser.",
  )
  return supabaseBrowser
}

// For backward compatibility and convenience
export const supabaseServer =
  typeof window === "undefined" && SUPABASE_SERVICE_ROLE_KEY ? getSupabaseServer() : supabaseBrowser

// For backward compatibility
export const supabase = supabaseBrowser

// Helper function to get the appropriate client based on context
export function getSupabaseClient(useAdmin = false): SupabaseClient<Database> {
  // Only use the admin client server-side when explicitly requested
  if (useAdmin && typeof window === "undefined" && SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseServer()
  }
  return supabaseBrowser
}
