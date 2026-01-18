/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {},
  },
  images: {
    domains: ['localhost', 'www.kayauto.ca', 'kayauto.ca'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.kayauto.ca',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kayauto.ca',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Font optimization
  optimizeFonts: true,
  // Server components external packages
  serverComponentsExternalPackages: ['jsonwebtoken', 'bcryptjs', 'pg', 'typeorm'],
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        net: false,
        tls: false,
      }
      
      // Exclude jsonwebtoken and Node.js modules from client bundle
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('jsonwebtoken', 'bcryptjs', 'pg', 'typeorm')
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals
        config.externals = [
          ...(Array.isArray(originalExternals) ? originalExternals : []),
          'jsonwebtoken',
          'bcryptjs',
          'pg',
          'typeorm',
        ]
      } else {
        config.externals = {
          ...config.externals,
          jsonwebtoken: 'commonjs jsonwebtoken',
          bcryptjs: 'commonjs bcryptjs',
          pg: 'commonjs pg',
          typeorm: 'commonjs typeorm',
        }
      }
    }
    return config
  },
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig