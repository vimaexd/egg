/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com']
  },
  experimental: {
    outputStandalone: true
  }
}

module.exports = nextConfig
