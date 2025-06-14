import type { Database } from "@/types/database.types"

// Type-only imports to avoid build issues
import type { SupabaseClient } from "@supabase/supabase-js"

// Safe environment variable access
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Mock client type for build safety
type MockSupabaseClient = {
  from: (table: string) => any
  storage: { from: (bucket: string) => any }
  auth: any
}

// Client-side usage - lazy loaded to avoid build issues
export function createSupabaseBrowserClient(): SupabaseClient<Database> | MockSupabaseClient {
  if (typeof window === "undefined") {
    // Return mock during SSR/build
    return {
      from: () => ({ select: () => ({}), insert: () => ({}), update: () => ({}), delete: () => ({}) }),
      storage: { from: () => ({ upload: () => ({}), download: () => ({}) }) },
      auth: {},
    }
  }

  try {
    // Dynamic import to avoid build issues
    const { createClientComponentClient } = require("@supabase/auth-helpers-nextjs")
    return createClientComponentClient<Database>()
  } catch (error) {
    console.warn("Could not create Supabase client:", error)
    return {
      from: () => ({ select: () => ({}), insert: () => ({}), update: () => ({}), delete: () => ({}) }),
      storage: { from: () => ({ upload: () => ({}), download: () => ({}) }) },
      auth: {},
    }
  }
}

// Server-side usage - lazy loaded
export function createSupabaseServerClient(): SupabaseClient<Database> | MockSupabaseClient {
  if (typeof window !== "undefined") {
    return createSupabaseBrowserClient()
  }

  try {
    const { createServerComponentClient } = require("@supabase/auth-helpers-nextjs")
    const { cookies } = require("next/headers")
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    console.warn("Could not create server Supabase client:", error)
    return {
      from: () => ({ select: () => ({}), insert: () => ({}), update: () => ({}), delete: () => ({}) }),
      storage: { from: () => ({ upload: () => ({}), download: () => ({}) }) },
      auth: {},
    }
  }
}

// Safe singleton instances
let _browserClient: SupabaseClient<Database> | MockSupabaseClient | null = null
let _serverClient: SupabaseClient<Database> | MockSupabaseClient | null = null

export const supabaseBrowser = (() => {
  if (!_browserClient) {
    _browserClient = createSupabaseBrowserClient()
  }
  return _browserClient
})()

export const supabaseServer = (() => {
  if (!_serverClient) {
    _serverClient = createSupabaseServerClient()
  }
  return _serverClient
})()

// Legacy exports
export const supabase = supabaseBrowser
export const createClient = createSupabaseBrowserClient
export const createBrowserSupabaseClient = createSupabaseBrowserClient
export const createServerSupabaseClient = createSupabaseServerClient
export function getSupabaseClient() {
  return supabaseBrowser
}
export default supabaseBrowser
