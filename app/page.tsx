"use client"

import { ThemedButton } from "@/components/ui/themed-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, ArrowRight, Play, Users, Clock, MessageSquare, Share2, Sparkles } from "lucide-react"
import Link from "next/link"
import { theme } from "@/lib/theme/colors"

// Custom Microphone with Waveform Icon Component
function MicrophoneWaveIcon({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Mic className="h-6 w-6 text-white relative z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex space-x-0.5 opacity-60">
          <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
          <div className="w-0.5 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }}></div>
          <div className="w-0.5 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 ${theme.primary.gradient} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}
            >
              <MicrophoneWaveIcon />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Audioform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/demo">
              <ThemedButton variant="outline" size="sm">
                Try Demo
              </ThemedButton>
            </Link>
            <Link href="/demo">
              <ThemedButton size="sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </ThemedButton>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 sm:py-20 lg:py-24 text-center sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-200 mb-8 shadow-sm">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Free Demo - No Signup Required</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Voice Surveys That
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Actually Engage
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create authentic voice surveys in minutes. Collect genuine audio responses that reveal insights text never
            could capture.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/demo">
              <ThemedButton size="lg" className="w-full sm:w-auto min-w-[200px]">
                <MicrophoneWaveIcon className="mr-2 h-5 w-5" />
                Create Survey
                <ArrowRight className="ml-2 h-5 w-5" />
              </ThemedButton>
            </Link>

            <ThemedButton variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </ThemedButton>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-indigo-100 p-8">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`w-20 h-20 ${theme.primary.gradient} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg relative overflow-hidden`}
                  >
                    <MicrophoneWaveIcon className="h-10 w-10" />
                  </div>
                  <p className="text-lg text-gray-700 font-medium">Interactive Voice Survey Experience</p>
                  <p className="text-sm text-gray-500 mt-2">Real-time audio collection and response tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Why Voice Surveys Work Better</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Audio responses capture emotion, tone, and nuance that text simply can't convey. Get authentic insights
              from your audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-12 h-12 ${theme.primary.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md`}
                >
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Voice-First Experience</CardTitle>
                <CardDescription className="text-gray-600">
                  Collect authentic audio responses that capture real emotions and thoughts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Natural conversational feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Capture tone and emotion
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Higher engagement rates
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-12 h-12 ${theme.secondary.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md`}
                >
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Easy Sharing</CardTitle>
                <CardDescription className="text-gray-600">
                  Share surveys instantly via Farcaster, QR codes, or direct links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    Farcaster integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    QR code generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    One-click sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-12 h-12 ${theme.primary.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md`}
                >
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Quick Setup</CardTitle>
                <CardDescription className="text-gray-600">
                  Create and deploy professional surveys in minutes, not hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Intuitive interface
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Real-time analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Instant deployment
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                5x
              </div>
              <div className="text-sm text-gray-600 font-medium">Higher Engagement</div>
              <div className="text-xs text-gray-500">vs. traditional text surveys</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                2 min
              </div>
              <div className="text-sm text-gray-600 font-medium">Average Setup Time</div>
              <div className="text-xs text-gray-500">from idea to deployment</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-gray-600 font-medium">Authentic Responses</div>
              <div className="text-xs text-gray-500">capture real emotions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Improved Button Visibility */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className={`${theme.primary.gradient} border-0 shadow-2xl text-white relative overflow-hidden`}>
            {/* Background pattern for visual interest */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            <CardContent className="p-12 relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Hear What Your Audience Really Thinks?</h2>
              <p className="text-xl mb-8 opacity-90">
                Start collecting authentic voice responses today. Create your first survey in under 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  {/* Improved button with better contrast against indigo background */}
                  <button className="bg-white text-indigo-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] flex items-center justify-center gap-2 text-lg">
                    <MicrophoneWaveIcon className="h-5 w-5 text-indigo-600" />
                    Start Free Demo
                    <ArrowRight className="h-5 w-5 text-indigo-600" />
                  </button>
                </Link>
                <button className="border-2 border-white text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-lg transition-all duration-200 min-w-[200px] flex items-center justify-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  View Examples
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-indigo-100 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 ${theme.primary.gradient} rounded-lg flex items-center justify-center shadow-md relative overflow-hidden`}
              >
                <MicrophoneWaveIcon className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Audioform
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © 2025 Audioform. Built for authentic conversations and genuine insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
