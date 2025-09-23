import { Socket } from 'socket.io';

interface DashboardMetrics {
  activeContainers: number;
  cpuUsage: number;
  memoryUsage: string;
  uptime: string;
  apiRequests: number;
  activeSessions: number;
  securityScore: string;
  performance: string;
  timestamp: number;
}

class MetricsService {
  private clients: Set<Socket> = new Set();
  private metricsInterval: NodeJS.Timeout | null = null;

  addClient(socket: Socket) {
    this.clients.add(socket);
    console.log(`📊 Metrics client connected: ${socket.id}`);

    // Send initial metrics immediately
    this.sendMetricsToClient(socket);

    // Start metrics broadcasting if this is the first client
    if (this.clients.size === 1) {
      this.startMetricsBroadcast();
    }

    socket.on('disconnect', () => {
      this.removeClient(socket);
    });
  }

  removeClient(socket: Socket) {
    this.clients.delete(socket);
    console.log(`📊 Metrics client disconnected: ${socket.id}`);

    // Stop metrics broadcasting if no clients
    if (this.clients.size === 0) {
      this.stopMetricsBroadcast();
    }
  }

  private startMetricsBroadcast() {
    console.log('📊 Starting real-time metrics broadcast');
    this.metricsInterval = setInterval(() => {
      this.broadcastMetrics();
    }, 5000); // Update every 5 seconds
  }

  private stopMetricsBroadcast() {
    if (this.metricsInterval) {
      console.log('📊 Stopping real-time metrics broadcast');
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private async generateMetrics(): Promise<DashboardMetrics> {
    // Generate realistic dynamic metrics
    const baseTime = Date.now();
    const cpuVariation = Math.sin(baseTime / 10000) * 20 + 50; // Oscillate around 50%
    const memoryBase = 2.1 + Math.sin(baseTime / 15000) * 0.5; // Oscillate around 2.1GB
    const sessionsBase = 12 + Math.floor(Math.sin(baseTime / 20000) * 8); // 4-20 sessions
    const apiRequestsBase = 1247 + Math.floor(Math.random() * 100); // Incremental with some variation
    const cpuUsage = Math.max(0, Math.min(100, Math.round(cpuVariation)));

    return {
      activeContainers: 5 + Math.floor(Math.sin(baseTime / 30000) * 3), // 2-8 containers
      cpuUsage,
      memoryUsage: `${Math.round(memoryBase * 10) / 10} GB`,
      uptime: '99.9%',
      apiRequests: apiRequestsBase,
      activeSessions: Math.max(1, sessionsBase),
      securityScore: 'A+',
      performance: cpuUsage < 70 ? 'Fast' : cpuUsage < 85 ? 'Good' : 'Slow',
      timestamp: baseTime,
    };
  }

  private async sendMetricsToClient(socket: Socket) {
    try {
      const metrics = await this.generateMetrics();
      socket.emit('metrics-update', metrics);
    } catch (error) {
      console.error('Error sending metrics to client:', error);
    }
  }

  private async broadcastMetrics() {
    if (this.clients.size === 0) return;

    try {
      const metrics = await this.generateMetrics();

      // Broadcast to all connected clients
      this.clients.forEach(socket => {
        if (socket.connected) {
          socket.emit('metrics-update', metrics);
        }
      });

      console.log(`📊 Broadcasted metrics to ${this.clients.size} clients`);
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const metricsService = new MetricsService();
