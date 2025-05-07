import type { cookies } from "next/headers"
import { supabaseBrowser } from "@/lib/supabaseClient"

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  // This is a simplified version that uses our shared client
  // In a real implementation, you might want to create a new client with the cookies
  return supabaseBrowser
}
