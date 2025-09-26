/**
 * Test port management utility
 * Provides unique ports for test servers to avoid conflicts
 */

const usedPorts = new Set<number>();

export function getAvailablePort(): number {
  const start = parseInt(process.env.TEST_PORT_RANGE_START || '4000', 10);
  const end = parseInt(process.env.TEST_PORT_RANGE_END || '9000', 10);
  
  for (let port = start; port <= end; port++) {
    if (!usedPorts.has(port)) {
      usedPorts.add(port);
      return port;
    }
  }
  
  throw new Error('No available ports in test range');
}

export function releasePort(port: number): void {
  usedPorts.delete(port);
}

export function releaseAllPorts(): void {
  usedPorts.clear();
}