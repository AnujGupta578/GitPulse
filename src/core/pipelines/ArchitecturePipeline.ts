import { PrismaClient } from '@prisma/client';
import { ArchitectureAgent } from '../agents/ArchitectureAgent.js';

export class ArchitecturePipeline {
    constructor(private prisma: PrismaClient) {}

    async execute(repoId: string, branchId: string, commitSha: string, payload: any) {
        const agent = new ArchitectureAgent();
        const result = await agent.execute({
            id: `arch-${Date.now()}`,
            agentName: 'ArchitectureAgent',
            payload
        });

        if (result.status === 'COMPLETED') {
            await this.prisma.architectureSnapshot.create({
                data: {
                    branchId,
                    commitSha,
                    topology: result.output.topology,
                    metrics: result.output.metrics,
                    summary: result.output.summary
                }
            });
        }
        return result;
    }
}
