# Next.js UI Rendering & Hydration Troubleshooting

This document provides troubleshooting steps and maintenance guidelines for the Next.js UI rendering improvements in the Disco MCP application.

## Common Issues and Solutions

### 1. Hydration Mismatches

**Symptoms:**
- Console warnings about hydration mismatches
- Components not rendering correctly
- Flash of unstyled content (FOUC)

**Solutions:**
- Use `suppressHydrationWarning` on components that might differ between server and client
- Wrap dynamic content in `HydrationSafeWrapper`
- Check for browser-only APIs in components

**Example Fix:**
```tsx
// Bad: Will cause hydration mismatch
const MyComponent = () => {
  return <div>{new Date().toISOString()}</div>;
};

// Good: Hydration-safe
const MyComponent = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div suppressHydrationWarning>Loading...</div>;
  
  return <div>{new Date().toISOString()}</div>;
};
```

### 2. Content Security Policy (CSP) Issues

**Symptoms:**
- "Refused to apply inline style" console errors
- CSS not loading properly
- Icons not displaying

**Current Configuration:**
- CSP is disabled in development mode to prevent nonce conflicts
- Production uses proper CSP headers with WebContainer compatibility

**Troubleshooting:**
```bash
# Check if in development mode
echo $NODE_ENV

# Verify CSP headers in production
curl -I http://localhost:3000

# Test without CSP (development only)
# CSP is automatically disabled in dev mode via next.config.cjs
```

### 3. Icon Loading Issues

**Symptoms:**
- Icons showing as placeholder symbols (`?` or boxes)
- Missing Lucide React icons

**Solutions:**
- Use the `Icon` component from `components/ui/Icon.tsx`
- Ensure proper hydration safety with icon fallbacks

**Example Usage:**
```tsx
// Bad: Direct Lucide import may cause hydration issues
import { Github } from 'lucide-react';

// Good: Use hydration-safe Icon component
import { Icon } from '@/components/ui/Icon';

const MyComponent = () => (
  <Icon name="Github" size={24} className="text-blue-500" />
);
```

### 4. WebContainer Compatibility

**Symptoms:**
- SharedArrayBuffer errors
- WebContainer features not working
- Cross-origin issues

**Configuration Check:**
```javascript
// next.config.cjs headers for WebContainer support
{
  key: 'Cross-Origin-Embedder-Policy',
  value: 'credentialless',
},
{
  key: 'Cross-Origin-Opener-Policy', 
  value: 'same-origin',
}
```

## Maintenance Guidelines

### Regular Checks

1. **Build Testing:**
   ```bash
   npm run build
   npm run start
   ```

2. **Development Server:**
   ```bash
   npm run dev
   # Check console for hydration warnings
   ```

3. **Icon Verification:**
   - Ensure all icons render properly
   - Check for placeholder symbols
   - Verify fallback icons work

### Code Quality

1. **Always use hydration-safe patterns:**
   - `suppressHydrationWarning` for unavoidable differences
   - `HydrationSafeWrapper` for dynamic components
   - `Icon` component for all icons

2. **Error Boundaries:**
   - `ErrorBoundary` wraps the entire app
   - Handles WebContainer-specific errors
   - Provides graceful fallbacks

3. **Performance:**
   - Monitor bundle sizes in build output
   - Use dynamic imports for heavy components
   - Lazy load icons when possible

### Debugging Steps

1. **Console Errors:**
   ```bash
   # Open browser DevTools (F12)
   # Check Console tab for:
   # - Hydration warnings
   # - CSP violations  
   # - Network failures
   ```

2. **Network Issues:**
   ```bash
   # Check Network tab for:
   # - Failed CSS/JS requests
   # - 404 errors on assets
   # - CORS issues
   ```

3. **Build Analysis:**
   ```bash
   # Analyze bundle size
   npm run build
   # Check for optimization warnings
   ```

## Environment-Specific Notes

### Development
- CSP is disabled to prevent nonce conflicts
- Hot reloading may cause temporary hydration issues
- Use `suppressHydrationWarning` liberally for debugging

### Production
- Full CSP headers enabled
- WebContainer headers configured
- All hydration issues must be resolved

### WebContainer Mode
- Additional CORS headers required
- SharedArrayBuffer support needed
- Specific error handling for WebContainer APIs

## Quick Fixes

### Immediate Hydration Fix
```tsx
// Wrap problematic components
<HydrationSafeWrapper>
  <ProblematicComponent />
</HydrationSafeWrapper>
```

### Icon Not Showing
```tsx
// Replace direct Lucide imports
<Icon name="IconName" size={24} />
```

### CSP Blocking Styles
```javascript
// Verify development mode in next.config.cjs
if (process.env.NODE_ENV === 'development') {
  return []; // Disables CSP
}
```

## Contact & Support

For persistent issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Test in incognito mode
4. Verify environment configuration
5. Check WebContainer compatibility

Remember: The goal is a smooth, hydration-safe UI that works across all deployment environments while maintaining WebContainer compatibility.