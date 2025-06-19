/**
 * Production Testing Script
 * Automated testing for production deployment
 */

interface TestResult {
  name: string
  status: "pass" | "fail" | "skip"
  message: string
  duration: number
  details?: any
}

class ProductionTester {
  private results: TestResult[] = []
  private baseUrl = "https://voxera.vercel.app"

  async runAllTests() {
    console.log("🧪 Starting Production Tests...\n")

    await this.testHomePage()
    await this.testSurveyCreation()
    await this.testResponseUrls()
    await this.testApiEndpoints()
    await this.testSystemHealth()
    await this.testMobileResponsiveness()

    this.printResults()
    return this.results
  }

  private async runTest(name: string, testFn: () => Promise<void>) {
    const startTime = Date.now()

    try {
      await testFn()
      const duration = Date.now() - startTime

      this.results.push({
        name,
        status: "pass",
        message: "Test passed successfully",
        duration,
      })

      console.log(`✅ ${name} - PASSED (${duration}ms)`)
    } catch (error) {
      const duration = Date.now() - startTime

      this.results.push({
        name,
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
        duration,
        details: error,
      })

      console.log(`❌ ${name} - FAILED (${duration}ms): ${error}`)
    }
  }

  private async testHomePage() {
    await this.runTest("Home Page Load", async () => {
      const response = await fetch(this.baseUrl)

      if (!response.ok) {
        throw new Error(`Home page returned ${response.status}`)
      }

      const html = await response.text()

      if (!html.includes("Audioform") && !html.includes("Survey")) {
        throw new Error("Home page content appears incorrect")
      }
    })
  }

  private async testSurveyCreation() {
    await this.runTest("Survey Creation Page", async () => {
      const response = await fetch(`${this.baseUrl}/surveys/new`)

      if (!response.ok) {
        throw new Error(`Survey creation page returned ${response.status}`)
      }
    })
  }

  private async testResponseUrls() {
    await this.runTest("Response URL Format", async () => {
      // Test with a valid UUID format
      const testId = "550e8400-e29b-41d4-a716-446655440000"
      const responseUrl = `${this.baseUrl}/respond/${testId}`

      const response = await fetch(responseUrl)

      // Should not be 404 - might be survey not found, but page should load
      if (response.status === 404) {
        throw new Error("Response URL returns 404 - routing issue")
      }

      // Status 200 or survey-specific error is acceptable
      if (response.status !== 200 && response.status !== 400) {
        console.warn(`Response URL returned ${response.status} - may be expected for non-existent survey`)
      }
    })
  }

  private async testApiEndpoints() {
    await this.runTest("API Endpoints", async () => {
      const endpoints = ["/api/surveys", "/api/responses"]

      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`)

        // API endpoints might return 405 (Method Not Allowed) for GET requests
        // This is acceptable as it means the endpoint exists
        if (response.status === 404) {
          throw new Error(`API endpoint ${endpoint} not found`)
        }
      }
    })
  }

  private async testSystemHealth() {
    await this.runTest("System Health Check", async () => {
      const response = await fetch(`${this.baseUrl}/system-health`)

      if (!response.ok) {
        throw new Error(`System health page returned ${response.status}`)
      }
    })
  }

  private async testMobileResponsiveness() {
    await this.runTest("Mobile Responsiveness", async () => {
      // Test with mobile user agent
      const response = await fetch(this.baseUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15",
        },
      })

      if (!response.ok) {
        throw new Error(`Mobile request returned ${response.status}`)
      }

      const html = await response.text()

      // Check for responsive meta tag
      if (!html.includes("viewport")) {
        throw new Error("Missing viewport meta tag for mobile responsiveness")
      }
    })
  }

  private printResults() {
    console.log("\n📊 PRODUCTION TEST RESULTS")
    console.log("===========================")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "pass").length,
      failed: this.results.filter((r) => r.status === "fail").length,
      skipped: this.results.filter((r) => r.status === "skip").length,
    }

    console.log(`✅ Passed: ${summary.passed}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⏭️  Skipped: ${summary.skipped}`)
    console.log(`📊 Total: ${summary.total}`)

    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length
    console.log(`⏱️  Average Duration: ${Math.round(avgDuration)}ms`)

    if (summary.failed === 0) {
      console.log("\n🎉 ALL PRODUCTION TESTS PASSED!")
      console.log("Deployment is ready for users.")
    } else {
      console.log("\n🚨 SOME TESTS FAILED!")
      console.log("Please address failures before going live.")

      console.log("\nFailed Tests:")
      this.results
        .filter((r) => r.status === "fail")
        .forEach((r) => {
          console.log(`❌ ${r.name}: ${r.message}`)
        })
    }
  }
}

// Export for use
export { ProductionTester }

// Run if called directly
if (require.main === module) {
  const tester = new ProductionTester()
  tester.runAllTests()
}
