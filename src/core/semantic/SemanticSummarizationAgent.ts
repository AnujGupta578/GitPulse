import { BaseAgent, type AgentMessage } from '../agents/BaseAgent.js';
import { type MessageBus } from '../bus/MessageBus.js';
import type { IBusinessProcess, ISemanticSummary } from './BusinessProcess.js';

export interface NLPContext {
    modelName: string;
    generateText: (prompt: string) => Promise<string>;
}

export class SemanticSummarizationAgent extends BaseAgent<NLPContext, IBusinessProcess> {
    private lastSummary: ISemanticSummary | null = null;

    constructor(id: string, name: string, context: NLPContext, bus?: MessageBus) {
        super(id, name, context, bus);
    }

    protected async processMessage(message: AgentMessage<IBusinessProcess>): Promise<void> {
        if (message.type === 'SUMMARIZE_PROCESS') {
            const process = message.payload as IBusinessProcess;
            
            // Invoke the NLP service injected via context
            const summaryText = await this.context.generateText(process.name);
            
            // Build the semantic summary response
            this.lastSummary = {
                processId: process.id,
                executiveSummary: summaryText,
                technicalImpact: `Impact assessment for ${process.steps?.length || 0} steps.`,
                complexityScore: 5 // Static for MVP; would be calculated by NLP model
            };
        } else {
            console.warn(`[${this.getName()}] Unhandled message type: ${message.type}`);
        }
    }

    /**
     * Retrieves the last generated summary.
     */
    public getLastSummary(): ISemanticSummary | null {
        return this.lastSummary;
    }
}
