import { PrismaClient } from '@prisma/client';

export class RepositoryService {
    constructor(private prisma: PrismaClient) {}

    async getStats() {
        const [total, connected, syncing] = await Promise.all([
            this.prisma.repository.count(),
            this.prisma.repository.count({ where: { connectionStatus: 'CONNECTED' } }),
            this.prisma.syncJob.count({ where: { status: 'RUNNING' } })
        ]);
        return { total, connected, syncing };
    }

    async listRepositories(options: { search?: string; skip: number; take: number }) {
        const where = options.search 
            ? { OR: [{ name: { contains: options.search, mode: 'insensitive' as const } }, { url: { contains: options.search, mode: 'insensitive' as const } }] } 
            : {};
        
        const [items, total] = await Promise.all([
            this.prisma.repository.findMany({ 
                where, 
                skip: options.skip, 
                take: options.take, 
                orderBy: { updatedAt: 'desc' }, 
                include: { 
                    branches: true, 
                    syncJobs: { orderBy: { startedAt: 'desc' }, take: 1 } 
                } 
            }),
            this.prisma.repository.count({ where })
        ]);

        return { items, total };
    }

    async getById(id: string) {
        return this.prisma.repository.findUnique({ 
            where: { id }, 
            include: { 
                branches: true, 
                syncJobs: { orderBy: { startedAt: 'desc' }, take: 5 } 
            } 
        });
    }

    async getOverview(id: string, branchName: string = 'main') {
        const [repo, repoBranch, recentCommits, syncJobs] = await Promise.all([
            this.prisma.repository.findUnique({ 
                where: { id },
                include: { branches: true }
            }),
            this.prisma.repositoryBranch.findFirst({
                where: { repositoryId: id, name: branchName },
                include: { syncMetadata: true }
            }),
            this.prisma.commit.findMany({
                where: { repositoryId: id },
                orderBy: { timestamp: 'desc' },
                take: 10
            }),
            this.prisma.syncJob.findMany({
                where: { repositoryId: id },
                orderBy: { startedAt: 'desc' },
                take: 5
            })
        ]);

        if (!repo) return null;

        const latestArch = repoBranch ? await this.prisma.architectureSnapshot.findFirst({
            where: { branchId: repoBranch.id },
            orderBy: { createdAt: 'desc' }
        }) : null;

        const latestInfra = repoBranch ? await this.prisma.infrastructureSnapshot.findFirst({
            where: { branchId: repoBranch.id },
            orderBy: { createdAt: 'desc' }
        }) : null;

        const latestDeps = repoBranch ? await this.prisma.dependencySnapshot.findFirst({
            where: { branchId: repoBranch.id },
            orderBy: { createdAt: 'desc' }
        }) : null;

        const velocity: any[] = await this.prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('day', timestamp) as day, 
                COUNT(*) as count 
            FROM "Commit" 
            WHERE "repositoryId" = ${id} 
            AND timestamp > NOW() - INTERVAL '14 days'
            GROUP BY day 
            ORDER BY day ASC
        `;

        const metrics = {
            indexedCommits: await this.prisma.commit.count({ where: { repositoryId: id } }),
            componentCount: (latestArch?.topology as any)?.nodes?.length || 0,
            serviceCount: (latestArch?.topology as any)?.nodes?.filter((n: any) => n.type === 'service').length || 0,
            infraAssets: (latestInfra?.resources as any[])?.length || 0,
            dependencyCount: (latestDeps?.stats as any)?.total || 0,
            syncStatus: repoBranch?.syncStatus || 'NOT_SYNCED',
            lastSync: repoBranch?.updatedAt,
            couplingScore: (latestArch?.metrics as any)?.couplingScore || 0,
            layerIntegrity: (latestArch?.metrics as any)?.layerIntegrity || 0
        };

        return {
            repository: repo,
            branch: repoBranch,
            syncStatus: {
                current: repoBranch?.syncStatus || 'PENDING',
                jobs: syncJobs,
                isSyncing: syncJobs.some(j => j.status === 'RUNNING' || j.status === 'INDEXING')
            },
            metrics,
            architectureSnapshot: latestArch,
            recentCommits,
            velocity,
            topology: latestArch?.topology ? {
                nodes: (latestArch.topology as any).nodes?.slice(0, 10) || [],
                edges: (latestArch.topology as any).edges?.slice(0, 10) || [],
                totalNodes: (latestArch.topology as any).nodes?.length || 0
            } : null,
            aiInsights: {
                summary: latestArch?.summary || "Analysis pending. Trigger a sync to generate architectural insights.",
                readiness: repoBranch?.syncStatus === 'READY' ? 'COMPLETE' : 'INCOMPLETE'
            }
        };
    }

    async getBranches(id: string) {
        return this.prisma.repositoryBranch.findMany({ 
            where: { repositoryId: id }, 
            include: { syncMetadata: true },
            orderBy: { isDefault: 'desc' } 
        });
    }

    async getSettings(id: string) {
        const repo = await this.prisma.repository.findUnique({ where: { id } });
        const defaultSettings = {
            autoSync: true,
            retentionDays: 30,
            indexingRules: {
                branchPattern: 'main, master, release/*',
                excludePaths: 'node_modules, vendor, dist',
                maxFileSize: 5242880 // 5MB
            },
            agents: {
                architecture: true,
                infra: true,
                commits: true,
                dependencies: true
            }
        };
        
        return {
            ...defaultSettings,
            ...(repo?.settings as any || {})
        };
    }

    async updateSettings(id: string, settings: any) {
        return this.prisma.repository.update({ where: { id }, data: { settings } });
    }
}
