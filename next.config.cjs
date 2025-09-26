/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['sharp'],
  },
  // Fix image optimization for Railway deployment
  images: {
    domains: ['avatars.githubusercontent.com'],
    unoptimized: true, // Disable optimization for Railway
  },
  webpack: (config, { isServer }) => {
    // Fix for the "module is not defined in ES module scope" error
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle CSS modules in ES module context
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };
    }

    return config;
  },
  // Output configuration for proper ES module handling
  output: 'standalone',
  // Enhanced CSP headers for Railway deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com", // Allow inline for WebContainer compatibility
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles for components  
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' blob: data: https: https://avatars.githubusercontent.com", // Explicitly allow GitHub avatars
              "connect-src 'self' wss: ws: https://webcontainer.io",
              "frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;