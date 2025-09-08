/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Suppress circular dependency warnings from fhEVM relayer SDK
    config.ignoreWarnings = [
      /Circular dependency between chunks/,
      /Circular dependency between chunks with runtime/,
    ];
    return config;
  },
}

module.exports = nextConfig
