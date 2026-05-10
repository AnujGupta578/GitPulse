import { MessageBus } from './core/bus/MessageBus.js';
import { AgentRegistry } from './core/registry/AgentRegistry.js';
import { AgentLogger } from './core/logger/AgentLogger.js';
import { SemanticSummarizationAgent, type NLPContext } from './core/semantic/SemanticSummarizationAgent.js';
import { type IBusinessProcess } from './core/semantic/BusinessProcess.js';

async function runSmokeTest() {
    console.log('🚀 Starting GitPulse Smoke Test...');

    // 1. Initialize Infrastructure
    const bus = new MessageBus();
    const registry = new AgentRegistry();
    const logger = new AgentLogger(bus, 'system-logs');

    // 2. Initialize Semantic Agent
    const mockNLP: NLPContext = {
        modelName: 'gpt-mock',
        generateText: async (text) => `Summarized: ${text}`
    };

    const agent = new SemanticSummarizationAgent('agent-007', 'Summarizer', mockNLP, bus);
    registry.register(agent);
    console.log(`✅ Agent [${agent.getName()}] registered.`);

    // 3. Send a message to summarize a business process
    const bp: IBusinessProcess = {
        id: 'BP-SMOKE',
        name: 'Deployment Pipeline',
        domain: 'DevOps',
        steps: [{ id: '1', description: 'Build', actor: 'CI', dependencies: [] }]
    };

    console.log('📡 Publishing SUMMARIZE_PROCESS message...');
    await agent.receiveMessage({
        id: 'msg-smoke-1',
        type: 'SUMMARIZE_PROCESS',
        payload: bp
    });

    // 4. Verify results
    const summary = agent.getLastSummary();
    if (summary && summary.executiveSummary === 'Summarized: Deployment Pipeline') {
        console.log('✨ Summary Generated Successfully!');
    } else {
        console.error('❌ Summary generation failed or incorrect.');
        process.exit(1);
    }

    // 5. Verify Logger caught the transitions
    const logs = logger.getLogs();
    const transitions = logs.filter(l => l.message.type === 'STATE_TRANSITION');
    
    console.log(`📊 Captured ${transitions.length} state transitions:`);
    transitions.forEach(t => {
        console.log(`   - ${t.message.payload.state}`);
    });

    if (transitions.length >= 3) {
        console.log('✅ Smoke Test Passed!');
    } else {
        console.warn('⚠️ Fewer transitions than expected (expected 3: INITIALIZED, RUNNING, IDLE).');
    }
}

runSmokeTest().catch(err => {
    console.error('🔥 Smoke Test Fatal Error:', err);
    process.exit(1);
});
