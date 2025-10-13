import React, { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext'; // Available for future use
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import WebContainerCompatibilityCheck from '../components/WebContainerCompatibilityCheck';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AlertCircle, CheckCircle, Terminal, Loader, Play } from 'lucide-react';

export default function WebContainerLoader() {
  // const { user } = useAuth(); // Available for future use when auth context is needed
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      // Simulate WebContainer initialization
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if running in supported environment
      const isSupported = typeof window !== 'undefined' && 
                         'SharedArrayBuffer' in window &&
                         crossOriginIsolated;
      
      if (!isSupported) {
        throw new Error('WebContainer requires Cross-Origin Isolation (COOP/COEP headers) and SharedArrayBuffer support. This environment may not be properly configured.');
      }
      
      setIsInitialized(true);
    } catch (error) {
      setInitError(error instanceof Error ? error.message : 'Failed to initialize WebContainer');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <ProtectedRoute demoMode={true}>
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-text-primary">WebContainer Loader</h1>
              <p className="text-text-secondary">
                Initialize WebContainer runtime for advanced development features
              </p>
            </div>

            {/* WebContainer Compatibility Check */}
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Environment Compatibility
                </h2>
                <WebContainerCompatibilityCheck showDetails={true} />
              </div>
            </Card>

            {/* Initialization Control */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  WebContainer Runtime
                </h2>

                <div className="space-y-4">
                  {!isInitialized && !initError && (
                    <div className="callout callout--info">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                          <h3 className="font-medium mb-1">
                            WebContainer Not Initialized
                          </h3>
                          <p className="text-sm mb-3">
                            Click below to initialize WebContainer runtime. This enables advanced features like:
                          </p>
                          <ul className="text-sm list-disc list-inside space-y-1">
                            <li>In-browser Node.js runtime</li>
                            <li>File system operations</li>
                            <li>Package installation with npm/yarn</li>
                            <li>Terminal emulation</li>
                            <li>Live code execution</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {initError && (
                    <div className="callout callout--danger">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                          <h3 className="font-medium mb-1">
                            Initialization Failed
                          </h3>
                          <p className="text-sm mb-2">
                            {initError}
                          </p>
                          <p className="text-sm">
                            This feature requires a properly configured environment with Cross-Origin Isolation headers.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isInitialized && (
                    <div className="callout callout--success">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                          <h3 className="font-medium mb-1">
                            WebContainer Initialized Successfully
                          </h3>
                          <p className="text-sm">
                            WebContainer runtime is ready. You can now use advanced development features.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={handleInitialize}
                      disabled={isInitializing || isInitialized}
                      className="flex items-center gap-2"
                    >
                      {isInitializing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Initializing...
                        </>
                      ) : isInitialized ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Initialized
                        </>
                      ) : (
                        <>
                          <Terminal className="w-4 h-4" />
                          Initialize WebContainer
                        </>
                      )}
                    </Button>

                    {initError && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInitError(null);
                          setIsInitialized(false);
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Prerequisites Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium mb-3">Prerequisites for WebContainer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Required Headers</h4>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Cross-Origin-Opener-Policy: same-origin</li>
                        <li>• Cross-Origin-Embedder-Policy: require-corp</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Browser Features</h4>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• SharedArrayBuffer support</li>
                        <li>• Web Workers</li>
                        <li>• WebAssembly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}