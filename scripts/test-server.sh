#!/bin/bash

# Test script for MCP Server
echo "🧪 Testing MCP Server..."

# Test 1: Health Check
echo "📋 Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "$HEALTH"
fi

# Test 2: Capabilities
echo "📋 Testing capabilities endpoint..."
CAPABILITIES=$(curl -s http://localhost:3000/capabilities)
if echo "$CAPABILITIES" | grep -q "file:read"; then
    echo "✅ Capabilities check passed"
else
    echo "❌ Capabilities check failed"
    echo "$CAPABILITIES"
fi

# Test 3: Authentication
echo "📋 Testing authentication..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth \
    -H "Content-Type: application/json" \
    -d '{"apiKey": "test-key-1"}')

if echo "$AUTH_RESPONSE" | grep -q "token"; then
    echo "✅ Authentication passed"
    TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.token')
    
    # Test 4: Container creation (will fail but API should respond properly)
    echo "📋 Testing container API..."
    CONTAINER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/containers \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    if echo "$CONTAINER_RESPONSE" | grep -q "WEBCONTAINER_ERROR"; then
        echo "✅ Container API responded correctly (WebContainer error expected in Node.js)"
    else
        echo "❌ Container API failed"
        echo "$CONTAINER_RESPONSE"
    fi
else
    echo "❌ Authentication failed"
    echo "$AUTH_RESPONSE"
fi

# Test 5: Invalid endpoints
echo "📋 Testing error handling..."
ERROR_RESPONSE=$(curl -s http://localhost:3000/nonexistent)
if echo "$ERROR_RESPONSE" | grep -q "NOT_FOUND"; then
    echo "✅ Error handling works correctly"
else
    echo "❌ Error handling failed"
    echo "$ERROR_RESPONSE"
fi

echo "🎉 Test completed!"