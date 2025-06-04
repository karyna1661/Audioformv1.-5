"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Users, Share, Zap, ArrowRight, Play } from "lucide-react"
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
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Audioform</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="outline" className="hidden sm:flex">
                  Try Demo
                </Button>
              </Link>
              <Link href="/demo">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border mb-8">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">24-Hour Free Demo</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Voice Surveys That
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Actually Engage
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create authentic voice surveys in seconds. Collect genuine audio responses that reveal insights text never
              could.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/demo">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Create Your First Survey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Demo Preview */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border p-8">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium">Interactive Demo Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Why Voice Surveys Work Better</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Audio responses capture emotion, tone, and nuance that text simply can't convey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Authentic Responses</h3>
                <p className="text-gray-600 leading-relaxed">
                  Capture genuine emotions and spontaneous thoughts that written surveys miss.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create and share surveys in under 60 seconds. No complex setup required.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Share className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Easy Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share via link, QR code, or social media. Works on any device with a microphone.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Higher Engagement</h3>
                <p className="text-gray-600 leading-relaxed">
                  Voice surveys get 3x more responses than traditional text-based forms.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Real-time Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get immediate feedback and analyze responses as they come in.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mic className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Mobile Optimized</h3>
                <p className="text-gray-600 leading-relaxed">
                  Perfect for mobile users. Record and submit responses in seconds.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Hear What Your Audience Really Thinks?</h2>
              <p className="text-xl mb-8 opacity-90">
                Start collecting authentic voice responses today. No signup required for the 24-hour demo.
              </p>
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold">
                  <Mic className="mr-2 h-5 w-5" />
                  Try Audioform Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Audioform</span>
            </div>
            <p className="text-gray-600 text-sm">© 2024 Audioform. Built for authentic conversations.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
