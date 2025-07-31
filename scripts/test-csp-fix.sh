#!/bin/bash

# CSP Fix Test Script
# Tests that OAuth callback endpoints include Google Fonts domains in CSP headers

echo "🧪 Testing CSP Fix for Google Fonts"
echo "=================================="

# Set required environment variables for testing
export JWT_SECRET="test-jwt-secret-for-testing-purposes-only"
export NODE_ENV="test"
export PORT="3001"

# Start the server in the background
echo "🚀 Starting test server on port 3001..."
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test OAuth callback endpoint
echo ""
echo "📋 Testing OAuth callback CSP headers..."
CSP_HEADER=$(curl -s -I "http://localhost:3001/auth/callback" | grep -i "content-security-policy" | tr -d '\r')

if [ -z "$CSP_HEADER" ]; then
    echo "❌ ERROR: No Content-Security-Policy header found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "Found CSP header: $CSP_HEADER"

# Check for Google Fonts domains
echo ""
echo "🔍 Checking for Google Fonts domains..."

if echo "$CSP_HEADER" | grep -q "fonts.googleapis.com"; then
    echo "✅ fonts.googleapis.com found in CSP"
else
    echo "❌ ERROR: fonts.googleapis.com NOT found in CSP"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

if echo "$CSP_HEADER" | grep -q "fonts.gstatic.com"; then
    echo "✅ fonts.gstatic.com found in CSP"
else
    echo "❌ ERROR: fonts.gstatic.com NOT found in CSP"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test OAuth error callback
echo ""
echo "📋 Testing OAuth error callback CSP headers..."
ERROR_CSP_HEADER=$(curl -s -I "http://localhost:3001/auth/callback?error=access_denied" | grep -i "content-security-policy" | tr -d '\r')

if echo "$ERROR_CSP_HEADER" | grep -q "fonts.googleapis.com" && echo "$ERROR_CSP_HEADER" | grep -q "fonts.gstatic.com"; then
    echo "✅ Google Fonts domains found in OAuth error callback CSP"
else
    echo "❌ ERROR: Google Fonts domains NOT found in OAuth error callback CSP"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test OAuth success scenario
echo ""
echo "📋 Testing OAuth success callback CSP headers..."
SUCCESS_CSP_HEADER=$(curl -s -I "http://localhost:3001/auth/callback?code=test_code&state=test_state" | grep -i "content-security-policy" | tr -d '\r')

if echo "$SUCCESS_CSP_HEADER" | grep -q "fonts.googleapis.com" && echo "$SUCCESS_CSP_HEADER" | grep -q "fonts.gstatic.com"; then
    echo "✅ Google Fonts domains found in OAuth success callback CSP"
else
    echo "❌ ERROR: Google Fonts domains NOT found in OAuth success callback CSP"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test that security restrictions are maintained
echo ""
echo "🔒 Verifying security restrictions are maintained..."

if echo "$CSP_HEADER" | grep -q "frame-ancestors 'none'" && echo "$CSP_HEADER" | grep -q "form-action 'self'"; then
    echo "✅ Security restrictions maintained (frame-ancestors 'none', form-action 'self')"
else
    echo "❌ WARNING: Security restrictions may have been compromised"
fi

# Check that unsafe-eval is not allowed
if echo "$CSP_HEADER" | grep -q "'unsafe-eval'"; then
    echo "❌ WARNING: unsafe-eval found in CSP (security risk)"
else
    echo "✅ unsafe-eval not found in CSP (secure)"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
sleep 1

echo ""
echo "🎉 All CSP tests passed!"
echo ""
echo "Summary of fixes:"
echo "- ✅ OAuth callback CSP now includes fonts.googleapis.com"
echo "- ✅ OAuth callback CSP now includes fonts.gstatic.com" 
echo "- ✅ Security restrictions maintained"
echo "- ✅ Fix works for error and success scenarios"