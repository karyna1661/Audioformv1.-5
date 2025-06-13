"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

// Create a singleton instance for client components
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    console.warn("Attempted to create Supabase client in server environment")
    // Return a mock client or throw an error depending on your needs
    return {} as ReturnType<typeof createClientComponentClient<Database>>
  }

  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    })
  }
  return supabaseInstance
}

// Export the singleton instance directly
const supabase = typeof window !== "undefined" ? createClient() : null

export { supabase }
