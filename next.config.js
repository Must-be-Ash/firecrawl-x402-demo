/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Add image domains here if needed for search result thumbnails
    ],
  },
  allowedDevOrigins: ['*'],
}

module.exports = nextConfig
