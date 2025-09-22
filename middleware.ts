import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  // Create request headers with nonce for use in pages
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
  
  // Only set CSP if not already set by Express (to avoid conflicts)
  if (!response.headers.get('Content-Security-Policy')) {
    // Build CSP header with nonce support and Google Fonts
    const cspHeader = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' blob: data: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
    
    response.headers.set('Content-Security-Policy', cspHeader)
  }
  
  // Add nonce to response headers for potential use by pages
  response.headers.set('X-Nonce', nonce)
  
  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes are handled by Express)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}