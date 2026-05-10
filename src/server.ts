import 'dotenv/config';
import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';

import { MessageBus } from './core/bus/MessageBus.js';
import { AgentRegistry } from './core/registry/AgentRegistry.js';
import { AgentSwarmManager } from './core/agents/AgentSwarm.js';
import { TemporalWorkerService } from './core/workflow/TemporalWorker.js';

// Modular Imports
import { authRoutes } from './modules/auth/auth.routes.js';
import { gitRoutes } from './modules/git/git.routes.js';
import { webhookRoutes } from './modules/git/webhook.routes.js';
import { repositoryRoutes } from './modules/repository/repository.routes.js';
import { RepositoryService } from './modules/repository/repository.service.js';
import { analysisRoutes } from './modules/analysis/analysis.routes.js';
import { AnalysisService } from './modules/analysis/analysis.service.js';
import { syncRoutes } from './modules/sync/sync.routes.js';
import { SyncService } from './modules/sync/sync.service.js';
import { errorResponse } from './common/response.js';

class OrchestratorServer {
    private app: FastifyInstance;
    private prisma: PrismaClient;
    private bus: MessageBus;
    private registry: AgentRegistry;
    private swarmManager: AgentSwarmManager;

    constructor() {
        this.app = Fastify({ 
            logger: true,
            disableRequestLogging: false
        });
        this.prisma = new PrismaClient();
        this.bus = new MessageBus();
        this.registry = new AgentRegistry();
        this.swarmManager = new AgentSwarmManager(this.bus, this.registry);
    }

    public async bootstrap() {
        // Global Middlewares
        await this.app.register(cors, { origin: '*' });
        await this.app.register(websocket);

        // Global Error Handler (Phase 8)
        this.app.setErrorHandler((error, request, reply) => {
            // Log full error for debugging
            this.app.log.error({
                msg: error.message,
                stack: error.stack,
                path: request.url,
                method: request.method
            });

            if (error.validation) {
                return reply.status(400).send(errorResponse(error.message, { validation: error.validation }));
            }
            if (error.statusCode) {
                return reply.status(error.statusCode).send(errorResponse(error.message));
            }
            return reply.status(500).send(errorResponse('Internal Server Error'));
        });

        // Initialize Services
        this.swarmManager.initializeSwarm();

        const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const temporalWorker = new TemporalWorkerService(temporalAddress, 'agent-tasks');
        temporalWorker.start(this.registry).catch(err => this.app.log.error(err));

        // Register Modular Routes
        await this.registerModules();

        // Diagnostics (Phase 7)
        this.runDiagnostics();

        const port = process.env.PORT ? parseInt(process.env.PORT) : 8000;
        try {
            await this.app.listen({ port, host: '0.0.0.0' });
            this.app.log.info(`🚀 GitPulse API running on port ${port}`);
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }

    private async registerModules() {
        // Shared Services
        const repositoryService = new RepositoryService(this.prisma);
        const analysisService = new AnalysisService(this.prisma);
        const syncService = new SyncService(this.prisma);

        // Health
        this.app.get('/health', async () => ({
            status: 'ok',
            activeAgents: this.registry.getAllAgents().length
        }));

        // WebSocket
        this.app.register(async (fastify) => {
            fastify.get('/ws/stream', { websocket: true }, (connection) => {
                connection.socket.send(JSON.stringify({ type: 'connected', msg: 'GitPulse stream ready' }));
            });
        });

        // Modules
        await this.app.register(authRoutes, this.prisma);
        await this.app.register(gitRoutes, { 
            prisma: this.prisma, 
            triggerSync: this.triggerRepositorySync.bind(this) 
        });
        await this.app.register(webhookRoutes, this.prisma);
        await this.app.register(repositoryRoutes, repositoryService);
        await this.app.register(analysisRoutes, analysisService);
        await this.app.register(syncRoutes, syncService);
    }

    private runDiagnostics() {
        const routes = this.app.printRoutes();
        this.app.log.info('Route Registry Diagnostics complete');
        // Simple duplicate detection is built into Fastify (it throws), 
        // but we could scan the routes here if we wanted custom warnings.
    }

    private async triggerRepositorySync(userId: string, accessToken: string) {
        const { GitHubAdapter } = await import('./core/git/GitHubAdapter.js');
        const github = new GitHubAdapter();
        let ws = await this.prisma.workspace.findFirst({ where: { userId } });
        if (!ws) ws = await this.prisma.workspace.create({ data: { userId, name: 'My Workspace' } });
        
        const repos = await github.fetchAllRepositories(accessToken);
        for (const repo of repos) {
            const compositeId = `${ws.id}-${repo.id}`;
            const r = await this.prisma.repository.upsert({
                where: { id: compositeId },
                update: { name: repo.name, url: repo.url, defaultBranch: repo.defaultBranch, isPrivate: repo.isPrivate, owner: repo.owner, lastSyncedAt: new Date() },
                create: { id: compositeId, workspaceId: ws.id, name: repo.name, provider: 'GITHUB', providerRepoId: repo.id, url: repo.url, defaultBranch: repo.defaultBranch, isPrivate: repo.isPrivate, owner: repo.owner, connectionStatus: 'PENDING' }
            });
            try {
                const branches = await github.fetchBranches(accessToken, repo.owner, repo.name);
                for (const branch of branches) {
                    await this.prisma.repositoryBranch.upsert({
                        where: { repositoryId_name: { repositoryId: r.id, name: branch.name } },
                        update: { sha: branch.sha, isDefault: branch.name === repo.defaultBranch },
                        create: { repositoryId: r.id, name: branch.name, sha: branch.sha, isDefault: branch.name === repo.defaultBranch }
                    });
                }
            } catch {}
        }
    }
}

const server = new OrchestratorServer();
server.bootstrap();
