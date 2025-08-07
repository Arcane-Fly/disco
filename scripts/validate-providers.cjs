#!/usr/bin/env node

/**
 * Provider Validation Script
 * Validates AI provider configurations and tests quantum router functionality
 */

const https = require('https');
const http = require('http');

const SERVER_URL = process.env.DISCO_SERVER_URL || 'https://disco-mcp.up.railway.app';
const AUTH_TOKEN = process.env.DISCO_MCP_TOKEN || '';

console.log('🤖 Disco MCP Provider Validation');
console.log(`📡 Server: ${SERVER_URL}`);
console.log(`🔐 Auth: ${AUTH_TOKEN ? 'Configured' : 'Missing (some tests will be skipped)'}`);
console.log('');

const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Disco-MCP-Validator/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
};

const validateProvider = async (providerName) => {
  console.log(`🔍 Validating ${providerName}...`);
  
  if (!AUTH_TOKEN) {
    console.log(`  ⏭️  Skipped - authentication required`);
    return { skipped: true };
  }
  
  try {
    const response = await makeRequest(`${SERVER_URL}/api/v1/providers/${providerName}/status`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      const data = response.data.data;
      console.log(`  ✅ ${providerName}: ${data.status} (${data.latency}ms)`);
      console.log(`     Models: ${data.models.join(', ')}`);
      console.log(`     Capabilities: ${data.capabilities.join(', ')}`);
      return { success: true, data };
    } else {
      console.log(`  ❌ ${providerName}: Error ${response.status}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`  ❌ ${providerName}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const testQuantumRouter = async () => {
  console.log('🌀 Testing Quantum Router...');
  
  if (!AUTH_TOKEN) {
    console.log('  ⏭️  Skipped - authentication required');
    return;
  }
  
  try {
    const response = await makeRequest(`${SERVER_URL}/api/v1/providers/quantum/route`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: {
        query: 'test routing functionality',
        providers: ['OpenAI', 'Anthropic']
      }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      const data = response.data.data;
      console.log(`  ✅ Quantum routing successful`);
      console.log(`     Selected: ${data.selectedProvider.provider} (score: ${data.selectedProvider.routingScore?.toFixed(2)})`);
      console.log(`     Algorithm: ${data.quantumRouting.algorithm}`);
      console.log(`     Factors: ${data.quantumRouting.factors.join(', ')}`);
    } else {
      console.log(`  ❌ Quantum routing failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Quantum routing error: ${error.message}`);
  }
};

const validateAllProviders = async () => {
  console.log('🔄 Running provider validation...');
  
  if (!AUTH_TOKEN) {
    console.log('  ⏭️  Skipped - authentication required');
    return;
  }
  
  try {
    const response = await makeRequest(`${SERVER_URL}/api/v1/providers/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      const data = response.data.data;
      console.log(`  ✅ Validation complete: ${data.summary.valid}/${data.summary.total} providers valid`);
      
      data.results.forEach(result => {
        const status = result.healthy ? '✅' : '❌';
        console.log(`     ${status} ${result.name}: ${result.status} (${result.latency}ms)`);
        
        if (result.issues && result.issues.length > 0) {
          console.log(`        Issues: ${result.issues.join(', ')}`);
        }
      });
    } else {
      console.log(`  ❌ Validation failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`  ❌ Validation error: ${error.message}`);
  }
};

const testMCPEndpoints = async () => {
  console.log('🔌 Testing MCP endpoints...');
  
  // Test MCP HTTP Stream transport
  try {
    const response = await makeRequest(`${SERVER_URL}/mcp`, {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'Disco Validator',
            version: '1.0.0'
          }
        }
      }
    });
    
    if (response.status === 200 && response.data.jsonrpc === '2.0') {
      console.log('  ✅ MCP HTTP Stream transport working');
      console.log(`     Protocol: ${response.data.result.protocolVersion}`);
      console.log(`     Server: ${response.data.result.serverInfo.name} v${response.data.result.serverInfo.version}`);
    } else {
      console.log('  ❌ MCP HTTP Stream transport failed');
    }
  } catch (error) {
    console.log(`  ❌ MCP HTTP Stream error: ${error.message}`);
  }
  
  // Test tools list
  try {
    const response = await makeRequest(`${SERVER_URL}/mcp`, {
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }
    });
    
    if (response.status === 200 && response.data.result && response.data.result.tools) {
      console.log(`  ✅ MCP tools available: ${response.data.result.tools.length} tools`);
      response.data.result.tools.forEach(tool => {
        console.log(`     - ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log('  ❌ MCP tools list failed');
    }
  } catch (error) {
    console.log(`  ❌ MCP tools error: ${error.message}`);
  }
};

const main = async () => {
  console.log('🚀 Starting validation...\n');
  
  // Test individual providers
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Groq'];
  const results = [];
  
  for (const provider of providers) {
    const result = await validateProvider(provider);
    results.push({ provider, ...result });
  }
  
  console.log('');
  
  // Test quantum router
  await testQuantumRouter();
  console.log('');
  
  // Test bulk validation
  await validateAllProviders();
  console.log('');
  
  // Test MCP endpoints
  await testMCPEndpoints();
  console.log('');
  
  // Summary
  console.log('📋 Validation Summary:');
  const successful = results.filter(r => r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  
  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);  
  console.log(`  ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some validations failed. Check server logs for details.');
    process.exit(1);
  } else if (successful === 0 && skipped > 0) {
    console.log('\n💡 All tests skipped due to missing authentication.');
    console.log('   Set DISCO_MCP_TOKEN environment variable to run authenticated tests.');
    process.exit(0);
  } else {
    console.log('\n🎉 All validations passed!');
    process.exit(0);
  }
};

// Run validation
main().catch(error => {
  console.error('💥 Validation script failed:', error.message);
  process.exit(1);
});