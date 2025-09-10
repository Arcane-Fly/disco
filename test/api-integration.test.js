/**
 * Comprehensive API Integration Test Suite
 * Tests all API endpoints with Docker container proxy
 */
import request from 'supertest';
import { createServer } from '../src/server.js';
describe('API Integration Tests', () => {
    let app;
    let server;
    let authToken;
    let sessionId;
    beforeAll(async () => {
        // Create test server
        const testPort = 8081;
        process.env.PORT = testPort.toString();
        process.env.JWT_SECRET = 'test-secret-key-for-integration-testing-minimum-32-chars';
        process.env.ALLOWED_ORIGINS = 'http://localhost:8081';
        process.env.NODE_ENV = 'test';
        process.env.DOCKER_HOST = process.env.CI ? 'tcp://docker:2375' : '/var/run/docker.sock';
        const result = await createServer();
        app = result.app;
        server = result.server;
        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Get auth token
        const authResponse = await request(app)
            .post('/api/v1/auth/token')
            .send({ apiKey: 'test-api-key' });
        authToken = authResponse.body.token;
    }, 30000);
    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });
    describe('Container Management', () => {
        test('should create a container session', async () => {
            const response = await request(app)
                .post('/api/v1/containers/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                template: 'node',
                name: 'test-container'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('sessionId');
            expect(response.body).toHaveProperty('status');
            sessionId = response.body.sessionId;
        }, 30000);
        test('should list container sessions', async () => {
            const response = await request(app)
                .get('/api/v1/containers')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('sessions');
            expect(Array.isArray(response.body.sessions)).toBe(true);
        });
        test('should get container info', async () => {
            const response = await request(app)
                .get(`/api/v1/containers/${sessionId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', sessionId);
            expect(response.body).toHaveProperty('status');
        });
        test('should execute command in container', async () => {
            const response = await request(app)
                .post(`/api/v1/containers/${sessionId}/exec`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                command: 'echo "Hello from container"'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('output');
            expect(response.body.output).toContain('Hello from container');
        }, 10000);
    });
    describe('File Operations', () => {
        test('should create a file in container', async () => {
            const response = await request(app)
                .post('/api/v1/files/write')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId,
                path: 'test.txt',
                content: 'Hello World'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
        test('should read file from container', async () => {
            const response = await request(app)
                .get('/api/v1/files/read')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                sessionId,
                path: 'test.txt'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('content', 'Hello World');
        });
        test('should list directory contents', async () => {
            const response = await request(app)
                .get('/api/v1/files/list')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                sessionId,
                path: '/'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('files');
            expect(Array.isArray(response.body.files)).toBe(true);
        });
        test('should delete file', async () => {
            const response = await request(app)
                .delete('/api/v1/files/delete')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId,
                path: 'test.txt'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
    describe('Terminal Operations', () => {
        test('should execute terminal command', async () => {
            const response = await request(app)
                .post('/api/v1/terminal/exec')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId,
                command: 'ls -la'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('output');
            expect(response.body).toHaveProperty('exitCode', 0);
        });
        test('should spawn a process', async () => {
            const response = await request(app)
                .post('/api/v1/terminal/spawn')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId,
                command: 'node',
                args: ['--version']
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('pid');
        });
    });
    describe('Git Operations', () => {
        test('should initialize git repository', async () => {
            const response = await request(app)
                .post('/api/v1/git/init')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId,
                path: '/repo'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
        test('should get git status', async () => {
            const response = await request(app)
                .get('/api/v1/git/status')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                sessionId,
                path: '/repo'
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('branch');
            expect(response.body).toHaveProperty('files');
        });
    });
    describe('Security & Rate Limiting', () => {
        test('should reject requests without authentication', async () => {
            const response = await request(app)
                .get('/api/v1/containers');
            expect(response.status).toBe(401);
        });
        test('should reject requests with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/containers')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(401);
        });
        test('should enforce rate limiting', async () => {
            const requests = Array(11).fill(null).map(() => request(app)
                .get('/api/v1/health')
                .set('X-Forwarded-For', '192.168.1.100'));
            const responses = await Promise.all(requests);
            const rateLimited = responses.some(r => r.status === 429);
            expect(rateLimited).toBe(true);
        });
        test('should validate input parameters', async () => {
            const response = await request(app)
                .post('/api/v1/files/write')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId: 'invalid',
                path: '../../../etc/passwd', // Path traversal attempt
                content: 'malicious'
            });
            expect(response.status).toBe(400);
        });
    });
    describe('WebSocket Support', () => {
        test('should provide WebSocket configuration', async () => {
            const response = await request(app)
                .get('/api/v1/config');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('websocketUrl');
        });
    });
    describe('Health & Monitoring', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/api/v1/health');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('uptime');
        });
        test('should return capabilities', async () => {
            const response = await request(app)
                .get('/api/v1/capabilities');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('features');
            expect(response.body.features).toContain('containers');
            expect(response.body.features).toContain('files');
            expect(response.body.features).toContain('terminal');
        });
        test('should return metrics', async () => {
            const response = await request(app)
                .get('/api/v1/metrics')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('containers');
            expect(response.body).toHaveProperty('memory');
            expect(response.body).toHaveProperty('cpu');
        });
    });
    describe('Container Cleanup', () => {
        test('should terminate container session', async () => {
            const response = await request(app)
                .delete(`/api/v1/containers/${sessionId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        }, 10000);
        test('should confirm container is terminated', async () => {
            const response = await request(app)
                .get(`/api/v1/containers/${sessionId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('Performance Tests', () => {
        test('should handle concurrent container creations', async () => {
            const promises = Array(3).fill(null).map((_, i) => request(app)
                .post('/api/v1/containers/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                template: 'node',
                name: `concurrent-${i}`
            }));
            const responses = await Promise.all(promises);
            const allSuccessful = responses.every(r => r.status === 200);
            expect(allSuccessful).toBe(true);
            // Cleanup
            for (const response of responses) {
                if (response.body.sessionId) {
                    await request(app)
                        .delete(`/api/v1/containers/${response.body.sessionId}`)
                        .set('Authorization', `Bearer ${authToken}`);
                }
            }
        }, 60000);
        test('should handle large file operations', async () => {
            // Create new container for this test
            const createResponse = await request(app)
                .post('/api/v1/containers/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ template: 'node' });
            const testSessionId = createResponse.body.sessionId;
            const largeContent = 'x'.repeat(1024 * 1024); // 1MB
            const writeResponse = await request(app)
                .post('/api/v1/files/write')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId: testSessionId,
                path: 'large.txt',
                content: largeContent
            });
            expect(writeResponse.status).toBe(200);
            const readResponse = await request(app)
                .get('/api/v1/files/read')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                sessionId: testSessionId,
                path: 'large.txt'
            });
            expect(readResponse.status).toBe(200);
            expect(readResponse.body.content.length).toBe(largeContent.length);
            // Cleanup
            await request(app)
                .delete(`/api/v1/containers/${testSessionId}`)
                .set('Authorization', `Bearer ${authToken}`);
        }, 30000);
    });
    describe('Error Handling', () => {
        test('should handle non-existent container', async () => {
            const response = await request(app)
                .post('/api/v1/terminal/exec')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                sessionId: 'non-existent',
                command: 'ls'
            });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        test('should handle invalid template', async () => {
            const response = await request(app)
                .post('/api/v1/containers/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                template: 'invalid-template'
            });
            expect(response.status).toBe(400);
        });
        test('should handle container limit exceeded', async () => {
            // Try to create more containers than allowed
            const promises = Array(10).fill(null).map((_, i) => request(app)
                .post('/api/v1/containers/create')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                template: 'node',
                name: `limit-test-${i}`
            }));
            const responses = await Promise.all(promises);
            const hasLimitError = responses.some(r => r.status === 429 ||
                (r.status === 400 && r.body.error?.includes('limit')));
            expect(hasLimitError).toBe(true);
            // Cleanup created containers
            for (const response of responses) {
                if (response.status === 200 && response.body.sessionId) {
                    await request(app)
                        .delete(`/api/v1/containers/${response.body.sessionId}`)
                        .set('Authorization', `Bearer ${authToken}`);
                }
            }
        }, 60000);
    });
});
//# sourceMappingURL=api-integration.test.js.map