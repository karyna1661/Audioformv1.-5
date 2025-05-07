import { execSync } from "child_process"

// Search patterns
const patterns = [
  "createClient(",
  'from "@supabase/supabase-js"',
  "from '@supabase/supabase-js'",
  "import { createClient }",
  "import { createServerClient }",
  "import { createBrowserClient }",
]

// Directories to exclude
const excludeDirs = ["node_modules", ".next", "dist", ".git", "scripts"]

// Run grep to find potential files
try {
  console.log("Searching for files with potential Supabase client creation...")

  // Use grep to find potential files (Unix-based systems)
  const grepCommand = `grep -r "${patterns.join("\\|")}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "${excludeDirs.join("\\|")}"`

  try {
    const result = execSync(grepCommand, { encoding: "utf-8" })
    console.log("Files that may need refactoring:")
    console.log(result)
  } catch (error) {
    // grep returns non-zero exit code if no matches found
    console.log("No matches found with grep.")
  }

  console.log("\nDone! Review these files and update them to use the shared Supabase client.")
  console.log("Replace direct client creation with:")
  console.log("import { supabaseBrowser, supabaseServer } from '@/lib/supabaseClient'")
} catch (error) {
  console.error("Error running search:", error)
}
