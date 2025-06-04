interface OGMetaProps {
  title: string
  description?: string
  url?: string
  image?: string
  type?: string
}

export function generateOGMeta({
  title,
  description = "Voice your thoughts in seconds with Audioform",
  url,
  image = "/images/audioform-og.png",
  type = "website",
}: OGMetaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voxera.vercel.app"
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Audioform",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImageUrl],
    },
  }
}

export function generateSurveyOGMeta(surveyTitle: string, surveyId: string) {
  return generateOGMeta({
    title: `${surveyTitle} | Audioform`,
    description: `Share your voice on: "${surveyTitle}". Quick audio responses in seconds.`,
    url: `/s/${surveyId}`,
  })
}
