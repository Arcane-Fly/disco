#!/bin/bash

# Chrome DevTools MCP Debugging Script for disco-mcp pages
# This script helps debug rendering issues on /api-config, /analytics, and /webcontainer-loader

echo "=== Chrome DevTools MCP Debugging Tool ==="
echo "Target pages:"
echo "1. https://disco-mcp.up.railway.app/api-config"
echo "2. https://disco-mcp.up.railway.app/analytics"
echo "3. https://disco-mcp.up.railway.app/webcontainer-loader"
echo

# Check if Chrome is running with remote debugging
if ! curl -s http://127.0.0.1:9222/json > /dev/null; then
    echo "❌ Chrome remote debugging not available on port 9222"
    echo "Please start Chrome with: google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug"
    exit 1
fi

echo "✅ Chrome remote debugging is running on port 9222"

# Function to debug a specific page
debug_page() {
    local url=$1
    local page_name=$2

    echo
    echo "=== Debugging $page_name ($url) ==="

    # Get current tabs
    tabs=$(curl -s http://127.0.0.1:9222/json)

    # Find tab with this URL or create new one
    tab_id=$(echo "$tabs" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -z "$tab_id" ]; then
        echo "❌ No active tab found"
        return 1
    fi

    echo "🔍 Found tab ID: $tab_id"

    # Basic page information
    echo "📄 Page Information:"
    curl -s "http://127.0.0.1:9222/json/runtime/evaluate" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"id\":1,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"document.title\"}}" \
        | grep -o '"value":"[^"]*"' | cut -d'"' -f4 | head -1 | sed 's/^/  Title: /'

    # Check for JavaScript errors
    echo "🚨 Checking for JavaScript errors..."
    curl -s "http://127.0.0.1:9222/json/runtime/evaluate" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"id\":2,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"console.error.toString()\"}}"

    # Check DOM readiness
    echo "🏗️  Checking DOM state..."
    curl -s "http://127.0.0.1:9222/json/runtime/evaluate" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"id\":3,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"document.readyState\"}}" \
        | grep -o '"value":"[^"]*"' | cut -d'"' -f4 | head -1 | sed 's/^/  DOM State: /'

    # Check for missing resources
    echo "📦 Checking for missing resources..."
    curl -s "http://127.0.0.1:9222/json/runtime/evaluate" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"id\":4,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"performance.getEntriesByType('resource').filter(r => r.transferSize === 0).length\"}}" \
        | grep -o '"value":[0-9]*' | cut -d':' -f2 | sed 's/^/  Failed Resources: /'

    # Check viewport size
    echo "📱 Viewport Information:"
    curl -s "http://127.0.0.1:9222/json/runtime/evaluate" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"id\":5,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"window.innerWidth + 'x' + window.innerHeight\"}}" \
        | grep -o '"value":"[^"]*"' | cut -d'"' -f4 | head -1 | sed 's/^/  Size: /'

    echo "🔗 DevTools URL: https://chrome-devtools-frontend.appspot.com/serve_rev/@b95610d5c4a562d9cd834bc0a098d3316e2f533f/inspector.html?ws=127.0.0.1:9222/devtools/page/$tab_id"
}

# Debug each page
pages=(
    "https://disco-mcp.up.railway.app/api-config:API Config"
    "https://disco-mcp.up.railway.app/analytics:Analytics"
    "https://disco-mcp.up.railway.app/webcontainer-loader:WebContainer Loader"
)

for page_info in "${pages[@]}"; do
    url="${page_info%:*}"
    name="${page_info#*:}"

    # Open page in Chrome
    echo "🌐 Opening $name..."
    google-chrome --new-tab "$url" &
    sleep 2

    debug_page "$url" "$name"
done

echo
echo "=== Manual Debugging Instructions ==="
echo "1. Open Chrome and navigate to the pages manually"
echo "2. Press F12 or right-click and select 'Inspect Element'"
echo "3. Use these DevTools panels:"
echo "   - Elements: Check DOM structure and CSS"
echo "   - Console: Look for JavaScript errors"
echo "   - Network: Check for failed resource loads"
echo "   - Performance: Analyze rendering performance"
echo "   - Lighthouse: Run performance/accessibility audits"
echo
echo "4. Common rendering issues to check:"
echo "   - Missing CSS files (404 in Network tab)"
echo "   - JavaScript errors (red errors in Console)"
echo "   - Layout shifts (Performance tab)"
echo "   - Accessibility issues (Lighthouse tab)"
echo "   - CORS errors (Console tab)"
echo "   - Content Security Policy violations (Console tab)"
echo
echo "5. For MCP-specific debugging, check for:"
echo "   - WebContainer initialization errors"
echo "   - MCP protocol connection issues"
echo "   - Authentication/OAuth problems"
echo "   - API endpoint failures"
echo

echo "✅ Debugging setup complete!"
echo "💡 Tip: Use the Chrome DevTools URLs provided above for direct access to each page's debugger"