import { GitHubAdapter } from '../git/GitHubAdapter.js';
import type { GitProviderAdapter } from '../git/GitProviderAdapter.js';
import { PrismaClient } from '@prisma/client';
import { MessageBus } from '../bus/MessageBus.js';

export class RepositoryConnectionService {
    private prisma: PrismaClient;
    private bus: MessageBus;

    constructor(prisma: PrismaClient, bus: MessageBus) {
        this.prisma = prisma;
        this.bus = bus;
    }

    /**
     * Connects a Git provider account to a workspace.
     */
    async connectProvider(workspaceId: string, providerType: 'GITHUB' | 'GITLAB', token: string): Promise<void> {
        // In a real implementation, we would encrypt and store the token in a secure vault/DB.
        // For now, we simulate an adapter validation.
        let adapter: GitProviderAdapter;
        
        if (providerType === 'GITHUB') {
            adapter = new GitHubAdapter();
        } else {
            throw new Error(`Provider ${providerType} not supported yet.`);
        }

        const isValid = await adapter.authenticate(token);
        if (!isValid) {
            throw new Error("Invalid provider token.");
        }

        // Publish event for audit log
        this.bus.publish('system-logs', {
            id: `evt-${Date.now()}`,
            type: 'PROVIDER_CONNECTED',
            payload: { workspaceId, providerType }
        });
    }

    /**
     * Imports selected repositories into the workspace and schedules an initial index.
     */
    async importRepositories(workspaceId: string, provider: string, repos: any[]): Promise<void> {
        for (const repo of repos) {
            // Save to DB
            const savedRepo = await this.prisma.repository.create({
                data: {
                    workspaceId,
                    name: repo.name,
                    provider,
                    providerRepoId: repo.id,
                    url: repo.url,
                    defaultBranch: repo.defaultBranch,
                    isPrivate: repo.isPrivate,
                    connectionStatus: 'CONNECTED'
                }
            });

            // Trigger AST analysis workflow via Temporal / Message Bus
            this.bus.publish('agent-tasks', {
                id: `sync-${savedRepo.id}`,
                type: 'TRIGGER_INDEXING',
                payload: { repositoryId: savedRepo.id }
            });
        }
    }
}
