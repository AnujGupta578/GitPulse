import { PrismaClient } from '@prisma/client';
import { DependencyAgent } from '../agents/DependencyAgent.js';

export class DependencyPipeline {
    constructor(private prisma: PrismaClient) {}

    async execute(branchId: string, commitSha: string, payload: { depFiles: any[] }) {
        const agent = new DependencyAgent();
        const result = await agent.execute({
            id: `dep-${Date.now()}`,
            agentName: 'DependencyAgent',
            payload
        });

        if (result.status === 'COMPLETED') {
            await this.prisma.dependencySnapshot.create({
                data: {
                    branchId,
                    commitSha,
                    dependencies: result.output.dependencies,
                    stats: result.output.stats
                }
            });
        }
        return result;
    }
}
