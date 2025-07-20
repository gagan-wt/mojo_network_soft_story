/** @type {import('next').NextConfig} */
const nextConfig = {
   basePath: "/soft-stories",
  assetPrefix: "/soft-stories",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
