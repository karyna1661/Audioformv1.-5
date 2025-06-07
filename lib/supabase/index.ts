// Re-export all client-side functionality
export {
  supabase,
  createClient as createBrowserClient,
  createBrowserSupabaseClient,
} from "./client"

// Re-export all server-side functionality
export {
  supabaseServer,
  createClient as createServerClient,
  createAdminClient,
} from "./server"

// Export type definitions
export type { Database } from "@/types/database.types"
