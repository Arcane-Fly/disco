import { NextRequest, NextResponse } from 'next/server'

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
  
  // CSP is now handled by next.config.cjs headers() for Railway compatibility
  // Only add nonce to response headers for potential use by pages
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