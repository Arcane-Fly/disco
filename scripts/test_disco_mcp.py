#!/usr/bin/env python3
"""
Minimal programmatic test harness for Disco MCP compliance
Based on the test pattern from the problem statement.
"""

import json
import sys
import httpx

ENDPOINT = "http://localhost:3000/mcp"
PROTO = "2025-06-18"

def rpc(client, body, session_id=None, expect_success=True):
    headers = {
        "Accept": "application/json, text/event-stream",
        "Content-Type": "application/json",
    }
    # Per spec: include MCP-Protocol-Version on subsequent requests; harmless on init too.
    headers["MCP-Protocol-Version"] = PROTO
    if session_id:
        headers["Mcp-Session-Id"] = session_id
    resp = client.post(ENDPOINT, headers=headers, content=json.dumps(body))
    if expect_success:
        resp.raise_for_status()
    sid = resp.headers.get("Mcp-Session-Id")
    return sid, resp.json(), resp.status_code

def main():
    print("🧪 Testing Disco MCP compliance programmatically...")
    
    with httpx.Client(timeout=30) as client:
        # 1) initialize
        init = {
            "jsonrpc":"2.0","id":"init-1","method":"initialize",
            "params":{
                "protocolVersion": PROTO,
                "clientInfo":{"name":"ci-probe","version":"0.0.1"},
                "capabilities":{"tools":{"listChanged":True},"resources":{"listChanged":True,"subscribe":True},"prompts":{"listChanged":True}}
            }
        }
        sid, init_res, status = rpc(client, init)
        assert status == 200, f"Initialize failed with status {status}"
        assert "result" in init_res and "serverInfo" in init_res["result"], f"Bad init: {init_res}"
        assert init_res["result"]["protocolVersion"] == PROTO, f"Wrong protocol version: {init_res['result']['protocolVersion']}"
        
        # 2) tools/list
        sid, tools, status = rpc(client, {"jsonrpc":"2.0","id":"t1","method":"tools/list","params":{}}, sid)
        assert status == 200, f"Tools/list failed with status {status}"
        assert "result" in tools, f"Bad tools/list: {tools}"
        assert "tools" in tools["result"], f"No tools in response: {tools}"
        
        # 3) tools/call (should require auth)
        sid, call_result, status = rpc(client, {
            "jsonrpc":"2.0","id":"c1","method":"tools/call",
            "params":{"name":"file_read","arguments":{"path":"package.json"}}
        }, sid, expect_success=False)
        assert status == 401, f"Expected 401 for auth required but got {status}"
        assert "error" in call_result, f"Expected auth error but got: {call_result}"
        assert call_result["error"]["code"] == -32001, f"Wrong error code: {call_result['error']['code']}"
        
        print("✅ OK:", {
            "server": init_res["result"]["serverInfo"], 
            "protocol_version": init_res["result"]["protocolVersion"],
            "tool_count": len(tools["result"].get("tools", [])),
            "auth_required": call_result["error"]["message"]
        })

if __name__ == "__main__":
    main()