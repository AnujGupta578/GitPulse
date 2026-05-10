import { MessageBus } from '../bus/MessageBus.js';
import { type AgentMessage } from '../agents/BaseAgent.js';

export interface LogEntry {
    timestamp: Date;
    message: AgentMessage;
}

export class AgentLogger {
    private logs: LogEntry[] = [];
    private bus: MessageBus;

    constructor(bus: MessageBus, topic: string) {
        this.bus = bus;
        this.bus.subscribe(topic, this.handleLogMessage.bind(this));
    }

    /**
     * Internal handler to capture messages from the bus.
     */
    private async handleLogMessage(message: AgentMessage): Promise<void> {
        this.logs.push({
            timestamp: new Date(),
            message
        });
        
        // In a production scenario, we would stream this to stdout or an external 
        // service securely, redacting sensitive payloads.
        if (process.env.DEBUG === 'true') {
            console.log(`[LOG] ${new Date().toISOString()} - ${message.type} - ID: ${message.id}`);
        }
    }

    /**
     * Retrieves the stored logs.
     * @returns Array of LogEntry
     */
    public getLogs(): LogEntry[] {
        return [...this.logs]; // Return a shallow copy to prevent external mutation
    }

    /**
     * Clears all stored logs.
     */
    public clearLogs(): void {
        this.logs = [];
    }
}
