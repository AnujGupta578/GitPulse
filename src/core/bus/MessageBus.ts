import { EventEmitter } from 'node:events';
import { type AgentMessage } from '../agents/BaseAgent.js';

export type MessageHandler = (message: AgentMessage) => Promise<void>;

export class MessageBus {
    private emitter: EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
        // Increase limit if we have many agents
        this.emitter.setMaxListeners(100);
    }

    /**
     * Publishes a message to a specific topic.
     * @param topic The topic to publish to (e.g., agent ID or a broadcast topic)
     * @param message The strongly-typed AgentMessage
     */
    public publish(topic: string, message: AgentMessage): void {
        this.emitter.emit(topic, message);
    }

    /**
     * Subscribes a handler to a specific topic.
     * @param topic The topic to subscribe to
     * @param handler The asynchronous function to process the message
     */
    public subscribe(topic: string, handler: MessageHandler): void {
        this.emitter.on(topic, handler);
    }

    /**
     * Unsubscribes a handler from a specific topic.
     * @param topic The topic to unsubscribe from
     * @param handler The specific handler to remove
     */
    public unsubscribe(topic: string, handler: MessageHandler): void {
        this.emitter.off(topic, handler);
    }
}
