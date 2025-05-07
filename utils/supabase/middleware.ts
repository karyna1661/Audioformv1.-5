import { type NextRequest, NextResponse } from "next/server"
import { supabaseBrowser } from "@/lib/supabaseClient"

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // This is a simplified version that uses our shared client
  // In a real implementation, you might want to create a new client with the cookies
  return { supabase: supabaseBrowser, response }
}
