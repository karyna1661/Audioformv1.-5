// Re-export everything from the main client modules
export * from "./client"
export * from "./server"

// Re-export from the main supabaseClient module
export * from "../supabaseClient"

// Ensure backward compatibility
import { supabase as mainSupabase } from "../supabaseClient"
export { mainSupabase as supabase }
