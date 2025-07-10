/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimierung für mobile Geräte
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  
  // Bilder-Optimierung
  images: {
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

module.exports = nextConfig; 