/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  // Safe dev settings to prevent 404s for _next/static assets
  reactStrictMode: true,
  experimental: {
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
  webpack: (config, { isServer }) => {
    // Suppress circular dependency warnings from fhEVM relayer SDK
    config.ignoreWarnings = [
      /Circular dependency between chunks/,
      /Circular dependency between chunks with runtime/,
    ];
    
    // Add polyfills for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        global: require.resolve('global'),
      };
      
      // Provide global and self polyfills
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          global: 'globalThis',
          self: 'globalThis',
        })
      );
    }
    
    return config;
  },
}

module.exports = nextConfig
