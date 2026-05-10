import { PrismaClient } from '@prisma/client';
import { InfrastructureAgent } from '../agents/InfrastructureAgent.js';

export class InfrastructurePipeline {
    constructor(private prisma: PrismaClient) {}

    async execute(repoId: string, branchId: string, commitSha: string, infraFiles: { path: string; content: string }[]) {
        const agent = new InfrastructureAgent();
        const result = await agent.execute({
            id: `infra-${Date.now()}`,
            agentName: 'InfrastructureAgent',
            payload: { repoId, infraFiles }
        });

        if (result.status === 'COMPLETED') {
            await this.prisma.infrastructureSnapshot.create({
                data: {
                    branchId,
                    commitSha,
                    resources: result.output.resources
                }
            });
        }
        return result;
    }
}
