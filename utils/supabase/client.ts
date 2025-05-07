import { supabaseBrowser } from "@/lib/supabaseClient"

export const createClient = () => {
  // Simply return our shared browser client
  return supabaseBrowser
}
