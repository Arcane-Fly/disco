#!/usr/bin/env node

// Chrome DevTools MCP Page Debugger
// This script uses the Chrome DevTools Protocol to debug rendering issues

const https = require('https');
const http = require('http');

const CHROME_DEBUG_PORT = 9222;
const PAGES_TO_DEBUG = [
    'https://disco-mcp.up.railway.app/api-config',
    'https://disco-mcp.up.railway.app/analytics',
    'https://disco-mcp.up.railway.app/webcontainer-loader'
];

// Function to make Chrome DevTools Protocol requests
async function chromeRequest(endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: CHROME_DEBUG_PORT,
            path: endpoint,
            method: data ? 'POST' : 'GET',
            headers: data ? { 'Content-Type': 'application/json' } : {}
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(responseData));
                } catch (e) {
                    resolve(responseData);
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Function to evaluate JavaScript in a Chrome tab
async function evaluateInTab(tabId, expression) {
    const endpoint = `/json/runtime/evaluate`;
    const data = {
        id: Date.now(),
        method: 'Runtime.evaluate',
        params: { expression }
    };

    try {
        const response = await chromeRequest(endpoint, data);
        return response;
    } catch (error) {
        console.error(`Error evaluating "${expression}":`, error.message);
        return null;
    }
}

// Function to debug a specific page
async function debugPage(url, tabId) {
    console.log(`\n=== Debugging ${url} ===`);
    console.log(`Tab ID: ${tabId}`);

    try {
        // Check basic page info
        const title = await evaluateInTab(tabId, 'document.title');
        console.log(`Title: ${title?.result?.value || 'Unknown'}`);

        const readyState = await evaluateInTab(tabId, 'document.readyState');
        console.log(`DOM State: ${readyState?.result?.value || 'Unknown'}`);

        const url_current = await evaluateInTab(tabId, 'window.location.href');
        console.log(`Current URL: ${url_current?.result?.value || 'Unknown'}`);

        // Check viewport
        const viewport = await evaluateInTab(tabId, 'window.innerWidth + "x" + window.innerHeight');
        console.log(`Viewport: ${viewport?.result?.value || 'Unknown'}`);

        // Check for JavaScript errors
        console.log('\n📋 Console Errors:');
        const consoleErrors = await evaluateInTab(tabId, `
            (function() {
                let errors = [];
                const originalError = console.error;
                console.error = function(...args) {
                    errors.push(args.join(' '));
                    originalError.apply(console, args);
                };
                return errors;
            })()
        `);

        if (consoleErrors?.result?.value) {
            console.log(consoleErrors.result.value);
        }

        // Check resource loading
        console.log('\n📦 Resource Loading:');
        const resources = await evaluateInTab(tabId, `
            performance.getEntriesByType('resource').map(r => ({
                name: r.name,
                status: r.transferSize === 0 ? 'FAILED' : 'OK',
                size: r.transferSize,
                duration: Math.round(r.duration)
            })).filter(r => r.status === 'FAILED' || r.name.includes('disco-mcp'))
        `);

        if (resources?.result?.value) {
            resources.result.value.forEach(resource => {
                console.log(`  ${resource.status}: ${resource.name} (${resource.size}b, ${resource.duration}ms)`);
            });
        }

        // Check for specific elements
        console.log('\n🏗️  DOM Structure:');
        const domInfo = await evaluateInTab(tabId, `
            ({
                hasBody: !!document.body,
                bodyChildren: document.body ? document.body.children.length : 0,
                hasScripts: document.scripts.length,
                hasStylesheets: document.styleSheets.length,
                metaTags: Array.from(document.querySelectorAll('meta')).map(m => m.name || m.property).filter(Boolean)
            })
        `);

        if (domInfo?.result?.value) {
            const info = domInfo.result.value;
            console.log(`  Body: ${info.hasBody ? 'Present' : 'Missing'}`);
            console.log(`  Body Children: ${info.bodyChildren}`);
            console.log(`  Scripts: ${info.hasScripts}`);
            console.log(`  Stylesheets: ${info.hasStylesheets}`);
            console.log(`  Meta Tags: ${info.metaTags.join(', ')}`);
        }

        // Check for MCP-specific elements
        console.log('\n🔧 MCP-Specific Checks:');
        const mcpElements = await evaluateInTab(tabId, `
            ({
                hasWebContainer: !!document.querySelector('[data-webcontainer]') || !!window.WebContainer,
                hasMcpElements: document.querySelectorAll('[data-mcp], [class*="mcp"], [id*="mcp"]').length,
                hasApiConfig: !!document.querySelector('[data-api-config]') || window.location.pathname.includes('api-config'),
                hasAnalytics: !!document.querySelector('[data-analytics]') || window.location.pathname.includes('analytics'),
                consoleErrors: Array.from(document.querySelectorAll('.error, .console-error')).length,
                loadingElements: document.querySelectorAll('[data-loading], .loading, .spinner').length
            })
        `);

        if (mcpElements?.result?.value) {
            const mcp = mcpElements.result.value;
            console.log(`  WebContainer Support: ${mcp.hasWebContainer ? 'Yes' : 'No'}`);
            console.log(`  MCP Elements: ${mcp.hasMcpElements}`);
            console.log(`  API Config Page: ${mcp.hasApiConfig ? 'Yes' : 'No'}`);
            console.log(`  Analytics Page: ${mcp.hasAnalytics ? 'Yes' : 'No'}`);
            console.log(`  Visible Errors: ${mcp.consoleErrors}`);
            console.log(`  Loading Elements: ${mcp.loadingElements}`);
        }

        // Check network status
        console.log('\n🌐 Network Status:');
        const networkStatus = await evaluateInTab(tabId, `
            ({
                online: navigator.onLine,
                connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
                cookiesEnabled: navigator.cookieEnabled,
                userAgent: navigator.userAgent.substring(0, 50) + '...'
            })
        `);

        if (networkStatus?.result?.value) {
            const net = networkStatus.result.value;
            console.log(`  Online: ${net.online ? 'Yes' : 'No'}`);
            console.log(`  Connection: ${net.connectionType}`);
            console.log(`  Cookies: ${net.cookiesEnabled ? 'Enabled' : 'Disabled'}`);
            console.log(`  User Agent: ${net.userAgent}`);
        }

        console.log(`\n🔗 Direct DevTools URL:`);
        console.log(`https://chrome-devtools-frontend.appspot.com/serve_rev/@b95610d5c4a562d9cd834bc0a098d3316e2f533f/inspector.html?ws=127.0.0.1:9222/devtools/page/${tabId}`);

    } catch (error) {
        console.error(`Error debugging ${url}:`, error.message);
    }
}

// Main function
async function main() {
    console.log('🔍 Chrome DevTools MCP Debugger Starting...\n');

    try {
        // Get list of all Chrome tabs
        const tabs = await chromeRequest('/json');

        if (!Array.isArray(tabs) || tabs.length === 0) {
            console.log('❌ No Chrome tabs found. Please open Chrome with --remote-debugging-port=9222');
            return;
        }

        console.log(`✅ Found ${tabs.length} Chrome tab(s)`);

        // Debug each tab that matches our target pages
        for (const tab of tabs) {
            if (tab.type === 'page' && PAGES_TO_DEBUG.some(url => tab.url.includes(url.split('/').pop()))) {
                await debugPage(tab.url, tab.id);
            }
        }

        // Show all available tabs
        console.log('\n📋 All Available Tabs:');
        tabs.forEach((tab, index) => {
            if (tab.type === 'page') {
                console.log(`  ${index + 1}. ${tab.title} - ${tab.url}`);
                console.log(`     DevTools: https://chrome-devtools-frontend.appspot.com/serve_rev/@b95610d5c4a562d9cd834bc0a098d3316e2f533f/inspector.html?ws=127.0.0.1:9222/devtools/page/${tab.id}`);
            }
        });

    } catch (error) {
        console.error('❌ Error connecting to Chrome:', error.message);
        console.log('\n💡 Make sure Chrome is running with:');
        console.log('google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug');
    }
}

// Run the debugger
main().catch(console.error);