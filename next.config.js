/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  
  // Optimierung für mobile Geräte
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Bilder-Optimierung
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/character/**',
      },
    ],
  },
  
  // API Proxy während Development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
}

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.PWA_DISABLE === 'true',
  runtimeCaching: [
    {
      urlPattern: /^\/(_next|static|images|audio|Characters|websiteBaseImages)\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/(kategorien|eintraege)\/.*\.json$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'json-data',
        expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'start-url',
        expiration: { maxEntries: 1, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/favicon\.ico$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'favicon',
        expiration: { maxEntries: 1, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/manifest\.json$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'manifest',
        expiration: { maxEntries: 1, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // Add more rules as needed
  ],
});

module.exports = withPWA({
  // ...your existing Next.js config
}); 