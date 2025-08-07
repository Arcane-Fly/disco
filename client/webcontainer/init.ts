import { WebContainer } from '@webcontainer/api';

/**
 * WebContainer Client Initialization Module
 * Provides browser-side WebContainer initialization with proper COEP/COOP configuration
 */

export interface WebContainerConfig {
  serverUrl?: string;
  coep?: 'require-corp' | 'credentialless';
  timeout?: number;
  retries?: number;
}

export interface BootstrapResult {
  success: boolean;
  sessionId?: string;
  containerId?: string;
  error?: string;
  capabilities?: string[];
}

/**
 * Initialize WebContainer instance with proper configuration for MCP integration
 */
export const initializeWebContainer = async (config: WebContainerConfig = {}): Promise<WebContainer | null> => {
  try {
    const {
      serverUrl = 'https://disco-mcp.up.railway.app',
      coep = 'credentialless',
      timeout = 30000,
      retries = 3
    } = config;

    console.log('🚀 Initializing WebContainer with MCP integration...');
    console.log(`📡 Server URL: ${serverUrl}`);
    console.log(`🔒 COEP Policy: ${coep}`);

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('⚠️  WebContainer initialization attempted in non-browser environment');
      return null;
    }

    // Check for SharedArrayBuffer support (required for WebContainer)
    if (typeof SharedArrayBuffer === 'undefined') {
      console.error('❌ SharedArrayBuffer not available - check COEP/COOP headers');
      throw new Error('SharedArrayBuffer required for WebContainer - ensure COEP headers are set');
    }

    // Retry logic for WebContainer initialization
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 WebContainer initialization attempt ${attempt}/${retries}...`);
        
        const instance = await Promise.race([
          WebContainer.boot({
            coep: coep
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('WebContainer boot timeout')), timeout)
          )
        ]);

        console.log('✅ WebContainer initialized successfully');
        
        // Test basic functionality
        const testResult = await instance.fs.readdir('/');
        console.log('🗂️  WebContainer filesystem accessible:', testResult.length, 'items');
        
        return instance;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️  WebContainer initialization attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('WebContainer initialization failed after all retries');
    
  } catch (error) {
    console.error('❌ WebContainer initialization failed:', error);
    return null;
  }
};

/**
 * Bootstrap WebContainer session with MCP server coordination
 */
export const bootstrapContainer = async (sessionId?: string): Promise<BootstrapResult> => {
  try {
    const serverUrl = 'https://disco-mcp.up.railway.app';
    
    console.log('🔧 Bootstrapping WebContainer session...');
    
    const response = await fetch(`${serverUrl}/api/v1/containers/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId || generateSessionId()
      },
      body: JSON.stringify({
        type: 'webcontainer',
        config: {
          memory: 512,
          timeout: 1800000, // 30 minutes
          coep: 'credentialless'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Bootstrap failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ WebContainer session bootstrapped:', result);
    
    return {
      success: true,
      sessionId: result.sessionId,
      containerId: result.containerId,
      capabilities: result.capabilities || []
    };
    
  } catch (error) {
    console.error('❌ WebContainer bootstrap failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check WebContainer compatibility and requirements
 */
export const checkWebContainerCompatibility = (): {
  compatible: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check browser environment
  if (typeof window === 'undefined') {
    issues.push('Not running in browser environment');
  }

  // Check SharedArrayBuffer support
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('SharedArrayBuffer not available');
    recommendations.push('Ensure COEP header is set to "credentialless" or "require-corp"');
    recommendations.push('Ensure COOP header is set to "same-origin"');
  }

  // Check for HTTPS (required for many WebContainer features)
  if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'https:') {
    issues.push('HTTPS required for full WebContainer functionality');
    recommendations.push('Use HTTPS for production deployment');
  }

  // Check for modern browser features
  if (typeof Worker === 'undefined') {
    issues.push('Web Workers not available');
  }

  if (typeof WebAssembly === 'undefined') {
    issues.push('WebAssembly not available');
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Generate a unique session ID for WebContainer sessions
 */
export const generateSessionId = (): string => {
  return 'wc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2);
};

/**
 * Initialize WebContainer with MCP server integration
 * This function handles the full initialization flow including server communication
 */
export const initializeMCPWebContainer = async (config: WebContainerConfig = {}): Promise<{
  container: WebContainer | null;
  session: BootstrapResult;
}> => {
  // First check compatibility
  const compatibility = checkWebContainerCompatibility();
  if (!compatibility.compatible) {
    console.error('❌ WebContainer compatibility issues:', compatibility.issues);
    console.log('💡 Recommendations:', compatibility.recommendations);
    return {
      container: null,
      session: { success: false, error: 'WebContainer compatibility issues: ' + compatibility.issues.join(', ') }
    };
  }

  // Bootstrap session with server
  const session = await bootstrapContainer();
  if (!session.success) {
    return { container: null, session };
  }

  // Initialize WebContainer
  const container = await initializeWebContainer(config);
  
  return { container, session };
};