/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cdn.discordapp.com']
  },
  async redirects() {
    return [
      {
        source: '/givemeyourmoney',
        destination: 'https://www.youtube.com/watch?v=SdH13BXdNqI',
        permanent: true
      }
    ]
  }
}

module.exports = nextConfig
