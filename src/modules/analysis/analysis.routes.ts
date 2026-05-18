import { type FastifyInstance } from 'fastify';
import { AnalysisService } from './analysis.service.js';
import { successResponse, errorResponse } from '../../common/response.js';

export async function analysisRoutes(fastify: FastifyInstance, options: AnalysisService) {
    const service = options;
    fastify.get('/api/repositories/:id/architecture', async (request: any) => {
        const { branch = 'main' } = request.query;
        const arch = await service.getArchitecture(request.params.id, branch);
        return successResponse(arch);
    });

    fastify.get('/api/repositories/:id/overview', async (request: any, reply) => {
        const { id } = request.params;
        const { branch = 'main' } = request.query;
        try {
            const overview = await service.getOverview(id, branch);
            if (!overview) return reply.status(404).send(errorResponse('Repository not found'));
            return successResponse(overview);
        } catch (error: any) {
            return reply.status(500).send(errorResponse(error.message));
        }
    });

    fastify.get('/api/repositories/:id/drift', async (request: any, reply) => {
        const { id } = request.params;
        const { source, target } = request.query;
        try {
            const drift = await service.getDrift(id, source, target);
            return successResponse(drift);
        } catch (error: any) {
            return reply.status(500).send(errorResponse(error.message));
        }
    });

    fastify.get('/api/repositories/:id/infrastructure', async (request: any) => {
        const { branch = 'main' } = request.query;
        const infra = await service.getInfrastructure(request.params.id, branch);
        return successResponse(infra);
    });

    fastify.get('/api/repositories/:id/dependencies', async (request: any) => {
        const { branch = 'main' } = request.query;
        const deps = await service.getDependencies(request.params.id, branch);
        return successResponse(deps);
    });

    fastify.get('/api/repositories/:id/risk', async (request: any) => {
        const { branch = 'main' } = request.query;
        const risk = await service.getRisk(request.params.id, branch);
        return successResponse(risk);
    });

    fastify.get('/api/repositories/:id/insights', async (request: any) => {
        const { branch = 'main' } = request.query;
        const insights = await service.getInsights(request.params.id, branch);
        return successResponse(insights);
    });

    fastify.get('/api/repositories/:id/commits', async (request: any) => {
        const { branch = 'main' } = request.query;
        const commits = await service.getCommits(request.params.id, branch);
        return successResponse(commits);
    });

    fastify.get('/api/repositories/:id/services', async (request: any) => {
        const { branch = 'main' } = request.query;
        const services = await service.getServices(request.params.id, branch);
        return successResponse(services);
    });

    fastify.get('/api/repositories/:id/activity', async (request: any) => {
        const activity = await service.getActivity(request.params.id);
        return successResponse(activity);
    });

    fastify.get('/api/repositories/:id/summary', async (request: any) => {
        const summary = await service.getSummary(request.params.id);
        return successResponse(summary);
    });
}
