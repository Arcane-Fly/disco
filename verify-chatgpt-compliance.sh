#!/bin/bash

# ChatGPT/MCP Compliance Verification Script
# This script verifies that all required endpoints are working correctly

set -e

echo "🔍 ChatGPT/MCP Compliance Verification"
echo "======================================"
echo

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "🌐 Testing server at: $BASE_URL"
echo

# Test 1: Discovery endpoints
echo "📡 Testing Discovery Endpoints..."

echo -n "  • Root discovery (/) ... "
curl -s "$BASE_URL/" > /dev/null && echo "✅" || echo "❌"

echo -n "  • Configuration (/config) ... "
curl -s "$BASE_URL/config" > /dev/null && echo "✅" || echo "❌"

echo -n "  • Capabilities (/capabilities) ... "
curl -s "$BASE_URL/capabilities" > /dev/null && echo "✅" || echo "❌"

echo -n "  • Health check (/health) ... "
curl -s "$BASE_URL/health" > /dev/null && echo "✅" || echo "❌"

echo

# Test 2: OpenAPI and Documentation
echo "📚 Testing Documentation Endpoints..."

echo -n "  • OpenAPI spec (/openapi.json) ... "
if curl -s "$BASE_URL/openapi.json" | jq -e '.info.title' > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • Swagger UI (/docs) ... "
if curl -s -I "$BASE_URL/docs" | grep -q "200\|301"; then
    echo "✅"
else
    echo "❌"
fi

echo

# Test 3: ChatGPT Plugin Manifests
echo "🤖 Testing ChatGPT Integration..."

echo -n "  • AI Plugin manifest (/.well-known/ai-plugin.json) ... "
if curl -s "$BASE_URL/.well-known/ai-plugin.json" | jq -e '.schema_version' > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • MCP configuration (/.well-known/mcp.json) ... "
if curl -s "$BASE_URL/.well-known/mcp.json" | jq -e '.version' > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
fi

echo

# Test 4: CORS Configuration
echo "🔒 Testing CORS Configuration..."

echo -n "  • ChatGPT origin (chat.openai.com) ... "
if curl -s -I -H "Origin: https://chat.openai.com" "$BASE_URL/" | grep -q "Access-Control-Allow-Origin: https://chat.openai.com"; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • ChatGPT origin (chatgpt.com) ... "
if curl -s -I -H "Origin: https://chatgpt.com" "$BASE_URL/" | grep -q "Access-Control-Allow-Origin: https://chatgpt.com"; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • OPTIONS preflight requests ... "
if curl -s -I -X OPTIONS -H "Origin: https://chat.openai.com" -H "Access-Control-Request-Method: POST" "$BASE_URL/api/v1/auth/login" | grep -q "Access-Control-Allow-Methods"; then
    echo "✅"
else
    echo "❌"
fi

echo

# Test 5: Security Headers
echo "🛡️  Testing Security Headers..."

echo -n "  • Content Security Policy ... "
if curl -s -I "$BASE_URL/" | grep -q "Content-Security-Policy"; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • Rate limiting headers ... "
if curl -s -I "$BASE_URL/" | grep -q "RateLimit"; then
    echo "✅"
else
    echo "❌"
fi

echo

# Test 6: API Structure
echo "🔧 Testing API Structure..."

echo -n "  • Auth endpoints (/api/v1/auth) ... "
if curl -s -I "$BASE_URL/api/v1/auth/status" | grep -q "200\|401"; then
    echo "✅"
else
    echo "❌"
fi

echo -n "  • Health endpoint structure ... "
if curl -s "$BASE_URL/health" | jq -e '.status' > /dev/null 2>&1; then
    echo "✅"
else
    echo "❌"
fi

echo

# Summary
echo "📋 Verification Summary"
echo "====================="
echo
echo "If all tests show ✅, the server is ready for ChatGPT integration."
echo "Any ❌ indicates an issue that needs to be addressed."
echo
echo "🔗 Important URLs:"
echo "  • API Documentation: $BASE_URL/docs"
echo "  • OpenAPI Spec: $BASE_URL/openapi.json"
echo "  • Plugin Manifest: $BASE_URL/.well-known/ai-plugin.json"
echo "  • Server Config: $BASE_URL/config"
echo
echo "For production deployment on Railway:"
echo "  • Set ALLOWED_ORIGINS environment variable"
echo "  • Configure WebSocket URL (WEBSOCKET_URL)"
echo "  • Set JWT_SECRET and other security variables"
echo