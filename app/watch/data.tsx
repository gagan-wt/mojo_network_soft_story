import type { Video } from "./types"

// Dummy data for soft stories
// Replace this with actual data fetching from your API

export const videos: Video[] = [
  {
    id: "1",
    title: "Breaking News: Local Bakery Wins National Award",
    description:
      "The Sweet Success Bakery in downtown Anytown has just been awarded the 'Best Bakery in the Nation' title at the annual National Baking Convention. This is a huge win for our local community!",
    slug: "local-bakery-wins-national-award",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dummy-3iViL3sn5O18J6UlOUlPOyI27diB4s.mp4",
    reporterName: "Jane Doe",
    channelName: "Anytown News",
    domain: "anytownnews.com",
  },
  {
    id: "2",
    title: "City Council Approves New Park Development",
    description:
      "In a unanimous vote, the Anytown City Council has approved the development of a new community park on the city's west side. The park will feature walking trails, a playground, and a community garden.",
    slug: "city-council-approves-new-park-development",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dummy-3iViL3sn5O18J6UlOUlPOyI27diB4s.mp4",
    reporterName: "John Smith",
    channelName: "Local Today",
    domain: "localtoday.net",
  },
  {
    id: "3",
    title: "High School Robotics Team Advances to State Championship",
    description:
      "The Anytown High School Robotics Team, the 'Techno Titans,' are heading to the State Championship after winning the regional competition. The team has been working tirelessly all year to design and build their robot.",
    slug: "high-school-robotics-team-advances-to-state-championship",
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dummy-3iViL3sn5O18J6UlOUlPOyI27diB4s.mp4",
    reporterName: "Emily White",
    channelName: "School News Network",
    domain: "schoolnewsnetwork.org",
  },
]
