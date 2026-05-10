import { PrismaClient } from '@prisma/client';

export class AnalysisService {
    constructor(private prisma: PrismaClient) {}

    async getArchitecture(repoId: string, branchName: string = 'main') {
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
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

    async getDrift(repoId: string, base: string = 'main', head: string) {
        if (!head) return { added: [], removed: [], modified: [], addedEdges: [], removedEdges: [], summary: 'No head branch specified.' };
        
        const [b, h] = await Promise.all([
            this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: base } }),
            this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: head } })
        ]);
        
        if (!b || !h) return { added: [], removed: [], modified: [], addedEdges: [], removedEdges: [], summary: 'Branch metadata missing.' };
        
        const [bs, hs] = await Promise.all([
            this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } }),
            this.prisma.architectureSnapshot.findFirst({ where: { branchId: h.id }, orderBy: { createdAt: 'desc' } })
        ]);
        
        const defaultDrift = { added: [], removed: [], modified: [], addedEdges: [], removedEdges: [], summary: 'One or both architecture snapshots missing.' };
        if (!bs || !hs) return defaultDrift;
        
        const bn = (bs.topology as any)?.nodes || [];
        const hn = (hs.topology as any)?.nodes || [];
        const be = (bs.topology as any)?.edges || [];
        const he = (hs.topology as any)?.edges || [];

        const added = hn.filter((x: any) => !bn.find((y: any) => y.id === x.id));
        const removed = bn.filter((x: any) => !hn.find((y: any) => y.id === x.id));
        const modified = hn.filter((x: any) => { 
            const y = bn.find((z: any) => z.id === x.id); 
            return y && (JSON.stringify(y) !== JSON.stringify(x)); 
        });

        const addedEdges = he.filter((x: any) => !be.find((y: any) => y.id === x.id));
        const removedEdges = be.filter((x: any) => !he.find((y: any) => y.id === x.id));

        return {
            added,
            removed,
            modified,
            addedEdges,
            removedEdges,
            summary: `Architecture drift detected: ${added.length} added, ${removed.length} removed, ${modified.length} modified nodes.`,
            riskScore: (added.length + removed.length + modified.length) > 5 ? 7.5 : 2.5
        };
    }

    async getInfrastructure(repoId: string, branchName: string = 'main') {
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
        if (!b) return [];
        const s = await this.prisma.infrastructureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return [];
        return (s.resources as any[]) || [];
    }

    async getDependencies(repoId: string, branchName: string = 'main') {
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
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
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
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
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
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
        const b = await this.prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
        if (!b) return [];
        const s = await this.prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s) return [];
        const nodes = (s.topology as any)?.nodes || [];
        return nodes.filter((n: any) => n.type === 'service' || n.type === 'gateway' || n.type === 'module');
    }

    async getActivity(repoId: string) {
        return this.prisma.commit.findMany({ where: { repositoryId: repoId }, orderBy: { timestamp: 'desc' }, take: 20 });
    }

    async getSummary(repoId: string) {
        const [c, b, s, j] = await Promise.all([
            this.prisma.commit.count({ where: { repositoryId: repoId } }),
            this.prisma.repositoryBranch.count({ where: { repositoryId: repoId } }),
            this.prisma.architectureSnapshot.findFirst({ where: { branch: { repositoryId: repoId } }, orderBy: { createdAt: 'desc' }, include: { branch: true } }),
            this.prisma.syncJob.count({ where: { repositoryId: repoId, status: 'RUNNING' } })
        ]);
        return { 
            commitCount: c, 
            branchCount: b, 
            latestSnapshot: s ? { branch: s.branch.name, timestamp: s.createdAt, nodeCount: (s.topology as any)?.nodes?.length || 0 } : null, 
            isSyncing: j > 0 
        };
    }
}
