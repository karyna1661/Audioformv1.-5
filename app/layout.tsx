import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/contexts/analytics-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audioform - Voice-first surveys",
  description: "Create text questions. Get voice answers. Unlock insights from the human voice.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Suspense>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
