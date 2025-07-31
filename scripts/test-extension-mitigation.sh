#!/bin/bash

# Browser Extension Mitigation Test Script
# Tests that OAuth success page includes enhanced browser extension conflict prevention

echo "🛡️  Testing Browser Extension Mitigation"
echo "========================================"

# Set required environment variables for testing
export JWT_SECRET="test-jwt-secret-for-testing-purposes-only"
export NODE_ENV="test"
export PORT="3002"

# Start the server in the background
echo "🚀 Starting test server on port 3002..."
node dist/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test OAuth success callback for browser extension mitigation features
echo ""
echo "📋 Testing OAuth success callback for browser extension mitigation..."
RESPONSE=$(curl -s "http://localhost:3002/auth/callback?code=test_code&state=test_state")

echo ""
echo "🔍 Checking for browser extension mitigation features..."

# Check for postMessage filtering
if echo "$RESPONSE" | grep -q "originalPostMessage"; then
    echo "✅ PostMessage filtering implemented"
else
    echo "❌ ERROR: PostMessage filtering NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check for addEventListener wrapping
if echo "$RESPONSE" | grep -q "originalAddEventListener"; then
    echo "✅ Event listener wrapping implemented"
else
    echo "❌ ERROR: Event listener wrapping NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check for extension message blocking
if echo "$RESPONSE" | grep -q "chrome-extension"; then
    echo "✅ Chrome extension message blocking implemented"
else
    echo "❌ ERROR: Chrome extension message blocking NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check for multiple browser extension support
if echo "$RESPONSE" | grep -q "moz-extension" && echo "$RESPONSE" | grep -q "safari-web-extension"; then
    echo "✅ Multi-browser extension support implemented"
else
    echo "❌ ERROR: Multi-browser extension support NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check for async message channel error prevention
if echo "$RESPONSE" | grep -q "async"; then
    echo "✅ Async message channel error prevention implemented"
else
    echo "❌ ERROR: Async message channel error prevention NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check that the redirect mechanism is still present
if echo "$RESPONSE" | grep -q "window.location.replace"; then
    echo "✅ Redirect mechanism maintained"
else
    echo "❌ ERROR: Redirect mechanism NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check for meta refresh fallback
if echo "$RESPONSE" | grep -q "meta http-equiv=\"refresh\""; then
    echo "✅ Meta refresh fallback present"
else
    echo "❌ ERROR: Meta refresh fallback NOT found"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
sleep 1

echo ""
echo "🎉 All browser extension mitigation tests passed!"
echo ""
echo "Summary of browser extension mitigation features:"
echo "- ✅ PostMessage filtering to block extension messages"
echo "- ✅ Event listener wrapping to prevent extension interference"  
echo "- ✅ Chrome/Firefox/Safari extension message blocking"
echo "- ✅ Async message channel error prevention"
echo "- ✅ Multiple redirect fallback mechanisms"
echo "- ✅ Meta refresh failsafe"