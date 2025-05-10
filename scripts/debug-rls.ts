import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config({ path: ".env.local" })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing required environment variables")
  process.exit(1)
}

// Create clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const serviceClient = SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

async function debugRLS() {
  console.log("=== RLS Debugging Tool ===")

  // 1. Check if RLS is enabled on tables
  console.log("\n1. Checking RLS status on tables...")
  const { data: rlsTables, error: rlsError } = (await serviceClient
    ?.from("pg_tables")
    .select("schemaname, tablename, rowsecurity")
    .eq("schemaname", "public")
    .in("tablename", ["surveys", "demo_sessions"])
    .execute()) || { data: null, error: new Error("Service role client not available") }

  if (rlsError) {
    console.error("Error checking RLS status:", rlsError)
  } else {
    console.table(rlsTables)
  }

  // 2. List all policies
  console.log("\n2. Listing all policies...")
  const { data: policies, error: policiesError } = (await serviceClient
    ?.from("pg_policies")
    .select("*")
    .in("tablename", ["surveys", "demo_sessions"])
    .execute()) || { data: null, error: new Error("Service role client not available") }

  if (policiesError) {
    console.error("Error listing policies:", policiesError)
  } else {
    console.table(policies)
  }

  // 3. Test anonymous demo survey creation
  console.log("\n3. Testing anonymous demo survey creation...")
  const testSurvey = {
    title: "RLS Debug Test Survey",
    questions: [{ id: "1", text: "Test Question" }],
    type: "demo",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user_id: null,
  }

  const { data: anonInsert, error: anonInsertError } = await anonClient
    .from("surveys")
    .insert(testSurvey)
    .select("id")
    .single()

  if (anonInsertError) {
    console.error("Anonymous insert failed:", anonInsertError)
  } else {
    console.log("Anonymous insert succeeded:", anonInsert)

    // Clean up test data
    if (serviceClient) {
      await serviceClient.from("surveys").delete().eq("id", anonInsert.id)
    }
  }

  // 4. Test service role demo survey creation
  if (serviceClient) {
    console.log("\n4. Testing service role demo survey creation...")
    const { data: serviceInsert, error: serviceInsertError } = await serviceClient
      .from("surveys")
      .insert(testSurvey)
      .select("id")
      .single()

    if (serviceInsertError) {
      console.error("Service role insert failed:", serviceInsertError)
    } else {
      console.log("Service role insert succeeded:", serviceInsert)

      // Clean up test data
      await serviceClient.from("surveys").delete().eq("id", serviceInsert.id)
    }
  } else {
    console.log("\n4. Skipping service role test (no service role key available)")
  }
}

// Run the debug function
debugRLS().catch(console.error)
