import { type FastifyInstance } from 'fastify';
import { SyncService } from './sync.service.js';
import { successResponse } from '../../common/response.js';

export async function syncRoutes(fastify: FastifyInstance, options: SyncService) {
    const service = options;
    fastify.get('/api/repositories/:id/sync-jobs', async (request: any) => {
        const jobs = await service.getSyncJobs(request.params.id);
        return successResponse(jobs);
    });

    fastify.post('/api/repositories/:id/branches/:branch/sync', async (request: any) => {
        const { id, branch } = request.params;
        const job = await service.triggerSync(id, branch, 'MANUAL');
        return successResponse(job);
    });
}
