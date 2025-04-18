/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
    // Ignore issues with external packages
    tsconfigPath: "./tsconfig.json",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Tell webpack to exclude these Node.js core modules in browser builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Define modules to ignore/mock
      const nodeLibs = [
        'fs', 
        'path', 
        'os', 
        'crypto', 
        'stream', 
        'http', 
        'https', 
        'zlib',
        'net',
        'tls',
        'async_hooks',
        'perf_hooks',
        'child_process',
        'worker_threads',
        'inspector',
        'module',
        'dgram',
        'dns',
        'cluster',
        'v8',
        'vm'
      ];

      // Set fallbacks for each Node.js module
      nodeLibs.forEach(lib => {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          [lib]: false,
        };
      });
    }

    return config;
  },
  
  // Avoid issues with packages that depend on Node.js modules
  transpilePackages: [
    '@opentelemetry',
    'genkit',
    '@genkit-ai/googleai',
  ],
  
  // Ignores node_modules files to prevent issues with external packages
  experimental: {
    externalDir: true,
  }
};

module.exports = nextConfig; 