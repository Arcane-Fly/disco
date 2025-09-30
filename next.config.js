/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  // Disable automatic CSP nonce generation to prevent 'unsafe-inline' blocking
  generateEtags: false,
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
  
  // Enhanced headers for WebContainer and Railway deployment (2025 best practices)
  async headers() {
    // Disable CSP in development to prevent nonce conflicts with inline styles
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            // Development-only WebContainer headers
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'credentialless',
            },
            {
              key: 'Cross-Origin-Opener-Policy', 
              value: 'same-origin',
            },
          ],
        },
      ];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Critical WebContainer headers for SharedArrayBuffer support (2025 Railway optimized)
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Enhanced security for computer-use activities
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.skypack.dev https://*.webcontainer.io https://stackblitz.com", // WebContainer compatibility
              "style-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com", // Allow inline styles for Next.js components and Tailwind
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' blob: data: https: https://avatars.githubusercontent.com https://cdn.jsdelivr.net", // Added jsdelivr for icons
              "connect-src 'self' wss: ws: https://webcontainer.io https://*.webcontainer.io https://*.stackblitz.com https://api.stackblitz.com",
              "frame-ancestors 'self' https://chat.openai.com https://chatgpt.com https://claude.ai",
              "worker-src 'self' blob: https://*.webcontainer.io data:",
              "child-src 'self' blob: https://*.webcontainer.io data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          // Railway deployment optimization headers
          {
            key: 'X-Railway-Deployment',
            value: 'webcontainer-enabled',
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
          // Performance optimization headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Specific headers for WebContainer pages
      {
        source: '/webcontainer-loader',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      // Specific headers for workflow builder (computer-use activities)
      {
        source: '/workflow-builder',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;