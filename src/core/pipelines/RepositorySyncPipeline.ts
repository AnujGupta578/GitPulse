import { PrismaClient } from '@prisma/client';
import { GitHubAdapter } from '../git/GitHubAdapter.js';
import { CommitIngestionPipeline } from './CommitIngestionPipeline.js';
import { DependencyPipeline } from './DependencyPipeline.js';
import { InfrastructurePipeline } from './InfrastructurePipeline.js';
import { ArchitecturePipeline } from './ArchitecturePipeline.js';
import { EngineeringIntelligenceAgent } from '../agents/EngineeringIntelligenceAgent.js';

export class RepositorySyncPipeline {
    constructor(private prisma: PrismaClient) {}

    async execute(jobId: string) {
        const job = await this.prisma.syncJob.findUnique({ where: { id: jobId }, include: { repository: true } });
        if (!job) throw new Error('Job not found');

        const { repository: repo, branchName } = job;
        
        if (!branchName) {
            await this.prisma.syncJob.update({ where: { id: jobId }, data: { status: 'FAILED', error: 'No branch name specified for sync job' } });
            throw new Error('No branch name specified');
        }
        if (!repo.owner) {
            await this.prisma.syncJob.update({ where: { id: jobId }, data: { status: 'FAILED', error: 'Repository owner is missing — cannot call GitHub API' } });
            throw new Error('Repository owner is missing');
        }

        console.log(`[SyncPipeline] Starting job ${jobId} for ${repo.owner}/${repo.name} [${branchName}]`);
        
        const updateJob = async (step: string, progress: number) => {
            console.log(`[SyncPipeline] ${jobId} -> ${step} (${progress}%)`);
            await this.prisma.syncJob.update({
                where: { id: jobId },
                data: { currentStep: step, progress }
            });
        };

        try {
            const account = await this.prisma.connectedAccount.findFirst({
                where: { user: { workspaces: { some: { id: repo.workspaceId } } } }
            });
            if (!account) throw new Error('No connected account');

            const { decrypt } = await import('../../utils/crypto.js');
            const accessToken = decrypt(account.accessToken);
            const github = new GitHubAdapter();

            // STEP 1: Metadata
            await updateJob('FETCHING_METADATA', 10);
            const targetBranch = await github.fetchBranch(accessToken, repo.owner, repo.name, branchName);
            
            const branchRecord = await this.prisma.repositoryBranch.upsert({
                where: { repositoryId_name: { repositoryId: repo.id, name: branchName } },
                update: { sha: targetBranch.sha },
                create: { repositoryId: repo.id, name: branchName, sha: targetBranch.sha }
            });

            // STEP 2: Commits
            await updateJob('INDEXING_COMMITS', 30);
            const commitPipeline = new CommitIngestionPipeline(this.prisma, github);
            await commitPipeline.execute(repo.id, accessToken, repo.owner, repo.name, branchName);

            // STEP 3: Tree Scan
            await updateJob('SCANNING_TREE', 50);
            const tree = await github.fetchFileTree(accessToken, repo.owner, repo.name, targetBranch.sha);
            
            // STEP 4: Dependencies
            await updateJob('ANALYZING_DEPENDENCIES', 70);
            const depFiles = tree.filter((f: any) => f.path.endsWith('package.json') || f.path.endsWith('requirements.txt'));
            const depAnalysisFiles = [];
            for (const f of depFiles) {
                const content = await github.fetchFileContent(accessToken, repo.owner, repo.name, f.path, targetBranch.sha);
                depAnalysisFiles.push({ path: f.path, content });
            }
            const depPipeline = new DependencyPipeline(this.prisma);
            await depPipeline.execute(branchRecord.id, targetBranch.sha, { depFiles: depAnalysisFiles });

            // STEP 5: Infrastructure
            await updateJob('ANALYZING_INFRASTRUCTURE', 85);
            const infraFileNodes = tree.filter((f: any) => 
                f.path.includes('Dockerfile') || f.path.endsWith('.tf') || 
                f.path.includes('docker-compose') || f.path.includes('.github/workflows')
            );
            const infraFilesWithContent = [];
            for (const f of infraFileNodes) {
                try {
                    const content = await github.fetchFileContent(accessToken, repo.owner, repo.name, f.path, targetBranch.sha);
                    infraFilesWithContent.push({ path: f.path, content });
                } catch { infraFilesWithContent.push({ path: f.path, content: '' }); }
            }
            const infraPipeline = new InfrastructurePipeline(this.prisma);
            const infraResult = await infraPipeline.execute(repo.id, branchRecord.id, targetBranch.sha, infraFilesWithContent);

            // STEP 6: Architecture (Semantic Workflow — SPEC.md §3.1)
            await updateJob('SYNTHESIZING_ARCHITECTURE', 95);
            // Derive the local clone path — GitHubAdapter checks repos out under /tmp/gitpulse-clones/<owner>/<name>
            let clonedRepoPath = process.env.REPO_CLONE_BASE_PATH
                ? `${process.env.REPO_CLONE_BASE_PATH}/${repo.owner}/${repo.name}`
                : `/tmp/gitpulse-clones/${repo.owner}/${repo.name}`;
            const fs = await import('fs');
            if (!fs.existsSync(clonedRepoPath)) {
                clonedRepoPath = process.cwd();
            }
            const archPipeline = new ArchitecturePipeline(this.prisma);
            const archResult = await archPipeline.execute(repo.id, branchRecord.id, targetBranch.sha, {
                repoPath: clonedRepoPath,   // ← Required by ArchitectureAgent for semantic analysis
                repoId: repo.id, branchName, tree: tree.map((f: any) => ({ path: f.path, type: f.type })),
                detectedServices: [], infraFiles: infraFileNodes.map((f: any) => f.path)
            });

            // STEP 7: Engineering Intelligence
            await updateJob('SYNTHESIZING_INTELLIGENCE', 98);
            const intelAgent = new EngineeringIntelligenceAgent();
            
            // Get stats and drift for intelligence correlation
            const commitCount = await this.prisma.commit.count({ where: { repositoryId: repo.id } });
            // Simple drift payload for now
            const drift = { added: [], removed: [], modified: [] }; 
            
            const intelResult = await intelAgent.execute({
                id: `intel-${Date.now()}`,
                agentName: 'EngineeringIntelligenceAgent',
                payload: { 
                    repoId: repo.id, 
                    stats: { commitCount }, 
                    drift, 
                    infraRisks: (infraResult.output as any)?.resources?.filter((r: any) => r.riskLevel === 'HIGH') || [] 
                }
            });

            if (intelResult.status === 'COMPLETED') {
                // Store insights
                const insights = intelResult.output.insights || [];
                for (const insight of insights) {
                    await this.prisma.engineeringInsight.create({
                        data: {
                            branchId: branchRecord.id,
                            title: insight.title,
                            content: insight.content,
                            recommendation: insight.recommendation,
                            severity: insight.severity,
                            category: insight.category
                        }
                    });
                }
            }

            // FINAL
            await this.prisma.repositoryBranch.update({
                where: { id: branchRecord.id },
                data: { syncStatus: 'READY' }
            });
            await this.prisma.syncJob.update({
                where: { id: jobId },
                data: { status: 'COMPLETED', progress: 100, completedAt: new Date(), currentStep: 'READY' }
            });

        } catch (error: any) {
            console.error(`[SyncPipeline] FAILED job ${jobId}:`, error);
            await this.prisma.syncJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', error: error.message, completedAt: new Date() }
            }).catch(() => {});
            throw error;
        }
    }
}
