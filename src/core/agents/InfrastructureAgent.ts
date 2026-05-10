import { BaseAgent, type AgentTask, type AgentResult } from './BaseAgent.js';

export interface InfrastructureResource {
    id: string;
    type: 'DOCKER' | 'KUBERNETES' | 'TERRAFORM' | 'CICD' | 'CLOUD';
    name: string;
    status: 'ACTIVE' | 'PENDING' | 'UNKNOWN';
    description: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    metadata: any;
}

export class InfrastructureAgent extends BaseAgent {
    constructor() {
        super('InfrastructureAgent', 'Parses infrastructure configurations (Docker, K8s, Terraform) to map deployment topology and identify security/reliability risks.');
    }

    async execute(task: AgentTask): Promise<AgentResult> {
        const { infraFiles, repoId } = task.payload;
        this.log(`Analyzing ${infraFiles.length} infrastructure files for repo ${repoId}`);

        const resources: InfrastructureResource[] = [];

        for (const file of infraFiles) {
            const fileName = (file.path || file).toLowerCase();
            const content: string = file.content || '';

            if (fileName.includes('dockerfile')) {
                const fromLine = content.split('\n').find((l: string) => l.startsWith('FROM '));
                const baseImage = fromLine ? fromLine.replace('FROM ', '').trim().split(' ')[0] : 'unknown';
                const exposeLines = content.split('\n').filter((l: string) => l.startsWith('EXPOSE '));
                const ports = exposeLines.map((l: string) => l.replace('EXPOSE', '').trim());
                resources.push({
                    id: `res-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'DOCKER',
                    name: file.path?.split('/').pop() || 'Dockerfile',
                    status: 'ACTIVE',
                    description: `Container image using base: ${baseImage}. Exposes ports: ${ports.join(', ') || 'none'}.`,
                    riskLevel: baseImage?.includes('latest') ? 'HIGH' : 'LOW',
                    metadata: { path: file.path || file, baseImage, ports }
                });
            } else if (fileName.includes('docker-compose')) {
                const serviceMatches = content.match(/^  ([a-zA-Z0-9_-]+):\s*$/gm) || [];
                const serviceNames = serviceMatches.map((s: string) => s.trim().replace(':', ''));
                resources.push({
                    id: `res-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'DOCKER',
                    name: 'Docker Compose',
                    status: 'ACTIVE',
                    description: `Multi-container orchestration. Services: ${serviceNames.join(', ') || 'detected'}.`,
                    riskLevel: 'MEDIUM',
                    metadata: { path: file.path || file, services: serviceNames }
                });
            } else if (fileName.endsWith('.tf')) {
                const resourceMatches = content.match(/^resource\s+"([^"]+)"\s+"([^"]+)"/gm) || [];
                const tfResources = resourceMatches.map((r: string) => r.split('"')[1]).filter(Boolean);
                resources.push({
                    id: `res-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'TERRAFORM',
                    name: file.path?.split('/').pop() || 'Terraform',
                    status: 'ACTIVE',
                    description: `IaC: ${tfResources.length} resource types (${tfResources.slice(0, 3).join(', ')}${tfResources.length > 3 ? '…' : ''}).`,
                    riskLevel: 'MEDIUM',
                    metadata: { path: file.path || file, resourceTypes: tfResources }
                });
            } else if (fileName.includes('.github/workflows') && (fileName.endsWith('.yml') || fileName.endsWith('.yaml'))) {
                const onMatch = content.match(/^on:\s*\n(.*?)(?=\n\S)/s);
                const triggers = content.match(/push|pull_request|schedule|workflow_dispatch/g) || [];
                const uniqueTriggers = [...new Set(triggers)];
                resources.push({
                    id: `res-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'CICD',
                    name: file.path?.split('/').pop() || 'GitHub Actions',
                    status: 'ACTIVE',
                    description: `CI/CD pipeline. Triggers: ${uniqueTriggers.join(', ')}.`,
                    riskLevel: 'LOW',
                    metadata: { path: file.path || file, triggers: uniqueTriggers }
                });
            } else if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
                if (content.includes('kind:') && (content.includes('Deployment') || content.includes('Service') || content.includes('Pod'))) {
                    const kindMatches = content.match(/^kind:\s*(\S+)/gm) || [];
                    const kinds = kindMatches.map((k: string) => k.replace('kind:', '').trim());
                    resources.push({
                        id: `res-${Math.random().toString(36).substr(2, 9)}`,
                        type: 'KUBERNETES',
                        name: file.path?.split('/').pop() || 'K8s Manifest',
                        status: 'ACTIVE',
                        description: `Kubernetes manifest. Resources: ${kinds.join(', ')}.`,
                        riskLevel: 'MEDIUM',
                        metadata: { path: file.path || file, kinds }
                    });
                }
            }
        }

        // Risk synthesis
        const hasTerraform = resources.some(r => r.type === 'TERRAFORM');
        const hasCiCd = resources.some(r => r.type === 'CICD');
        if (hasTerraform && !hasCiCd) {
            resources.push({
                id: 'risk-manual-deploy',
                type: 'CLOUD',
                name: 'Manual Provisioning Risk',
                status: 'UNKNOWN',
                description: 'Terraform detected but no CI/CD automation found. Risk of configuration drift and manual errors.',
                riskLevel: 'HIGH',
                metadata: {}
            });
        }

        return {
            status: 'COMPLETED',
            output: { resources }
        };
    }
}


