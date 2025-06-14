import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"

// Shared constants
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables")
}

// Client-side usage
export function createSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("createSupabaseBrowserClient called on server")
  }

  return createClientComponentClient<Database>()
}

// Server-side usage (API routes, server components, etc.)
export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({ cookies })
}

// Create browser client instance
export const supabaseBrowser = (() => {
  if (typeof window !== "undefined") {
    return createClientComponentClient<Database>()
  }
  // Return a dummy object for server-side to prevent crashes
  return {} as ReturnType<typeof createClientComponentClient<Database>>
})()

// Create server client instance (only use in server context)
export const supabaseServer = (() => {
  if (typeof window === "undefined") {
    try {
      return createServerComponentClient<Database>({ cookies })
    } catch {
      // Fallback for build time or when cookies aren't available
      return {} as ReturnType<typeof createServerComponentClient<Database>>
    }
  }
  return {} as ReturnType<typeof createServerComponentClient<Database>>
})()

// Legacy exports for backward compatibility
export function createClient() {
  console.warn("createClient() is deprecated. Use createSupabaseBrowserClient() instead.")
  return createSupabaseBrowserClient()
}

export const supabase = supabaseBrowser

// Additional exports for compatibility
export const createBrowserSupabaseClient = createSupabaseBrowserClient
export const createServerSupabaseClient = createSupabaseServerClient

// Helper function to get the appropriate client based on context
export function getSupabaseClient(useAdmin = false): ReturnType<typeof createClientComponentClient<Database>> {
  if (typeof window === "undefined") {
    console.warn("getSupabaseClient called on server, returning browser client")
  }
  return supabaseBrowser
}

// Default export for backward compatibility
export default supabaseBrowser
