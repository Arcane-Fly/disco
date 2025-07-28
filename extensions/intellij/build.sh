#!/bin/bash

# Simple build script for Disco MCP IntelliJ Plugin
# This creates a basic JAR file that can be manually installed in IntelliJ

echo "Building Disco MCP IntelliJ Plugin..."

PLUGIN_DIR="/home/runner/work/disco/disco/extensions/intellij"
BUILD_DIR="$PLUGIN_DIR/build"
DIST_DIR="$PLUGIN_DIR/dist"

# Create directories
mkdir -p "$BUILD_DIR"
mkdir -p "$DIST_DIR"

echo "Created build directories"

# Copy plugin.xml and resources
cp -r "$PLUGIN_DIR/src/main/resources"/* "$BUILD_DIR/"

echo "Copied resources and plugin.xml"

# Create basic JAR structure
cd "$BUILD_DIR"

# Create a basic plugin JAR with just the manifest and plugin.xml
jar -cf "$DIST_DIR/disco-mcp-plugin-1.0.0.jar" META-INF/

echo "Created plugin JAR at $DIST_DIR/disco-mcp-plugin-1.0.0.jar"

# Copy JAR to a standard plugin location name
cp "$DIST_DIR/disco-mcp-plugin-1.0.0.jar" "$DIST_DIR/disco-mcp-plugin.jar"

echo ""
echo "Build complete!"
echo "Plugin JAR created at:"
echo "  - $DIST_DIR/disco-mcp-plugin-1.0.0.jar"
echo "  - $DIST_DIR/disco-mcp-plugin.jar"
echo ""
echo "To install manually in IntelliJ:"
echo "1. Go to File > Settings > Plugins"
echo "2. Click the gear icon and select 'Install Plugin from Disk...'"
echo "3. Select the JAR file: $DIST_DIR/disco-mcp-plugin.jar"
echo "4. Restart IntelliJ"