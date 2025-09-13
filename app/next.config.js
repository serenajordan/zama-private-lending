/** @type {import('next').NextConfig} */
const nextConfig = {
  // Safe dev settings to prevent 404s for _next/static assets
  reactStrictMode: true,
  experimental: {
    appDir: true,
    webpackBuildWorker: true,
  },
  // Ensure these are unset for proper dev asset serving
  basePath: '', // unset
  assetPrefix: undefined, // unset - was causing 404s for _next/static/*
  output: undefined, // do NOT use 'export' in dev
  distDir: '.next',
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
