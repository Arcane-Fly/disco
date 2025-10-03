#!/bin/bash

# Chrome DevTools MCP Server wrapper script
# This script ensures the correct PATH is available for VS Code to launch the MCP server

# Add Node.js and npm paths from fnm
export PATH="/run/user/1000/fnm_multishells/157458_1759376675780/bin:/home/braden/.local/share/fnm:$PATH"

# Launch the Chrome DevTools MCP server with the provided arguments
exec chrome-devtools-mcp "$@"