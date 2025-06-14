"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "audioform.auth",
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Additional exports for compatibility
export const supabaseBrowser = supabase
export default supabase
