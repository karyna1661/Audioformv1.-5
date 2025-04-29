import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log("Setting up Supabase storage...")

  // Create the demo-audio bucket
  const { data, error } = await supabase.storage.createBucket("demo-audio", {
    public: true,
    fileSizeLimit: 52428800, // 50MB limit
    allowedMimeTypes: ["audio/webm", "audio/mp3", "audio/mpeg", "audio/wav"],
  })

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("Bucket demo-audio already exists")
    } else {
      console.error("Error creating bucket:", error)
      return
    }
  } else {
    console.log("Bucket created successfully:", data)
  }

  // Set up storage policies for the demo-audio bucket
  console.log("Setting up storage policies...")

  // Allow public read access
  const { error: readPolicyError } = await supabase.storage.from("demo-audio").createPolicy("public-read", {
    name: "Public Read Access",
    definition: {
      statements: [
        {
          effect: "allow",
          action: "select",
          principal: "*",
        },
      ],
    },
  })

  if (readPolicyError) {
    console.error("Error creating read policy:", readPolicyError)
  } else {
    console.log("Public read policy created successfully")
  }

  // Allow authenticated users to upload
  const { error: insertPolicyError } = await supabase.storage.from("demo-audio").createPolicy("auth-insert", {
    name: "Authenticated Insert Access",
    definition: {
      statements: [
        {
          effect: "allow",
          action: "insert",
          principal: "authenticated",
        },
      ],
    },
  })

  if (insertPolicyError) {
    console.error("Error creating insert policy:", insertPolicyError)
  } else {
    console.log("Authenticated insert policy created successfully")
  }

  console.log("Storage setup complete!")
}

async function main() {
  try {
    await setupStorage()
    // Add other setup functions here as needed
  } catch (error) {
    console.error("Setup failed:", error)
  }
}

main()
