import { createClient } from "@supabase/supabase-js"

// The environment variable name should be NEXT_PUBLIC_SUPABASE_URL, not SUPABASE_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Add error checking to provide better error messages
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required. Please check your environment variables.")
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your environment variables.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
