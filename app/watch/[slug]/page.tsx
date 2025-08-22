export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { VideoFeed } from "../components/video-feed"
import type { ApiVideo, Video } from "../types"

// This function fetches all videos to tell Next.js which pages to pre-build.
// It sends a POST request without a specific slug to get all items.
export async function generateStaticParams() {
  try {
    const formData = new FormData()
    formData.append("page_no", "0")
    formData.append("domain_name", "test")
    formData.append("slug", "test-story-2")

    const res = await fetch(`${process.env.API_URL}/softStoryWatch`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch slugs: ${res.statusText}`)
    }

    const { data }: { data: ApiVideo[] } = await res.json()

    if (!Array.isArray(data)) {
      console.error("API did not return an array for generateStaticParams")
      return []
    }

    return data.map((video) => ({
      slug: video.slug,
    }))
  } catch (error) {
    console.error("Failed to generate static params:", error)
    return []
  }
}

function getDomainName(mode: "subdomain" | "full" = "subdomain"): string {
  const headersList = headers()
  const host = headersList.get("host") || ""

  const IS_LOCAL = host.startsWith("localhost") || host.startsWith("127.0.0.1")
  const SAAS_MAIN_DOMAIN = "mojonetwork.in"

  if (IS_LOCAL) {
    return mode === "full" ? host : "test"
  }

  if (mode === "full") {
    return host // Always return entire host as it is
  }

  // MODE: 'subdomain'
  if (host.endsWith(SAAS_MAIN_DOMAIN)) {
    return host.replace(`.${SAAS_MAIN_DOMAIN}`, "") // return subdomain
  }

  return host.replace(/^www\./, "") // returns sagar.com (as domain identifier)
}

async function getVideos(slug: string, domainName: string): Promise<Video[]> {
  try {
    const fullDomain = getDomainName("full")
    const formData = new FormData()
    formData.append("page_no", "0")
    formData.append("domain_name", domainName)
    formData.append("slug", slug)

    const res = await fetch(`${process.env.API_URL}/softStoryWatch`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch videos: ${res.statusText}`)
    }

    const { data }: { data: ApiVideo[] } = await res.json()

    if (!Array.isArray(data)) {
      console.error("API did not return an array of videos")
      return []
    }

    return data.map((apiVideo) => ({
      id: apiVideo.slug,
      title: apiVideo.story_title,
      description: apiVideo.story_description,
      slug: apiVideo.slug,
      src: apiVideo.generated_story_url,
      reporterName: apiVideo.reporter_name,
      channelName: apiVideo.channel_name,
      domain: fullDomain,
    }))
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    return []
  }
}

export default async function SoftStoryPage({ params }: { params: { slug: string } }) {
  const domainName = await getDomainName('subdomain');
  const getFullDomainName = await getDomainName('full');
  const videos = await getVideos(params.slug, domainName);

  if (!videos.length) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center px-4">
          <h2 className="text-2xl font-semibold">Story Unavailable</h2>
          <p className="text-neutral-400 mt-2">The requested story isn't available at the moment.</p>
          <p className="text-neutral-500 mt-4">{getFullDomainName}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <VideoFeed videos={videos} initialSlug={params.slug} domainName={domainName} />
    </main>
  )
}
