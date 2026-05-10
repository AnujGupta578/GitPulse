import { type FastifyInstance } from 'fastify';
import { type PrismaClient } from '@prisma/client';
import { createHmac } from 'crypto';
import { successResponse, errorResponse } from '../../common/response.js';

export async function webhookRoutes(fastify: FastifyInstance, options: PrismaClient) {
    const prisma = options;
    fastify.post('/api/webhooks/github', async (request: any, reply) => {
        const signature = request.headers['x-hub-signature-256'];
        const event = request.headers['x-github-event'];
        const payload: any = request.body;
        
        if (!payload?.repository) return reply.status(400).send(errorResponse('Invalid payload'));
        
        const repo = await prisma.repository.findFirst({
            where: { name: payload.repository.name, owner: payload.repository.owner.login },
            include: { webhooks: true }
        });
        
        if (!repo || repo.webhooks.length === 0) return reply.status(404).send(errorResponse('Repository or Webhook not found'));
        
        const hmac = createHmac('sha256', repo.webhooks[0].secret);
        const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
        
        if (signature !== digest) return reply.status(401).send(errorResponse('Invalid signature'));

        if (event === 'push') {
            const branchName = payload.ref.replace('refs/heads/', '');
            const job = await prisma.syncJob.create({ 
                data: { 
                    repositoryId: repo.id, 
                    branchName, 
                    status: 'INDEXING', 
                    type: 'INCREMENTAL',
                    currentStep: 'INITIALIZING',
                    progress: 0
                } 
            });
            const { RepositorySyncPipeline } = await import('../../core/pipelines/RepositorySyncPipeline.js');
            new RepositorySyncPipeline(prisma).execute(job.id).catch(err => fastify.log.error(err));
        }
        
        return successResponse({ status: 'OK' });
    });
}
