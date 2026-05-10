import { BaseAgent, type AgentTask, type AgentResult } from './BaseAgent.js';

export class CommitIntentAgent extends BaseAgent {
    constructor() {
        super('CommitIntentAgent', 'Analyzes commit diffs and modified files to synthesize intent, risk, and architectural impact.');
    }

    async execute(task: AgentTask): Promise<AgentResult> {
        const { commits } = task.payload;
        this.log(`Deep analyzing ${commits.length} commits with file-level context.`);

        const analyzedCommits = commits.map((c: any) => {
            const msg = c.message.toLowerCase();
            const files = c.files || [];
            
            let riskScore = 1.0;
            let archImpact = 1.0;
            let intent = "Routine maintenance or documentation update.";
            let services: string[] = [];

            // 1. Analyze by keywords (Fallback)
            if (msg.includes('refactor') || msg.includes('decouple')) {
                riskScore = 3.5;
                archImpact = 7.0;
                intent = "Structural refactoring to improve modularity.";
            }

            // 2. Analyze by modified files (Real Data)
            const hasInfra = files.some((f: any) => f.filename.includes('docker') || f.filename.includes('.tf') || f.filename.includes('k8s'));
            const hasDatabase = files.some((f: any) => f.filename.includes('prisma') || f.filename.includes('sql') || f.filename.includes('migration'));
            const hasCore = files.some((f: any) => f.filename.includes('src/core') || f.filename.includes('src/server'));
            
            if (hasInfra) {
                archImpact = Math.max(archImpact, 8.0);
                riskScore = Math.max(riskScore, 6.0);
                intent = "Infrastructure modification affecting deployment topology.";
            }
            if (hasDatabase) {
                riskScore = Math.max(riskScore, 9.0);
                intent = "Data schema modification. High risk of breaking changes.";
            }
            if (hasCore) {
                archImpact = Math.max(archImpact, 5.0);
                riskScore = Math.max(riskScore, 4.0);
                if (intent.includes('Routine')) intent = "Core logic update affecting primary business orchestration.";
            }

            // 3. Sensitivity to volume
            const totalChanges = files.reduce((acc: number, f: any) => acc + (f.changes || 0), 0);
            if (totalChanges > 500) {
                riskScore = Math.min(10.0, riskScore + 2.0);
            }

            return {
                sha: c.sha,
                intentSummary: intent,
                riskScore,
                archImpactScore: archImpact,
                affectedServices: services
            };
        });

        return {
            status: 'COMPLETED',
            output: { analyzedCommits }
        };
    }
}
