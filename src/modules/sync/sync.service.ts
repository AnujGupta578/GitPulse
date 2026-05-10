import { PrismaClient } from '@prisma/client';

export class SyncService {
    constructor(private prisma: PrismaClient) {}

    async getSyncJobs(repoId: string) {
        return this.prisma.syncJob.findMany({ 
            where: { repositoryId: repoId }, 
            orderBy: { startedAt: 'desc' }, 
            take: 20 
        });
    }

    async triggerSync(repoId: string, branchName: string, type: 'MANUAL' | 'INCREMENTAL' = 'MANUAL') {
        const job = await this.prisma.syncJob.create({
            data: {
                repositoryId: repoId,
                branchName,
                status: 'INDEXING',
                type,
                currentStep: 'INITIALIZING',
                progress: 0
            }
        });
        
        const { RepositorySyncPipeline } = await import('../../core/pipelines/RepositorySyncPipeline.js');
        // Fire and forget — long running background process
        new RepositorySyncPipeline(this.prisma).execute(job.id).catch(err => {
            console.error(`[SyncService] Pipeline execution failed for job ${job.id}:`, err?.message || err);
        });
        
        return job;
    }
}
