import { PrismaClient } from '@prisma/client';
import { TestGenerator } from './test-generator.js';
import { WorkflowExporter } from './workflow-exporter.js';

export class AnalysisService {
    constructor(private prisma: PrismaClient) { }

    private async resolveBranch(repoId: string, branchName: string): Promise<any> {
        let b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
        if (!b) {
            const repo = await this.prisma.repository.findUnique({ where: { id: repoId }, include: { branches: true } });
            if (repo) {
                const fallbackName = repo.defaultBranch || (repo.branches[0]?.name) || 'main';
                b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: fallbackName } });
            }
        }
        return b;
    }

    async getArchitecture(repoId: string, branchName: string = 'main') {
        const b = await this.resolveBranch(repoId, branchName);
        const defaultShape = {
            topology: { nodes: [], edges: [] },
            metrics: { services: 0, modules: 0, couplingScore: 0, dependencyCount: 0 },
            status: 'NOT_INDEXED'
        };

        if (!b) return defaultShape;
        const s = await this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return defaultShape;

        return {
            topology: (s.topology as any) || defaultShape.topology,
            metrics: (s.metrics as any) || defaultShape.metrics,
            status: 'READY'
        };
    }

    async getDrift(repoId: string, source: string, target: string) {
        try {
            if (!source || !target) {
                return { status: 'MISSING_PARAMS', message: 'Both source and target branches must be specified.' };
            }

            if (source === target) {
                return { status: 'IDENTICAL', message: 'Source and target branches are identical. No drift detected.' };
            }

            const [sBranch, tBranch] = await Promise.all([
                this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: source } }),
                this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: target } })
            ]);

            if (!sBranch) return { status: 'SOURCE_NOT_FOUND', message: `Source branch "${source}" not found.` };
            if (!tBranch) return { status: 'TARGET_NOT_FOUND', message: `Target branch "${target}" not found.` };

            const [sSnap, tSnap, sDeps, tDeps] = await Promise.all([
                this.prisma.architectureSnapshot.findFirst({ where: { branchId: sBranch.id }, orderBy: { createdAt: 'desc' } }),
                this.prisma.architectureSnapshot.findFirst({ where: { branchId: tBranch.id }, orderBy: { createdAt: 'desc' } }),
                this.prisma.dependencySnapshot.findFirst({ where: { branchId: sBranch.id }, orderBy: { createdAt: 'desc' } }),
                this.prisma.dependencySnapshot.findFirst({ where: { branchId: tBranch.id }, orderBy: { createdAt: 'desc' } })
            ]);

            if (!sSnap || !tSnap) {
                return {
                    status: 'NOT_INDEXED',
                    message: "One or both branches have not been analyzed yet. Please run a sync for both branches to enable drift detection."
                };
            }

            // 1. Topology Drift
            const sn = (sSnap.topology as any)?.nodes || [];
            const tn = (tSnap.topology as any)?.nodes || [];
            const se = (sSnap.topology as any)?.edges || [];
            const te = (tSnap.topology as any)?.edges || [];

            const addedNodes = tn.filter((x: any) => !sn.find((y: any) => y.id === x.id));
            const removedNodes = sn.filter((x: any) => !tn.find((y: any) => y.id === x.id));
            const modifiedNodes = tn.filter((x: any) => {
                const y = sn.find((z: any) => z.id === x.id);
                return y && (JSON.stringify(y) !== JSON.stringify(x));
            });

            const addedEdges = te.filter((x: any) => !se.find((y: any) => (y.source === x.source && y.target === x.target)));
            const removedEdges = se.filter((x: any) => !te.find((y: any) => (y.source === x.source && y.target === x.target)));

            // 2. Dependency Drift
            const sd = (sDeps?.dependencies as any[]) || [];
            const td = (tDeps?.dependencies as any[]) || [];

            const addedDeps = td.filter(x => !sd.find(y => y.name === x.name));
            const upgradedDeps = td.filter(x => {
                const y = sd.find(z => z.name === x.name);
                return y && y.version !== x.version;
            }).map(x => ({
                name: x.name,
                from: sd.find(z => z.name === x.name).version,
                to: x.version
            }));

            const driftScore = (addedNodes.length * 10) + (removedNodes.length * 10) + (modifiedNodes.length * 5) + (upgradedDeps.length * 2);

            return {
                status: 'READY',
                sourceBranch: source,
                targetBranch: target,
                summary: `Architecture drift detected: ${addedNodes.length} added, ${removedNodes.length} removed, ${modifiedNodes.length} modified nodes.`,
                topologyChanges: {
                    added: addedNodes,
                    removed: removedNodes,
                    modified: modifiedNodes,
                    addedEdges: addedEdges.length,
                    removedEdges: removedEdges.length
                },
                dependencyChanges: {
                    added: addedDeps,
                    upgraded: upgradedDeps
                },
                driftScore: Math.min(100, driftScore),
                riskDelta: driftScore > 50 ? 'HIGH' : driftScore > 20 ? 'MEDIUM' : 'LOW',
                timestamp: new Date().toISOString()
            };
        } catch (error: any) {
            console.error(`[AnalysisService] getDrift FAILED:`, error);
            throw error; // Let fastify handle 500 but log it
        }
    }

    async getInfrastructure(repoId: string, branchName: string = 'main') {
        const b = await this.resolveBranch(repoId, branchName);
        if (!b) return [];
        const s = await this.prisma.infrastructureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return [];
        return (s.resources as any[]) || [];
    }

    async getDependencies(repoId: string, branchName: string = 'main') {
        const b = await this.resolveBranch(repoId, branchName);
        const defaultShape = { dependencies: [], stats: { total: 0, vulnerable: 0, outdated: 0 } };
        if (!b) return defaultShape;
        const s = await this.prisma.dependencySnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return defaultShape;
        return {
            dependencies: (s.dependencies as any[]) || [],
            stats: (s.stats as any) || defaultShape.stats
        };
    }

    async getRisk(repoId: string, branchName: string = 'main') {
        const b = await this.resolveBranch(repoId, branchName);
        if (!b) return { summary: { overallScore: 0, level: 'LOW', factors: [] }, vectors: { commits: [], architecture: {} } };

        const [latestArch, highRiskCommits] = await Promise.all([
            this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.commit.findMany({
                where: { repositoryId: repoId, riskScore: { gte: 7.0 } },
                orderBy: { timestamp: 'desc' },
                take: 5
            })
        ]);

        const coupling = (latestArch?.metrics as any)?.couplingScore || 0;
        const integrity = (latestArch?.metrics as any)?.layerIntegrity || 100;
        const overallScore = (coupling + (100 - integrity) + (highRiskCommits.length * 10)) / 3;

        return {
            summary: {
                overallScore,
                level: overallScore > 70 ? 'HIGH' : overallScore > 40 ? 'MEDIUM' : 'LOW',
                factors: [
                    { label: 'Structural Coupling', score: Math.round(coupling) },
                    { label: 'Layer Integrity', score: Math.round(integrity) },
                    { label: 'Commit Volatility', score: Math.min(100, highRiskCommits.length * 20) }
                ]
            },
            vectors: {
                commits: highRiskCommits,
                architecture: {
                    summary: latestArch?.summary,
                    timestamp: latestArch?.createdAt
                }
            }
        };
    }

    async getInsights(repoId: string, branchName: string = 'main') {
        const b = await this.resolveBranch(repoId, branchName);
        if (!b) return { insights: [], overallScore: 0, status: 'NOT_INDEXED' };

        // Prefer real LLM-generated insights if they exist
        const storedInsights = await this.prisma.engineeringInsight.findMany({ where: { branchId: b.id } });

        if (storedInsights.length > 0) {
            const score = Math.max(30, 100 - (storedInsights.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL').length * 10));
            return { insights: storedInsights, overallScore: score, status: 'READY' };
        }

        // Fallback: Generate rule-based insights from real data
        const [latestArch, latestDeps, highRiskCommits, totalCommits] = await Promise.all([
            this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.dependencySnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.commit.findMany({ where: { repositoryId: repoId, riskScore: { gte: 7.0 } }, take: 10 }),
            this.prisma.commit.count({ where: { repositoryId: repoId } })
        ]);

        if (totalCommits === 0) {
            return { insights: [], overallScore: 0, status: 'NOT_INDEXED' };
        }

        const ruleInsights: any[] = [];
        const coupling = (latestArch?.metrics as any)?.couplingScore || 0;
        const nodeCount = (latestArch?.topology as any)?.nodes?.length || 0;
        const depStats = latestDeps?.stats as any;

        if (highRiskCommits.length > 0) {
            ruleInsights.push({
                id: 'rule-high-risk-commits',
                title: `${highRiskCommits.length} High-Risk Commit${highRiskCommits.length > 1 ? 's' : ''} Detected`,
                content: `Analysis of commit history identified ${highRiskCommits.length} commits with risk scores ≥ 7.0/10. These include changes to infrastructure configs, database schemas, or core orchestration logic that carry elevated failure probability.`,
                recommendation: 'Review each flagged commit in the Commits view. Consider adding branch protection rules and requiring additional review for high-impact file paths.',
                severity: highRiskCommits.length > 3 ? 'HIGH' : 'MEDIUM',
                category: 'ARCHITECTURE',
                createdAt: new Date()
            });
        }

        if (coupling > 50) {
            ruleInsights.push({
                id: 'rule-high-coupling',
                title: 'Elevated Structural Coupling Detected',
                content: `Architecture analysis shows a coupling score of ${coupling.toFixed(1)}% — above the recommended threshold of 50%. This indicates significant interdependencies between modules that may impair independent deployability.`,
                recommendation: 'Identify the highest-degree nodes in the architecture graph and evaluate whether their responsibilities can be split or their interfaces can be contracted.',
                severity: coupling > 75 ? 'HIGH' : 'MEDIUM',
                category: 'ARCHITECTURE',
                createdAt: new Date()
            });
        }

        if (depStats?.vulnerable > 0) {
            ruleInsights.push({
                id: 'rule-vulnerable-deps',
                title: `${depStats.vulnerable} Vulnerable Dependenc${depStats.vulnerable > 1 ? 'ies' : 'y'} Found`,
                content: `Supply chain analysis identified ${depStats.vulnerable} package${depStats.vulnerable > 1 ? 's' : ''} with known security vulnerabilities. These require immediate attention to prevent potential security breaches.`,
                recommendation: 'Run `npm audit fix` or manually upgrade flagged packages to their patched versions. Review the Dependencies tab for the full list.',
                severity: 'CRITICAL',
                category: 'SECURITY',
                createdAt: new Date()
            });
        }

        if (nodeCount > 0 && depStats?.outdated > 5) {
            ruleInsights.push({
                id: 'rule-outdated-deps',
                title: `Technical Debt: ${depStats.outdated} Outdated Packages`,
                content: `Dependency snapshot shows ${depStats.outdated} packages are using pinned or outdated versions. Lagging behind upstream releases accumulates security exposure and increases future migration cost.`,
                recommendation: 'Adopt a scheduled dependency update cadence. Consider using Dependabot or Renovate for automated PR generation.',
                severity: 'LOW',
                category: 'PERFORMANCE',
                createdAt: new Date()
            });
        }

        if (ruleInsights.length === 0) {
            ruleInsights.push({
                id: 'rule-clean-bill',
                title: 'Repository Health: Good Standing',
                content: `Analysis of ${totalCommits} commits, ${nodeCount} architecture components, and dependency manifests shows no critical issues. Coupling is within acceptable bounds and no high-severity commit patterns detected.`,
                recommendation: 'Continue maintaining current code quality standards. Set up automated architecture drift alerts for future changes.',
                severity: 'LOW',
                category: 'ARCHITECTURE',
                createdAt: new Date()
            });
        }

        const criticalCount = ruleInsights.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
        const overallScore = Math.max(20, 100 - (criticalCount * 15) - (highRiskCommits.length * 3));

        return { insights: ruleInsights, overallScore, status: 'RULE_BASED' };
    }

    async getCommits(repoId: string, branchName?: string) {
        // Commits are stored by repositoryId; filter by timestamp window of the sync job for this branch
        // if branch is specified, try to scope by branch context (commits ingested for that branch)
        return this.prisma.commit.findMany({
            where: { repositoryId: repoId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
    }

    async getServices(repoId: string, branchName: string = 'main') {
        // Services are derived from architecture topology nodes of type service/gateway
        const b = await this.resolveBranch(repoId, branchName);
        if (!b) return [];
        const s = await this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return [];
        const nodes = (s.topology as any)?.nodes || [];
        return nodes.filter((n: any) => n.type === 'service' || n.type === 'gateway' || n.type === 'module');
    }

    async getActivity(repoId: string) {
        return this.prisma.commit.findMany({ where: { repositoryId: repoId }, orderBy: { timestamp: 'desc' }, take: 20 });
    }

    async getOverview(id: string, branchName: string = 'main') {
        const repo = await this.prisma.repository.findUnique({ where: { id }, include: { branches: true } });
        if (!repo) return null;

        const repoBranch = await this.resolveBranch(id, branchName);
        if (!repoBranch) return { status: 'NOT_INDEXED', message: `Branch "${branchName}" has not been tracked yet.` };

        const [latestArch, latestInfra, latestDeps, recentCommits, syncJobs] = await Promise.all([
            this.prisma.architectureSnapshot.findFirst({ where: { branchId: repoBranch.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.infrastructureSnapshot.findFirst({ where: { branchId: repoBranch.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.dependencySnapshot.findFirst({ where: { branchId: repoBranch.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.commit.findMany({ where: { repositoryId: id }, orderBy: { timestamp: 'desc' }, take: 10 }),
            this.prisma.syncJob.findMany({ where: { repositoryId: id, branchName }, orderBy: { startedAt: 'desc' }, take: 5 })
        ]);

        const branchSyncStatus = String(repoBranch.syncStatus || '');
        if (!latestArch && !branchSyncStatus) {
            return { status: 'NOT_INDEXED', message: "Branch has not been analyzed yet" };
        }

        const commitsForVelocity = await this.prisma.commit.findMany({
            where: {
                repositoryId: id,
                timestamp: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
            },
            select: { timestamp: true }
        });

        const velocityMap: Record<string, number> = {};
        commitsForVelocity.forEach(c => {
            const day = c.timestamp.toISOString().split('T')[0] as string;
            velocityMap[day] = (velocityMap[day] || 0) + 1;
        });

        const velocity = Object.entries(velocityMap).map(([day, count]) => ({ day, count }));

        const metrics = {
            indexedCommits: await this.prisma.commit.count({ where: { repositoryId: id } }),
            componentCount: (latestArch?.topology as any)?.nodes?.length || 0,
            serviceCount: (latestArch?.topology as any)?.nodes?.filter((n: any) => n.type === 'service' || n.type === 'gateway').length || 0,
            infraAssets: (latestInfra?.resources as any[])?.length || 0,
            dependencyCount: (latestDeps?.stats as any)?.total || 0,
            lastSync: repoBranch.updatedAt,
            couplingScore: (latestArch?.metrics as any)?.couplingScore || 0,
            layerIntegrity: (latestArch?.metrics as any)?.layerIntegrity || 0
        };

        const topStatus = branchSyncStatus === 'READY' ? 'READY' : (branchSyncStatus ? 'INDEXING' : 'NOT_INDEXED');

        return {
            status: topStatus,
            repository: repo,
            branch: repoBranch,
            syncStatus: {
                current: branchSyncStatus || 'PENDING',
                jobs: syncJobs,
                isSyncing: syncJobs.some((j: any) => j.status === 'RUNNING' || j.status === 'INDEXING')
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
                readiness: branchSyncStatus === 'READY' ? 'COMPLETE' : 'INCOMPLETE'
            }
        };
    }
    async getSummary(repoId: string) {
        const [repo, commits, branches] = await Promise.all([
            this.prisma.repository.findUnique({ where: { id: repoId }, include: { branches: true } }),
            this.prisma.commit.count({ where: { repositoryId: repoId } }),
            this.prisma.repositoryBranch.findMany({ where: { repositoryId: repoId } })
        ]);

        if (!repo) return null;

        const latestSnapshot = await this.prisma.architectureSnapshot.findFirst({
            where: { branch: { repositoryId: repoId } },
            orderBy: { createdAt: 'desc' }
        });

        return {
            repository: repo,
            commitCount: commits,
            branchCount: branches.length,
            latestSnapshot: latestSnapshot ? {
                timestamp: latestSnapshot.createdAt,
                commitSha: latestSnapshot.commitSha
            } : null
        };
    }

    async generateE2ETest(repoId: string, triggerNodeId: string, branchName: string = 'main', testType: 'playwright' | 'cypress' = 'playwright') {
        return TestGenerator.generate({
            repoId,
            triggerNodeId,
            branchName,
            testType,
            prisma: this.prisma
        });
    }

    async exportWorkflow(repoId: string, triggerNodeId: string, branchName: string = 'main', exportType: 'asl' | 'temporal' = 'asl') {
        return WorkflowExporter.export({
            repoId,
            triggerNodeId,
            branchName,
            exportType,
            prisma: this.prisma
        });
    }
}
