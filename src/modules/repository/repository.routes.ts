import { type FastifyInstance } from 'fastify';
import { RepositoryService } from './repository.service.js';
import { successResponse, errorResponse } from '../../common/response.js';
import { PaginationSchema } from '../../schemas/repository.schema.js';

export async function repositoryRoutes(fastify: FastifyInstance, options: RepositoryService) {
    const service = options;
    fastify.get('/api/repositories/stats', async () => {
        const stats = await service.getStats();
        return successResponse(stats);
    });

    fastify.get('/api/repositories', async (request: any, reply) => {
        try {
            const { search, page, limit } = PaginationSchema.parse(request.query);
            const skip = (page - 1) * limit;
            const take = limit;
            
            const { items, total } = await service.listRepositories({ search, skip, take });
            return successResponse(items, { 
                pagination: { page, limit, total, pages: Math.ceil(total / limit) } 
            });
        } catch (error: any) {
            return reply.status(400).send(errorResponse(error.message));
        }
    });

    fastify.get('/api/repositories/:id', async (request: any, reply) => {
        const repo = await service.getById(request.params.id);
        if (!repo) return reply.status(404).send(errorResponse('Repository not found'));
        return successResponse(repo);
    });


    fastify.get('/api/repositories/:id/branches', async (request: any) => {
        const branches = await service.getBranches(request.params.id);
        return successResponse(branches);
    });

    fastify.get('/api/repositories/:id/settings', async (request: any) => {
        const settings = await service.getSettings(request.params.id);
        return successResponse(settings);
    });

    fastify.patch('/api/repositories/:id/settings', async (request: any) => {
        const settings = await service.updateSettings(request.params.id, request.body);
        return successResponse(settings);
    });
}
