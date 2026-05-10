import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MessageBus } from './MessageBus.js';
import { type AgentMessage } from '../agents/BaseAgent.js';

describe('MessageBus', () => {
    test('should subscribe and publish messages correctly', async () => {
        const bus = new MessageBus();
        const receivedMessages: AgentMessage[] = [];

        bus.subscribe('test-topic', async (msg) => {
            receivedMessages.push(msg);
        });

        const testMsg: AgentMessage = { id: 'msg-1', type: 'TEST', payload: { data: 'hello' } };
        bus.publish('test-topic', testMsg);

        // Allow microtask queue to process the event
        await new Promise(resolve => setImmediate(resolve));

        assert.strictEqual(receivedMessages.length, 1);
        assert.deepStrictEqual(receivedMessages[0], testMsg);
    });

    test('should allow multiple subscribers to the same topic', async () => {
        const bus = new MessageBus();
        let sub1Count = 0;
        let sub2Count = 0;

        bus.subscribe('multi-topic', async () => { sub1Count++; });
        bus.subscribe('multi-topic', async () => { sub2Count++; });

        bus.publish('multi-topic', { id: 'msg-2', type: 'MULTI', payload: {} });

        await new Promise(resolve => setImmediate(resolve));

        assert.strictEqual(sub1Count, 1);
        assert.strictEqual(sub2Count, 1);
    });

    test('should handle unsubscription', async () => {
        const bus = new MessageBus();
        let count = 0;

        const handler = async () => { count++; };
        bus.subscribe('unsub-topic', handler);
        bus.unsubscribe('unsub-topic', handler);

        bus.publish('unsub-topic', { id: 'msg-3', type: 'UNSUB', payload: {} });

        await new Promise(resolve => setImmediate(resolve));

        assert.strictEqual(count, 0);
    });
});
