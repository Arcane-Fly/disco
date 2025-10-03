# 🔍 Chrome DevTools MCP Debugging Guide

## ✅ Setup Complete!

Your Chrome DevTools MCP debugging environment is now ready. Here's how to debug your disco-mcp pages:

## 🌐 Pages to Debug:
1. **API Config**: https://disco-mcp.up.railway.app/api-config
2. **Analytics**: https://disco-mcp.up.railway.app/analytics
3. **WebContainer Loader**: https://disco-mcp.up.railway.app/webcontainer-loader

## 🛠️ Manual Debugging Steps:

### Step 1: Open Chrome with DevTools
1. Chrome should now be running with remote debugging enabled
2. Navigate to each page manually if not already open
3. Press **F12** or right-click and select **"Inspect Element"**

### Step 2: Debug Each Page Systematically

#### 🔴 **Console Tab** - Check for JavaScript Errors:
```javascript
// Look for red error messages
// Common MCP issues to check:
- "Failed to load resource" errors
- CORS/CSP policy violations
- WebContainer initialization failures
- Authentication/OAuth errors
- API endpoint connection issues
```

#### 🌐 **Network Tab** - Check Resource Loading:
```javascript
// Look for failed requests (red entries):
- 404 errors for missing CSS/JS files
- 500 errors from API endpoints
- Timeout errors for slow resources
- CORS preflight failures
```

#### 🏗️ **Elements Tab** - Check DOM Structure:
```javascript
// Inspect the page structure:
- Look for missing or empty containers
- Check if CSS classes are applied correctly
- Verify WebContainer elements exist
- Check for loading spinners stuck in loading state
```

#### ⚡ **Performance Tab** - Check Rendering Issues:
```javascript
// Record a page load and look for:
- Layout thrashing/shifts
- Long scripting tasks
- Render blocking resources
- Memory leaks
```

## 🔧 MCP-Specific Debug Checklist:

### For `/api-config` page:
- [ ] Check if API configuration form loads
- [ ] Verify OAuth/authentication flows work
- [ ] Test API endpoint connections
- [ ] Check for MCP protocol errors

### For `/analytics` page:
- [ ] Verify analytics dashboard renders
- [ ] Check data visualization components
- [ ] Test real-time data updates
- [ ] Look for chart/graph rendering errors

### For `/webcontainer-loader` page:
- [ ] Check WebContainer initialization
- [ ] Verify COEP headers are set correctly
- [ ] Test file system operations
- [ ] Check terminal/shell functionality

## 🚨 Common Issues to Look For:

### Content Security Policy (CSP) Violations:
```
Refused to execute inline script because it violates CSP
Refused to load resource because it violates CSP
```

### CORS Errors:
```
Access to fetch at 'url' has been blocked by CORS policy
Cross-Origin Request Blocked
```

### WebContainer Issues:
```
SharedArrayBuffer is not defined
WebContainer is not defined
Failed to initialize WebContainer
```

### Authentication Problems:
```
401 Unauthorized
403 Forbidden
OAuth callback failed
```

## 🛡️ VS Code Integration

The Chrome DevTools MCP is configured for VS Code. To use it:

1. **MCP Server**: `/home/braden/Desktop/Dev/disco/chrome-devtools-mcp-wrapper.sh`
2. **VS Code Settings**: `.vscode/settings.json` configured
3. **Restart VS Code** if the MCP extension is installed

## 📋 Quick Debug Commands:

### In Browser Console:
```javascript
// Check MCP elements
document.querySelectorAll('[data-mcp], [class*="mcp"], [id*="mcp"]')

// Check WebContainer
window.WebContainer

// Check current errors
console.error.toString()

// Check resource loading
performance.getEntriesByType('resource').filter(r => r.transferSize === 0)

// Check network status
navigator.onLine

// Check viewport
window.innerWidth + 'x' + window.innerHeight
```

## 🔗 Direct DevTools Access:
If Chrome is running with remote debugging, you can access DevTools directly at:
- Base URL: `http://127.0.0.1:9222/json`
- DevTools Frontend: `https://chrome-devtools-frontend.appspot.com/serve_rev/@[version]/inspector.html?ws=127.0.0.1:9222/devtools/page/[TAB_ID]`

## 📞 Need Help?
If you encounter specific errors, copy the exact error messages from the Console tab for targeted troubleshooting.

Happy debugging! 🚀