export interface OGMetaProps {
  title: string
  description: string
  url: string
  image?: string
  type?: "website" | "article"
  siteName?: string
}

export function generateOGMeta({
  title,
  description,
  url,
  image,
  type = "website",
  siteName = "Audioform",
}: OGMetaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`
  const defaultImage = `${baseUrl}/images/audioform-logo.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName,
      type,
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || defaultImage],
    },
  }
}

export function generateSurveyOGMeta(surveyTitle: string, surveyId: string) {
  return generateOGMeta({
    title: `${surveyTitle} - Voice Survey`,
    description: "Share your thoughts with a quick voice response. Your voice matters!",
    url: `/respond/${surveyId}`,
    type: "article",
  })
}
