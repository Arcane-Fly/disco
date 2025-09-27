/**
 * Test helper to prevent server startup in test environments
 */

let serverStarted = false;

export function preventServerStartup() {
  if (process.env.NODE_ENV === 'test') {
    // Mock server.listen to prevent actual server startup
    const originalListen = require('http').Server.prototype.listen;
    require('http').Server.prototype.listen = function(port: any, host?: any, callback?: any) {
      if (serverStarted) return this;
      serverStarted = true;
      
      // Call callback immediately without actually starting server
      if (typeof callback === 'function') {
        setImmediate(callback);
      } else if (typeof host === 'function') {
        setImmediate(host);
      }
      return this;
    };
  }
}

export function resetServerState() {
  serverStarted = false;
}