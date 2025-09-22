import { headers } from 'next/headers'
import { IncomingMessage } from 'http'

/**
 * Get the nonce value for the current request
 * This can be used in Next.js pages and components to add nonce to inline scripts/styles
 */
export function getNonce(): string | undefined {
  try {
    const headersList = headers()
    // Try both x-nonce (from Next.js middleware) and X-Nonce (from Express middleware)
    return headersList.get('x-nonce') || headersList.get('X-Nonce') || undefined
  } catch (error) {
    // Handle case where headers() is not available (e.g., during SSG)
    return undefined
  }
}

/**
 * Get nonce from Express request object (for API routes)
 */
export function getNonceFromExpressRequest(req: IncomingMessage & { nonce?: string }): string | undefined {
  return req.nonce
}

/**
 * Create a nonce attribute object for React components
 * Usage: <script {...getNonceProps()} dangerouslySetInnerHTML={{__html: 'console.log("test")'}} />
 */
export function getNonceProps(): { nonce?: string } {
  const nonce = getNonce()
  return nonce ? { nonce } : {}
}

/**
 * Create nonce props from Express request (for server-side rendering)
 */
export function getNoncePropsFromRequest(req: IncomingMessage & { nonce?: string }): { nonce?: string } {
  const nonce = getNonceFromExpressRequest(req)
  return nonce ? { nonce } : {}
}