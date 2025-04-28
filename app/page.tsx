import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Users, Zap, Mic } from "lucide-react"
import { Header } from "@/components/layout/header"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Voice-First Surveys</h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Create text questions. Get voice answers. Unlock insights from the human voice.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See a Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Mic className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Create Surveys</h4>
                <p className="text-gray-600">Design text-based questions that prompt thoughtful voice responses.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg border">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Collect Responses</h4>
                <p className="text-gray-600">Respondents record audio answers, capturing tone, emotion, and nuance.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-lg border">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Analyze Insights</h4>
                <p className="text-gray-600">Unlock deeper understanding with transcription and sentiment analysis.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg border shadow-sm flex flex-col">
                <h4 className="text-2xl font-bold mb-2">Free</h4>
                <p className="text-gray-600 mb-6">Perfect for individuals and small projects</p>
                <div className="text-3xl font-bold mb-6">$0</div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Up to 5 questions per survey
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Voice recording & playback
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Responder email capture
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Shareable survey links
                  </li>
                </ul>
                <Link href="/signup" className="mt-auto">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg border shadow-sm flex flex-col relative">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
                <h4 className="text-2xl font-bold mb-2">Pro</h4>
                <p className="text-gray-600 mb-6">For professionals and growing teams</p>
                <div className="text-3xl font-bold mb-6">
                  $29<span className="text-lg font-normal">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Unlimited questions
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Transcription
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Sentiment analysis
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Custom branding
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Team seats
                  </li>
                </ul>
                <Link href="/signup?plan=pro" className="mt-auto">
                  <Button className="w-full">Choose Pro</Button>
                </Link>
              </div>

              <div className="bg-white p-8 rounded-lg border shadow-sm flex flex-col">
                <h4 className="text-2xl font-bold mb-2">Enterprise</h4>
                <p className="text-gray-600 mb-6">For organizations with advanced needs</p>
                <div className="text-3xl font-bold mb-6">Custom</div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Live-Board Event Mode
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    QR-Code Generation
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Real-Time Dashboard
                  </li>
                  <li className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    SSO + RBAC
                  </li>
                </ul>
                <Link href="/contact-sales" className="mt-auto">
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-6">Join the EchoBoard Community</h3>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Participate in public audio Q&A forums. Ask questions, provide answers, and earn recognition.
            </p>
            <Link href="/echoboard">
              <Button size="lg">Explore EchoBoard</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mic className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-bold">Audioform</h3>
              </div>
              <p className="text-gray-400">Voice-first surveys for deeper insights.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/echoboard" className="text-gray-400 hover:text-white">
                    EchoBoard
                  </Link>
                </li>
                <li>
                  <Link href="/enterprise" className="text-gray-400 hover:text-white">
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-400 hover:text-white">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-gray-400 hover:text-white">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Audioform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
