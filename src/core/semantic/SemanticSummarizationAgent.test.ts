import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SemanticSummarizationAgent, type NLPContext } from './SemanticSummarizationAgent.js';
import { AgentState, type AgentMessage } from '../agents/BaseAgent.js';
import { MessageBus } from '../bus/MessageBus.js';
import type { IBusinessProcess, ISemanticSummary } from './BusinessProcess.js';

describe('SemanticSummarizationAgent', () => {
    test('should generate a semantic summary for a valid business process', async () => {
        // Mock NLP service
        const mockNLPService = async (text: string) => `Mocked summary of: ${text}`;
        
        const context: NLPContext = {
            modelName: 'mock-model-v1',
            generateText: mockNLPService
        };

        const agent = new SemanticSummarizationAgent('agent-semantic-1', 'Summarizer', context);
        
        const processPayload: IBusinessProcess = {
            id: 'bp-101',
            name: 'User Onboarding',
            domain: 'Identity',
            steps: [
                { id: 's1', description: 'User submits form', actor: 'User', dependencies: [] }
            ]
        };

        const message: AgentMessage = {
            id: 'msg-sum-1',
            type: 'SUMMARIZE_PROCESS',
            payload: processPayload
        };

        await agent.receiveMessage(message);

        const summary = agent.getLastSummary();
        assert.ok(summary);
        assert.strictEqual(summary.processId, 'bp-101');
        assert.strictEqual(summary.executiveSummary, 'Mocked summary of: User Onboarding');
        assert.strictEqual(summary.complexityScore, 5); // Default mock value
        assert.strictEqual(agent.getState(), AgentState.IDLE);
    });

    test('should transition to ERROR state if NLP service fails', async () => {
        const failingNLPService = async (text: string) => {
            throw new Error('NLP Model Timeout');
        };
        
        const context: NLPContext = {
            modelName: 'mock-model-v1',
            generateText: failingNLPService
        };

        const agent = new SemanticSummarizationAgent('agent-semantic-2', 'Summarizer', context);
        
        const message: AgentMessage = {
            id: 'msg-sum-2',
            type: 'SUMMARIZE_PROCESS',
            payload: { id: 'bp-102', name: 'Test' }
        };

        await agent.receiveMessage(message);

        assert.strictEqual(agent.getState(), AgentState.ERROR);
        assert.strictEqual(agent.getLastSummary(), null);
    });

    test('should publish state transitions to the message bus', async () => {
        const bus = new MessageBus();
        const transitions: string[] = [];
        bus.subscribe('system-logs', async (msg) => {
            if (msg.type === 'STATE_TRANSITION') {
                transitions.push(msg.payload.state);
            }
        });

        const context: NLPContext = {
            modelName: 'test',
            generateText: async () => 'success'
        };

        const agent = new SemanticSummarizationAgent('agent-test-bus', 'BusAgent', context, bus);
        
        await agent.receiveMessage({
            id: 'm1',
            type: 'SUMMARIZE_PROCESS',
            payload: { id: 'bp1', name: 'Test' } as any
        });

        await new Promise(resolve => setImmediate(resolve));

        // Transitions: INITIALIZED -> RUNNING -> IDLE
        assert.strictEqual(transitions.length, 3);
        assert.strictEqual(transitions[0], AgentState.INITIALIZED);
        assert.strictEqual(transitions[1], AgentState.RUNNING);
        assert.strictEqual(transitions[2], AgentState.IDLE);
    });
});
