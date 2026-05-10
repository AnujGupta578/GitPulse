import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AgentRegistry } from './AgentRegistry.js';
import { BaseAgent, type AgentMessage } from '../agents/BaseAgent.js';

class MockAgent extends BaseAgent<any, any> {
    constructor(id: string, name: string) {
        super(id, name, {});
    }

    protected async processMessage(message: AgentMessage<any>): Promise<void> {
        // Mock processing
    }
}

describe('AgentRegistry', () => {
    test('should register and retrieve an agent', () => {
        const registry = new AgentRegistry();
        const agent = new MockAgent('agent-1', 'MockAgent');
        
        registry.register(agent);
        
        const retrieved = registry.getAgent('agent-1');
        assert.strictEqual(retrieved, agent);
    });

    test('should return undefined for non-existent agent', () => {
        const registry = new AgentRegistry();
        const retrieved = registry.getAgent('non-existent');
        assert.strictEqual(retrieved, undefined);
    });

    test('should remove an agent', () => {
        const registry = new AgentRegistry();
        const agent = new MockAgent('agent-2', 'MockAgent');
        
        registry.register(agent);
        registry.unregister('agent-2');
        
        const retrieved = registry.getAgent('agent-2');
        assert.strictEqual(retrieved, undefined);
    });

    test('should retrieve all registered agents', () => {
        const registry = new AgentRegistry();
        registry.register(new MockAgent('agent-3', 'MockAgent1'));
        registry.register(new MockAgent('agent-4', 'MockAgent2'));
        
        const allAgents = registry.getAllAgents();
        assert.strictEqual(allAgents.length, 2);
        assert.strictEqual(allAgents[0]?.getId(), 'agent-3');
        assert.strictEqual(allAgents[1]?.getId(), 'agent-4');
    });
});
