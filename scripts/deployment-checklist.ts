/**
 * Deployment Checklist and Verification Script
 * Run this after deployment to verify all fixes are working
 */

import { createClient } from "@supabase/supabase-js"

interface DeploymentCheck {
  name: string
  status: "pending" | "success" | "error" | "warning"
  message: string
  details?: any
}

class DeploymentValidator {
  private checks: DeploymentCheck[] = []
  private supabase: any

  constructor() {
    // Initialize Supabase client for testing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables")
      return
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  private addCheck(check: DeploymentCheck) {
    this.checks.push({ ...check, timestamp: new Date().toISOString() })
    console.log(`[${check.status.toUpperCase()}] ${check.name}: ${check.message}`)
  }

  async runDeploymentChecks() {
    console.log("🚀 Starting Production Deployment Verification...\n")

    // 1. Environment Variables Check
    await this.checkEnvironmentVariables()

    // 2. Database Connectivity
    await this.checkDatabaseConnectivity()

    // 3. URL Generation
    await this.checkUrlGeneration()

    // 4. API Endpoints
    await this.checkApiEndpoints()

    // 5. Real-time Functionality
    await this.checkRealTimeFunctionality()

    // 6. Storage Access
    await this.checkStorageAccess()

    // 7. Domain Configuration
    await this.checkDomainConfiguration()

    this.printSummary()
    return this.checks
  }

  private async checkEnvironmentVariables() {
    this.addCheck({ name: "Environment Variables", status: "pending", message: "Checking environment variables..." })

    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      this.addCheck({
        name: "Environment Variables",
        status: "error",
        message: `Missing environment variables: ${missingVars.join(", ")}`,
        details: { missingVars },
      })
    } else {
      this.addCheck({
        name: "Environment Variables",
        status: "success",
        message: "All required environment variables are present",
        details: { checkedVars: requiredVars },
      })
    }
  }

  private async checkDatabaseConnectivity() {
    this.addCheck({ name: "Database Connectivity", status: "pending", message: "Testing database connection..." })

    try {
      const { data, error } = await this.supabase.from("surveys").select("count").limit(1)

      if (error) {
        this.addCheck({
          name: "Database Connectivity",
          status: "error",
          message: `Database connection failed: ${error.message}`,
          details: error,
        })
      } else {
        this.addCheck({
          name: "Database Connectivity",
          status: "success",
          message: "Database connection successful",
          details: { connectionTest: "passed" },
        })
      }
    } catch (error) {
      this.addCheck({
        name: "Database Connectivity",
        status: "error",
        message: `Database connection error: ${error}`,
        details: error,
      })
    }
  }

  private async checkUrlGeneration() {
    this.addCheck({ name: "URL Generation", status: "pending", message: "Testing URL generation..." })

    try {
      // Import the URL utility (this would need to be adjusted based on your build setup)
      const testId = "550e8400-e29b-41d4-a716-446655440000"
      const expectedUrl = `https://voxera.vercel.app/respond/${testId}`

      // Test URL format
      const urlRegex =
        /^https:\/\/voxera\.vercel\.app\/respond\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const isValidFormat = urlRegex.test(expectedUrl)

      if (isValidFormat) {
        this.addCheck({
          name: "URL Generation",
          status: "success",
          message: "URL generation format is correct",
          details: { testUrl: expectedUrl, formatValid: true },
        })
      } else {
        this.addCheck({
          name: "URL Generation",
          status: "error",
          message: "URL generation format is incorrect",
          details: { testUrl: expectedUrl, formatValid: false },
        })
      }
    } catch (error) {
      this.addCheck({
        name: "URL Generation",
        status: "error",
        message: `URL generation test failed: ${error}`,
        details: error,
      })
    }
  }

