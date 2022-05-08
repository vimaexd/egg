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

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = nextConfig

const sentryWebpackPluginOptions = {
  silent: true,
  
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);