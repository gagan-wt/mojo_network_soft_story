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

// This function fetches the video data for the page.
// It sends the current slug to your API.
async function getVideos(slug: string): Promise<Video[]> {
  try {
    const formData = new FormData()
    formData.append("page_no", "0")
    formData.append("domain_name", "test")
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

    // Map the API data to the format our components expect
    return data.map((apiVideo) => ({
      id: apiVideo.slug, // Use slug as the primary ID for components
      title: apiVideo.story_title,
      description: apiVideo.story_description,
      slug: apiVideo.slug,
      src: apiVideo.generated_story_url,
      reporterName: "Sagar Thakur",
      channelName: "Parso Tak",
      domain: "parsotak.com",
    }))
  } catch (error) {
    console.error("Failed to fetch videos:", error)
    return []
  }
}

export default async function SoftStoryPage({ params }: { params: { slug: string } }) {
  const videos = await getVideos(params.slug)

  if (!videos.length) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Failed to Load Story</h2>
          <p className="text-neutral-400">Could not fetch video data for slug: {params.slug}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900">
      <VideoFeed videos={videos} initialSlug={params.slug} />
    </main>
  )
}
