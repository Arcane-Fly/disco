#!/bin/bash

# Railway Deployment Verification Test
# This script simulates the exact Railway deployment process locally

set -e

echo "🔧 Railway Deployment Verification Test"
echo "======================================="

# Clean start
echo "📦 Cleaning previous builds..."
rm -rf node_modules dist

# Step 1: Enable corepack and prepare yarn
echo "🔄 Setting up Yarn 4.9.2 via corepack..."
corepack enable
corepack prepare yarn@4.9.2 --activate

# Verify yarn version
YARN_VERSION=$(yarn --version)
echo "✅ Yarn version: $YARN_VERSION"

if [ "$YARN_VERSION" != "4.9.2" ]; then
    echo "❌ FAIL: Expected Yarn 4.9.2, got $YARN_VERSION"
    exit 1
fi

# Step 2: Install dependencies with immutable flag (Railway install command)
echo "📦 Installing dependencies (Railway install command)..."
yarn install --immutable

# Step 3: Build server and frontend (Railway build command)
echo "🔨 Building server..."
yarn build:server

echo "🔨 Building Next.js frontend..."
yarn build:next

# Step 4: Verify artifacts
echo "🔍 Verifying build artifacts..."
if [ ! -f "dist/server.js" ]; then
    echo "❌ FAIL: dist/server.js not found"
    exit 1
fi

if [ ! -d "frontend/.next" ]; then
    echo "❌ FAIL: frontend/.next not found"
    exit 1
fi

# Step 5: Check TypeScript version alignment
echo "🔍 Verifying TypeScript version alignment..."
if yarn info typescript version | grep -q "5.9.2"; then
    echo "✅ TypeScript version correctly resolved"
else
    echo "❌ FAIL: TypeScript version mismatch"
    exit 1
fi

# Step 6: Check lockfile alignment
echo "🔍 Verifying lockfile alignment..."
if grep -q "typescript@npm:\^5.3.3" yarn.lock; then
    echo "✅ Lockfile correctly shows typescript@^5.3.3"
else
    echo "❌ FAIL: Lockfile still shows incorrect TypeScript version"
    exit 1
fi

echo ""
echo "🎉 SUCCESS: Railway deployment verification passed!"
echo "🚀 All systems are ready for Railway deployment"
echo ""
echo "Summary:"
echo "- ✅ Yarn 4.9.2 activated via corepack"
echo "- ✅ Immutable install succeeded without lockfile errors"
echo "- ✅ Server build completed (dist/server.js)"
echo "- ✅ Frontend build completed (frontend/.next)"
echo "- ✅ TypeScript version alignment verified"
echo "- ✅ Lockfile synchronization confirmed"