#!/bin/bash

echo "🚀 Setting up Zama Private Lending Protocol..."
echo "================================================"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ pnpm version: $(pnpm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Set up environment files
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f "contracts/.env" ]; then
    echo "📝 Creating contracts/.env from template..."
    cp contracts/env.example contracts/.env
    echo "⚠️  Please edit contracts/.env with your private key and RPC URL"
else
    echo "✅ contracts/.env already exists"
fi

if [ ! -f "app/.env.local" ]; then
    echo "📝 Creating app/.env.local from template..."
    cp app/env.local.example app/.env.local
    echo "⚠️  Please edit app/.env.local with deployed contract addresses"
else
    echo "✅ app/.env.local already exists"
fi

# Build contracts
echo ""
echo "🔨 Building smart contracts..."
cd contracts
pnpm build
cd ..

# Build app
echo ""
echo "🌐 Building Next.js app..."
cd app
pnpm build
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit contracts/.env with your private key and Sepolia RPC URL"
echo "2. Deploy contracts: pnpm deploy:sepolia"
echo "3. Update app/.env.local with deployed contract addresses"
echo "4. Start development: pnpm dev"
echo ""
echo "🔗 Useful commands:"
echo "  pnpm dev          - Start development server"
echo "  pnpm test         - Run contract tests"
echo "  pnpm deploy:sepolia - Deploy to Sepolia testnet"
echo ""
echo "📚 Documentation: https://docs.zama.ai/fhevm/"
