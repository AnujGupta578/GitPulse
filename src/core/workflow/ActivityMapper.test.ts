import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AgentRegistry } from '../registry/AgentRegistry.js';
import { mapAgentsToActivities } from './ActivityMapper.js';
import { BaseAgent, type AgentMessage } from '../agents/BaseAgent.js';

class MockActivityAgent extends BaseAgent<any, { shouldFail: boolean }> {
    constructor(id: string, name: string) {
        super(id, name, {});
    }

    protected async processMessage(message: AgentMessage<{ shouldFail: boolean }>): Promise<void> {
        if (message.payload.shouldFail) {
            throw new Error('Induced failure for activity test');
        }
    }
}

describe('ActivityMapper', () => {
    test('should map registry agents to callable activities', async () => {
        const registry = new AgentRegistry();
        const agent = new MockActivityAgent('test-agent-1', 'TestAgent');
        registry.register(agent);

        const activities = mapAgentsToActivities(registry);
        
        assert.ok(activities['execute_test_agent_1']);
        
        const result = await activities['execute_test_agent_1']({
            id: 'msg-1',
            type: 'TEST',
            payload: { shouldFail: false }
        });

        assert.strictEqual(result.status, 'COMPLETED');
        assert.strictEqual(result.agentId, 'test-agent-1');
        assert.strictEqual(result.messageId, 'msg-1');
    });

    test('should throw error in activity if agent enters ERROR state', async () => {
        const registry = new AgentRegistry();
        const agent = new MockActivityAgent('test-agent-2', 'TestAgent');
        registry.register(agent);

        const activities = mapAgentsToActivities(registry);
        
        try {
            await activities['execute_test_agent_2']!({
                id: 'msg-2',
                type: 'TEST',
                payload: { shouldFail: true }
            });
            assert.fail('Activity should have thrown an error');
        } catch (err: any) {
            assert.match(err.message, /Temporal Activity Failure: Agent \[test-agent-2\] failed/);
        }
    });
});
