import { PrismaClient } from '@prisma/client';
import { GitHubAdapter } from '../git/GitHubAdapter.js';
import { CommitIntentAgent } from '../agents/CommitIntentAgent.js';

export class CommitIngestionPipeline {
    constructor(private prisma: PrismaClient, private github: GitHubAdapter) {}

    async execute(repoId: string, accessToken: string, owner: string, repoName: string, branchName: string) {
        const commits = await this.github.fetchCommits(accessToken, owner, repoName, branchName);
        
        // Trigger Intelligence Analysis
        const intentAgent = new CommitIntentAgent();
        const analysisResult = await intentAgent.execute({
            id: `commit-analysis-${Date.now()}`,
            agentName: 'CommitIntentAgent',
            payload: { commits }
        });

        const analysisMap = new Map();
        if (analysisResult.status === 'COMPLETED') {
            analysisResult.output.analyzedCommits.forEach((ac: any) => {
                analysisMap.set(ac.sha, ac);
            });
        }

        for (const c of commits) {
            const analysis = analysisMap.get(c.sha) || {};
            await this.prisma.commit.upsert({
                where: { repositoryId_sha: { repositoryId: repoId, sha: c.sha } },
                update: { 
                    author: c.author, 
                    message: c.message, 
                    timestamp: new Date(c.timestamp),
                    intentSummary: analysis.intentSummary,
                    riskScore: analysis.riskScore,
                    archImpactScore: analysis.archImpactScore
                },
                create: { 
                    repositoryId: repoId, 
                    sha: c.sha, 
                    author: c.author, 
                    message: c.message, 
                    timestamp: new Date(c.timestamp),
                    intentSummary: analysis.intentSummary,
                    riskScore: analysis.riskScore,
                    archImpactScore: analysis.archImpactScore
                }
            });
        }
        return commits;
    }
}
