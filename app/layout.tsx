import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AnalyticsProvider } from "@/contexts/analytics-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audioform - Voice Survey Platform",
  description: "Create engaging voice surveys and collect authentic audio responses",
  keywords: ["voice survey", "audio feedback", "survey platform", "voice responses"],
  authors: [{ name: "Audioform Team" }],
  openGraph: {
    title: "Audioform - Voice Survey Platform",
    description: "Create engaging voice surveys and collect authentic audio responses",
    url: "https://voxera.vercel.app",
    siteName: "Audioform",
    images: [
      {
        url: "/images/audioform-og.png",
        width: 1200,
        height: 630,
        alt: "Audioform - Voice Survey Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audioform - Voice Survey Platform",
    description: "Create engaging voice surveys and collect authentic audio responses",
    images: ["/images/audioform-og.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsProvider>
          <Suspense>{children}</Suspense>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "white",
                border: "1px solid #e5e7eb",
                color: "#374151",
              },
            }}
          />
        </AnalyticsProvider>
      </body>
    </html>
  )
}
