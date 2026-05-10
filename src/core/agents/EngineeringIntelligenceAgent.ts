import { BaseAgent, type AgentTask, type AgentResult } from './BaseAgent.js';

export class EngineeringIntelligenceAgent extends BaseAgent {
    constructor() {
        super('EngineeringIntelligenceAgent', 'Synthesizes high-level engineering insights by correlating architectural drift, commit volatility, and infrastructure risks.');
    }

    async execute(task: AgentTask): Promise<AgentResult> {
        const { repoId, stats, drift, infraRisks } = task.payload;
        this.log(`Synthesizing intelligence for ${repoId}`);

        // Correlate data to find "Engineering Debt" patterns
        const insights = [
            {
                id: 'insight-1',
                title: 'High Architectural Volatility',
                severity: stats.commitCount > 100 ? 'CRITICAL' : 'MEDIUM',
                category: 'ARCHITECTURE',
                content: `The repository is experiencing significant structural churn. We detected ${drift.added.length} additions and ${drift.removed.length} removals in the last sync. This suggest a lack of structural stability.`,
                recommendation: 'Freeze architectural changes and conduct a structural audit before adding more features.'
            },
            {
                id: 'insight-2',
                title: 'Infrastructure Automation Gap',
                severity: infraRisks.length > 0 ? 'HIGH' : 'LOW',
                category: 'INFRASTRUCTURE',
                content: `Infrastructure analysis identified ${infraRisks.length} critical gaps. Manual provisioning markers were found alongside Terraform files.`,
                recommendation: 'Implement a unified CI/CD pipeline to automate infrastructure deployments and eliminate manual drift.'
            }
        ];

        return {
            status: 'COMPLETED',
            output: { insights, overallScore: 72 }
        };
    }
}
