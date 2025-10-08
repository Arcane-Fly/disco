/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Disable automatic CSP nonce generation to prevent 'unsafe-inline' blocking
  generateEtags: false,
  experimental: {
    esmExternals: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  serverExternalPackages: ['sharp'],
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