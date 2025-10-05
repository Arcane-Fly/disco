/**
 * A2A (Agent-to-Agent) Client Implementation
 * Following the master cheat sheet for A2A protocol integration
 * This is a simplified implementation until the official a2a-protocol package is available
 */
/**
 * A2A Client for agent-to-agent communication
 * Based on the master cheat sheet A2A protocol specification
 */
export class A2AClient {
    endpoint;
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    /**
     * Send a task to another agent
     * Core method: tasks/send
     */
    async sendTask(skill, data) {
        try {
            const response = await fetch(`${this.endpoint}/tasks/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ skill, data }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Send a task with SSE streaming (tasks/sendSubscribe)
     * Core method: tasks/sendSubscribe
     */
    async sendTaskWithStreaming(skill, data, onUpdate) {
        const eventSource = new EventSource(`${this.endpoint}/tasks/sendSubscribe?${new URLSearchParams({
            skill,
            data: JSON.stringify(data),
        })}`);
        eventSource.onmessage = (event) => {
            try {
                const update = JSON.parse(event.data);
                onUpdate(update);
            }
            catch (error) {
                console.error('Failed to parse SSE update:', error);
            }
        };
        eventSource.onerror = () => {
            eventSource.close();
        };
    }
    /**
     * Get task status
     * Core method: tasks/get
     */
    async getTaskStatus(taskId) {
        try {
            const response = await fetch(`${this.endpoint}/tasks/get/${taskId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Cancel a running task
     * Core method: tasks/cancel
     */
    async cancelTask(taskId) {
        try {
            const response = await fetch(`${this.endpoint}/tasks/cancel/${taskId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Get agent capabilities (Agent Card)
     */
    async getAgentCard() {
        try {
            const response = await fetch(`${this.endpoint}/agent-card`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Failed to get agent card:', error);
            return null;
        }
    }
}
//# sourceMappingURL=a2a-client.js.map