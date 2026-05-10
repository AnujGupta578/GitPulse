import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BaseAgent, AgentState, type AgentMessage } from './BaseAgent.js';

// Concrete implementation for testing
class TestAgent extends BaseAgent<any, { data: string }> {
    public executed = false;

    constructor(id: string, name: string) {
        super(id, name, {});
    }

    protected async processMessage(message: AgentMessage<{ data: string }>): Promise<void> {
        if (message.type === 'TEST_ERROR') {
            throw new Error('Simulated transient failure');
        }
        this.executed = true;
    }
}

describe('BaseAgent', () => {
    test('should initialize correctly', () => {
        const agent = new TestAgent('agent-1', 'TestAgent');
        assert.strictEqual(agent.getId(), 'agent-1');
        assert.strictEqual(agent.getName(), 'TestAgent');
        assert.strictEqual(agent.getState(), AgentState.INITIALIZED);
    });

    test('should transition to RUNNING when processing a message', async () => {
        const agent = new TestAgent('agent-2', 'TestAgent');
        await agent.receiveMessage({ id: 'msg-1', type: 'TEST', payload: { data: 'test' } });
        
        assert.strictEqual(agent.executed, true);
        assert.strictEqual(agent.getState(), AgentState.IDLE); // Transitions back to IDLE after success
    });

    test('should handle failures securely and transition to ERROR state', async () => {
        const agent = new TestAgent('agent-3', 'TestAgent');
        await agent.receiveMessage({ id: 'msg-2', type: 'TEST_ERROR', payload: { data: 'test' } });
        
        assert.strictEqual(agent.executed, false);
        assert.strictEqual(agent.getState(), AgentState.ERROR);
    });
});
