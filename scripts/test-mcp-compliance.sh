#!/bin/bash

echo "🧪 Testing MCP Compliance..."

# Start server in background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "Testing claude-connector endpoint..."
CONNECTOR_RESPONSE=$(curl -s http://localhost:3000/claude-connector)
echo "✅ Claude connector response:"
echo "$CONNECTOR_RESPONSE" | jq -r '.api_base_url, .stream_base_url, .mcp_transport'

echo ""
echo "Testing MCP HTTP Stream POST..."
MCP_POST_RESPONSE=$(curl -s -X POST http://localhost:3000/mcp -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}')
echo "✅ MCP POST response (initialize):"
echo "$MCP_POST_RESPONSE" | jq -r '.result.serverInfo.name, .result.protocolVersion'

echo ""
echo "Testing MCP HTTP Stream GET (non-SSE)..."
MCP_GET_RESPONSE=$(curl -s http://localhost:3000/mcp)
echo "✅ MCP GET response:"
echo "$MCP_GET_RESPONSE" | jq -r '.transport, .methods[]'

echo ""
echo "Testing SSE endpoint..."
SSE_RESPONSE=$(timeout 3 curl -s http://localhost:3000/sse | head -5)
echo "✅ SSE response (first 5 lines):"
echo "$SSE_RESPONSE"

echo ""
echo "Testing /messages endpoint..."
MESSAGES_RESPONSE=$(curl -s -X POST http://localhost:3000/messages -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}')
echo "✅ Messages endpoint response:"
echo "$MESSAGES_RESPONSE" | jq -r '.result.tools | length'

echo ""
echo "Testing session header support..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/messages -H "Content-Type: application/json" -H "Mcp-Session-Id: test-123" -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize"}' -I | grep -i mcp-session)
echo "✅ Session header response:"
echo "$SESSION_RESPONSE"

# Clean up
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "🎉 MCP Compliance tests completed!"