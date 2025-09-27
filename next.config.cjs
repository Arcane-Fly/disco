/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['sharp'],
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Image optimization for Railway deployment
  images: {
    domains: ['avatars.githubusercontent.com'],
    unoptimized: true, // Disable optimization for Railway
    formats: ['image/avif', 'image/webp'],
  },
  // Compression and optimization
  compress: true,
  
  webpack: (config, { isServer, dev }) => {
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

    // Bundle optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
          ui: {
            name: 'ui',
            test: /[\\/]components[\\/]ui[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Tree shaking optimization
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },
  
  // Output configuration for proper ES module handling
  output: 'standalone',
  
  // Enhanced headers for WebContainer and Railway deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Critical WebContainer headers for SharedArrayBuffer support
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.skypack.dev https://*.webcontainer.io", // WebContainer compatibility
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles for components  
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' blob: data: https: https://avatars.githubusercontent.com", // Explicitly allow GitHub avatars
              "connect-src 'self' wss: ws: https://webcontainer.io https://*.webcontainer.io https://*.stackblitz.com",
              "frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai",
              "worker-src 'self' blob: https://*.webcontainer.io",
              "child-src 'self' blob: https://*.webcontainer.io",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;