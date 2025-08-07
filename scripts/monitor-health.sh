#!/bin/bash

# Health monitoring script for disco MCP server
# Monitors server health, container utilization, and provider status

SERVER_URL="${DISCO_SERVER_URL:-https://disco-mcp.up.railway.app}"
LOG_FILE="${HOME}/disco-health-monitor.log"
ALERT_THRESHOLD_CONTAINERS=45  # Alert when containers > 45/50
ALERT_THRESHOLD_MEMORY=80      # Alert when memory > 80%
CHECK_INTERVAL=60              # Check every 60 seconds

echo "🔍 Starting Disco MCP Server Health Monitor"
echo "📡 Server URL: $SERVER_URL"
echo "📋 Log file: $LOG_FILE"
echo "⏰ Check interval: ${CHECK_INTERVAL}s"
echo ""

# Create log file if it doesn't exist
touch "$LOG_FILE"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_health() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Check basic health endpoint
    local health_response=$(curl -s --max-time 10 "$SERVER_URL/health" 2>/dev/null)
    local health_status=$?
    
    if [ $health_status -ne 0 ]; then
        log_message "❌ Health check failed - server not responding"
        return 1
    fi
    
    # Parse health response
    local server_status=$(echo "$health_response" | jq -r '.status' 2>/dev/null)
    local container_active=$(echo "$health_response" | jq -r '.containers.active' 2>/dev/null)
    local container_max=$(echo "$health_response" | jq -r '.containers.max' 2>/dev/null)
    local memory_used=$(echo "$health_response" | jq -r '.memory.used' 2>/dev/null)
    local uptime=$(echo "$health_response" | jq -r '.uptime' 2>/dev/null)
    
    if [ "$server_status" = "healthy" ]; then
        log_message "✅ Server healthy - Uptime: ${uptime}s, Containers: ${container_active}/${container_max}, Memory: ${memory_used}MB"
        
        # Check for alerts
        if [ "$container_active" -gt $ALERT_THRESHOLD_CONTAINERS ]; then
            log_message "⚠️  ALERT: High container usage - ${container_active}/${container_max}"
        fi
        
        if [ "$memory_used" -gt $ALERT_THRESHOLD_MEMORY ]; then
            log_message "⚠️  ALERT: High memory usage - ${memory_used}MB"
        fi
        
        return 0
    else
        log_message "⚠️  Server status: $server_status"
        return 1
    fi
}

check_containers() {
    local container_stats=$(curl -s --max-time 10 "$SERVER_URL/api/v1/containers/stats" \
        -H "Authorization: Bearer ${DISCO_MCP_TOKEN}" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$container_stats" ]; then
        local active=$(echo "$container_stats" | jq -r '.data.activeSessions' 2>/dev/null)
        local pool_ready=$(echo "$container_stats" | jq -r '.data.poolReady' 2>/dev/null)
        local webcontainer_available=$(echo "$container_stats" | jq -r '.data.webContainerAvailable' 2>/dev/null)
        
        log_message "📊 Container stats - Active: $active, Pool ready: $pool_ready, WebContainer: $webcontainer_available"
    else
        log_message "❌ Failed to get container stats (authentication required)"
    fi
}

check_providers() {
    local providers_response=$(curl -s --max-time 10 "$SERVER_URL/api/v1/providers" \
        -H "Authorization: Bearer ${DISCO_MCP_TOKEN}" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$providers_response" ]; then
        local total=$(echo "$providers_response" | jq -r '.data.total' 2>/dev/null)
        local active=$(echo "$providers_response" | jq -r '.data.active' 2>/dev/null)
        
        log_message "🤖 Provider status - Total: $total, Active: $active"
        
        # Check individual providers
        for provider in OpenAI Anthropic Google Groq; do
            local provider_status=$(curl -s --max-time 5 "$SERVER_URL/api/v1/providers/$provider/status" \
                -H "Authorization: Bearer ${DISCO_MCP_TOKEN}" 2>/dev/null)
            
            if [ $? -eq 0 ] && [ -n "$provider_status" ]; then
                local status=$(echo "$provider_status" | jq -r '.data.status' 2>/dev/null)
                local latency=$(echo "$provider_status" | jq -r '.data.latency' 2>/dev/null)
                log_message "  🔹 $provider: $status (${latency}ms)"
            fi
        done
    else
        log_message "❌ Failed to check providers (authentication required)"
    fi
}

# Main monitoring loop
if [ "$1" = "--once" ]; then
    log_message "🔄 Running single health check"
    check_health
    check_containers
    check_providers
    exit $?
fi

log_message "🚀 Starting continuous health monitoring"

while true; do
    check_health
    health_ok=$?
    
    if [ $health_ok -eq 0 ]; then
        check_containers
        check_providers
    fi
    
    sleep $CHECK_INTERVAL
done