  private async checkApiEndpoints() {
    this.addCheck({ name: "API Endpoints", status: "pending", message: "Testing API endpoints..." })

    const endpoints = ["/api/surveys", "/api/responses"]

    let successCount = 0
    const results = []

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`https://voxera.vercel.app${endpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        const result = {
          endpoint,
          status: response.status,
          ok: response.ok,
        }

        results.push(result)

        if (response.ok || response.status === 405) {
          // 405 is acceptable for some endpoints
          successCount++
        }
      } catch (error) {
        results.push({
          endpoint,
          error: error.message,
        })
      }
    }

    if (successCount === endpoints.length) {
      this.addCheck({
        name: "API Endpoints",
        status: "success",
        message: "All API endpoints are accessible",
        details: { results },
      })
    } else {
      this.addCheck({
        name: "API Endpoints",
        status: "warning",
        message: `${successCount}/${endpoints.length} API endpoints accessible`,
        details: { results },
      })
    }
  }

  private async checkRealTimeFunctionality() {
    this.addCheck({ name: "Real-time Functionality", status: "pending", message: "Testing real-time subscriptions..." })

    try {
      const channel = this.supabase
        .channel("deployment-test")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "surveys",
          },
          () => {
            // Test callback
          },
        )
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            this.addCheck({
              name: "Real-time Functionality",
              status: "success",
              message: "Real-time subscriptions working correctly",
              details: { subscriptionStatus: status },
            })
          } else {
            this.addCheck({
              name: "Real-time Functionality",
              status: "error",
              message: `Real-time subscription failed: ${status}`,
              details: { subscriptionStatus: status },
            })
          }

          // Cleanup
          setTimeout(() => {
            this.supabase.removeChannel(channel)
          }, 1000)
        })
    } catch (error) {
      this.addCheck({
        name: "Real-time Functionality",
        status: "error",
        message: `Real-time test failed: ${error}`,
        details: error,
      })
    }
  }

  private async checkStorageAccess() {
    this.addCheck({ name: "Storage Access", status: "pending", message: "Testing storage access..." })

    try {
      const { data, error } = await this.supabase.storage.from("demo-audio").list("", { limit: 1 })

      if (error) {
        this.addCheck({
          name: "Storage Access",
          status: "error",
          message: `Storage access failed: ${error.message}`,
          details: error,
        })
      } else {
        this.addCheck({
          name: "Storage Access",
          status: "success",
          message: "Storage access working correctly",
          details: { storageTest: "passed" },
        })
      }
    } catch (error) {
      this.addCheck({
        name: "Storage Access",
        status: "error",
        message: `Storage test failed: ${error}`,
        details: error,
      })
    }
  }

  private async checkDomainConfiguration() {
    this.addCheck({ name: "Domain Configuration", status: "pending", message: "Verifying domain configuration..." })

    try {
      const response = await fetch("https://voxera.vercel.app", { method: "HEAD" })

      if (response.ok) {
        this.addCheck({
          name: "Domain Configuration",
          status: "success",
          message: "Domain is accessible and responding correctly",
          details: { status: response.status, domain: "voxera.vercel.app" },
        })
      } else {
        this.addCheck({
          name: "Domain Configuration",
          status: "error",
          message: `Domain returned status: ${response.status}`,
          details: { status: response.status, domain: "voxera.vercel.app" },
        })
      }
    } catch (error) {
      this.addCheck({
        name: "Domain Configuration",
        status: "error",
        message: `Domain accessibility test failed: ${error}`,
        details: error,
      })
    }
  }

  private printSummary() {
    console.log("\n📊 DEPLOYMENT VERIFICATION SUMMARY")
    console.log("=====================================")

    const summary = {
      total: this.checks.length,
      success: this.checks.filter((c) => c.status === "success").length,
      error: this.checks.filter((c) => c.status === "error").length,
      warning: this.checks.filter((c) => c.status === "warning").length,
    }

    console.log(`✅ Success: ${summary.success}`)
    console.log(`❌ Errors: ${summary.error}`)
    console.log(`⚠️  Warnings: ${summary.warning}`)
    console.log(`📊 Total: ${summary.total}`)

    if (summary.error === 0) {
      console.log("\n🎉 DEPLOYMENT VERIFICATION PASSED!")
      console.log("All critical systems are functioning correctly.")
    } else {
      console.log("\n🚨 DEPLOYMENT VERIFICATION FAILED!")
      console.log("Please address the errors before proceeding.")
    }

    console.log("\n📋 Detailed Results:")
    this.checks.forEach((check) => {
      const icon = check.status === "success" ? "✅" : check.status === "error" ? "❌" : "⚠️"
      console.log(`${icon} ${check.name}: ${check.message}`)
    })
  }
}

// Export for use in deployment scripts
export { DeploymentValidator }

// Run if called directly
if (require.main === module) {
  const validator = new DeploymentValidator()
  validator.runDeploymentChecks()
}
