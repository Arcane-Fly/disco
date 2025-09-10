#!/bin/bash

# Strategic UX Enhancement Demonstration Script
# This script demonstrates the strategic improvements implemented in the Disco MCP Server

echo "🎯 Strategic UX Enhancement Demonstration"
echo "========================================="
echo ""

# Check if server is built
if [ ! -d "dist" ]; then
    echo "📦 Building project first..."
    npm run build
    echo ""
fi

echo "🚀 Starting Enhanced Disco MCP Server..."
echo "This demonstration showcases the strategic enhancements:"
echo ""
echo "✅ UI/UX Innovation Excellence"
echo "   • Intelligent UI automation with accessibility validation"
echo "   • Advanced visual regression testing with semantic analysis"
echo "   • Performance monitoring and optimization"
echo "   • Usability scoring and user journey analysis"
echo ""
echo "✅ QA Excellence Framework"
echo "   • WCAG 2.1 compliance validation"
echo "   • AI-powered semantic understanding"
echo "   • Cross-browser consistency validation"
echo "   • Automated quality assessment"
echo ""
echo "✅ Strategic API Endpoints"
echo "   • /api/v1/strategic-ux/:containerId/intelligent-automation"
echo "   • /api/v1/strategic-ux/:containerId/advanced-visual-regression"
echo "   • /api/v1/strategic-ux/:containerId/quality-assessment"
echo "   • /api/v1/strategic-ux/:containerId/optimization-recommendations"
echo ""

# Start the server
echo "🌐 Server will be available at:"
echo "   • Main Interface: http://localhost:3000"
echo "   • API Documentation: http://localhost:3000/docs"
echo "   • Health Check: http://localhost:3000/health"
echo ""

# Set required environment variables for demonstration
export JWT_SECRET="demo-strategic-enhancements-jwt-secret-32-chars-minimum"
export ALLOWED_ORIGINS="http://localhost:3000,https://chat.openai.com,https://claude.ai"
export NODE_ENV="development"

echo "🔧 Environment configured for strategic demonstration"
echo ""

# Check if Redis is available
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running - enhanced session management available"
    else
        echo "⚠️  Redis not running - using in-memory sessions"
    fi
else
    echo "⚠️  Redis not installed - using in-memory sessions"
fi

echo ""
echo "🎭 Strategic Enhancement Features to Test:"
echo ""
echo "1. 🧠 Intelligent UI Automation"
echo "   curl -X POST http://localhost:3000/api/v1/strategic-ux/{containerId}/intelligent-automation \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer {token}' \\"
echo "        -d '{"
echo "          \"sessionId\": \"demo-session\","
echo "          \"pageId\": \"demo-page\","
echo "          \"actions\": [{"
echo "            \"type\": \"click\","
echo "            \"selector\": \"#strategic-test-button\","
echo "            \"validation\": {"
echo "              \"accessibility\": true,"
echo "              \"performance\": true,"
echo "              \"usability\": true"
echo "            }"
echo "          }]"
echo "        }'"
echo ""

echo "2. 🔍 Advanced Visual Regression Testing"
echo "   curl -X POST http://localhost:3000/api/v1/strategic-ux/{containerId}/advanced-visual-regression \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer {token}' \\"
echo "        -d '{"
echo "          \"sessionId\": \"demo-session\","
echo "          \"pageId\": \"demo-page\","
echo "          \"testName\": \"strategic-enhancement-test\","
echo "          \"validateAccessibility\": true,"
echo "          \"analyzeSemantics\": true,"
echo "          \"comparePerformance\": true"
echo "        }'"
echo ""

echo "3. 📊 Comprehensive Quality Assessment"
echo "   curl http://localhost:3000/api/v1/strategic-ux/{containerId}/quality-assessment?sessionId=demo-session&pageId=demo-page \\"
echo "        -H 'Authorization: Bearer {token}'"
echo ""

echo "4. 🤖 AI-Powered Optimization Recommendations"
echo "   curl -X POST http://localhost:3000/api/v1/strategic-ux/{containerId}/optimization-recommendations \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer {token}' \\"
echo "        -d '{"
echo "          \"sessionId\": \"demo-session\","
echo "          \"pageId\": \"demo-page\","
echo "          \"analysisType\": \"comprehensive\","
echo "          \"priorityLevel\": \"high\""
echo "        }'"
echo ""

echo "📚 Documentation Available:"
echo "   • Strategic Plan: specifications/strategic-intensification-plan.md"
echo "   • Implementation Guide: specifications/implementation-guide.md"
echo "   • Test Suite: test/strategic-ux-enhancements.test.ts"
echo ""

echo "🎯 Starting server in 3 seconds..."
sleep 3

# Start the enhanced server
npm start