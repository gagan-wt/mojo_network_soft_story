// The structure of the video data coming from your API
export interface ApiVideo {
  id: number
  story_title: string
  story_description: string
  slug: string
  generated_story_url: string
  // ... other fields from your API if needed
}

// The structure of the video data used by our components
export interface Video {
  id: string // Using slug for unique ID in the app
  title: string
  description: string
  slug: string
  src: string
  reporterName: string
  channelName: string
  domain: string
}
