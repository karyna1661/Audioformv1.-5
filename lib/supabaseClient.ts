import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables with error checking
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate environment variables
if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables.")
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your environment variables.")
}

// Only validate service role key when it's being used (server-side)
if (typeof window === "undefined" && !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Server-side admin operations will fail.")
}

// Common options for both clients
const commonOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
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

// Server (service‑role) client — full privileges for server actions
export const supabaseServer: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || "", // Fallback to empty string if missing
  {
    ...commonOptions,
    auth: {
      ...commonOptions.auth,
      persistSession: false, // Disable session persistence for server client
    },
  },
)

// Helper function to get the appropriate client based on context
export function getSupabaseClient(useAdmin = false): SupabaseClient<Database> {
  // Only use the admin client server-side when explicitly requested
  if (useAdmin && typeof window === "undefined") {
    return supabaseServer
  }
  return supabaseBrowser
}

// For backward compatibility
export const supabase = supabaseBrowser
