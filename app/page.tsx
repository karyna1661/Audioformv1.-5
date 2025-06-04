"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Users, Share, Zap, ArrowRight, Play, BarChart, Clock } from "lucide-react"
import Link from "next/link"
import Head from "next/head"

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Audioform - Voice Survey Platform</title>
        <meta
          name="description"
          content="Create engaging voice surveys and collect authentic audio responses. Perfect for feedback, research, and community engagement."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">Audioform</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/demo">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Try Demo
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-12 sm:py-16 lg:py-20 text-center sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full border mb-6 sm:mb-8">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700">24-Hour Free Demo</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Voice Surveys That
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Actually Engage
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Create authentic voice surveys in seconds. Collect genuine audio responses that reveal insights text never
              could.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Create Your First Survey</span>
                  <span className="sm:hidden">Create Survey</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Demo Preview - Mobile Optimized */}
            <div className="relative max-w-4xl mx-auto px-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border p-4 sm:p-8">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">Interactive Demo Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Fixed Desktop Grid */}
        <section className="px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Why Voice Surveys Work Better
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                Audio responses capture emotion, tone, and nuance that text simply can't convey.
              </p>
            </div>

            {/* Fixed Grid Layout - 6 boxes in 2 rows of 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* First Row */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Authentic Responses</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Capture genuine emotions and spontaneous thoughts that written surveys miss.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Lightning Fast</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Create and share surveys in under 60 seconds. No complex setup required.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Share className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Easy Sharing</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Share via link, QR code, or social media. Works on any device with a microphone.
                  </p>
                </CardContent>
              </Card>

              {/* Second Row */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Higher Engagement</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Voice surveys get 3x more responses than traditional text-based forms.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Real-time Insights</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Get immediate feedback and analyze responses as they come in.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardContent className="p-6 sm:p-8 text-center h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Mobile Optimized</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">
                    Perfect for mobile users. Record and submit responses in seconds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Hear What Your Audience Really Thinks?
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 px-2">
                Start collecting authentic voice responses today. No signup required for the 24-hour demo.
              </p>
              <div className="flex justify-center">
                <Link href="/demo">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold"
                  >
                    <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Try Audioform Free
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-8 sm:py-12 border-t border-gray-200 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-gray-900">Audioform</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                © 2024 Audioform. Built for authentic conversations.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
