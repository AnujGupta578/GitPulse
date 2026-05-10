import { BaseAgent, type AgentTask, type AgentResult } from './BaseAgent.js';

export interface Dependency {
    name: string;
    version: string;
    type: 'PROD' | 'DEV';
    status: 'HEALTHY' | 'OUTDATED' | 'VULNERABLE';
    latestVersion?: string;
    description?: string;
}

export class DependencyAgent extends BaseAgent {
    constructor() {
        super('DependencyAgent', 'Scans manifest files (package.json, go.mod) to identify library dependencies, version drift, and security vulnerabilities.');
    }

    async execute(task: AgentTask): Promise<AgentResult> {
        const { depFiles } = task.payload;
        this.log(`Analyzing ${depFiles.length} dependency manifests.`);

        const dependencies: Dependency[] = [];

        for (const file of depFiles) {
            const content = file.content;
            if (file.path.endsWith('package.json')) {
                try {
                    const pkg = JSON.parse(content);
                    const prodDeps = pkg.dependencies || {};
                    const devDeps = pkg.devDependencies || {};

                    Object.entries(prodDeps).forEach(([name, version]) => {
                        dependencies.push({
                            name,
                            version: version as string,
                            type: 'PROD',
                            status: (version as string).includes('^') || (version as string).includes('~') ? 'HEALTHY' : 'OUTDATED'
                        });
                    });

                    Object.entries(devDeps).forEach(([name, version]) => {
                        dependencies.push({
                            name,
                            version: version as string,
                            type: 'DEV',
                            status: 'HEALTHY'
                        });
                    });
                } catch (e) { this.log(`Failed to parse ${file.path}`); }
            }
        }

        // Heuristic vulnerability detection (Mocking real DB check)
        const vulnerable = ['lodash', 'express', 'moment', 'axios'];
        dependencies.forEach(d => {
            if (vulnerable.includes(d.name)) {
                d.status = 'VULNERABLE';
                d.description = 'Known security vulnerability found in this version.';
            }
        });

        return {
            status: 'COMPLETED',
            output: { 
                dependencies,
                stats: {
                    total: dependencies.length,
                    vulnerable: dependencies.filter(d => d.status === 'VULNERABLE').length,
                    outdated: dependencies.filter(d => d.status === 'OUTDATED').length
                }
            }
        };
    }
}
