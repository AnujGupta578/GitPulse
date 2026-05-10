import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AgentLogger } from './AgentLogger.js';
import { MessageBus } from '../bus/MessageBus.js';
import { type AgentMessage } from '../agents/BaseAgent.js';

describe('AgentLogger', () => {
    test('should capture logs from the message bus', async () => {
        const bus = new MessageBus();
        const logger = new AgentLogger(bus, 'system-logs');
        
        const testMsg: AgentMessage = { id: 'msg-log-1', type: 'STATE_TRANSITION', payload: { state: 'RUNNING', agentId: 'agent-99' } };
        bus.publish('system-logs', testMsg);

        // Allow microtask queue to process the event
        await new Promise(resolve => setImmediate(resolve));

        const logs = logger.getLogs();
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0]?.message.id, 'msg-log-1');
        assert.ok(logs[0]?.timestamp instanceof Date);
    });

    test('should allow clearing logs', async () => {
        const bus = new MessageBus();
        const logger = new AgentLogger(bus, 'system-logs');
        
        bus.publish('system-logs', { id: 'msg-log-2', type: 'INFO', payload: {} });
        await new Promise(resolve => setImmediate(resolve));
        
        assert.strictEqual(logger.getLogs().length, 1);
        logger.clearLogs();
        assert.strictEqual(logger.getLogs().length, 0);
    });
});
