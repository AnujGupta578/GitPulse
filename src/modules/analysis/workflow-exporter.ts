import path from 'path';
import fs from 'fs/promises';
import { type PrismaClient } from '@prisma/client';

interface WorkflowNode {
    id: string;
    type: string;
    subtype: string;
    label: string;
    metadata?: Record<string, any>;
}

interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    type: string;
}

export class WorkflowExporter {
    static async export({
        repoId,
        triggerNodeId,
        branchName = 'main',
        exportType = 'asl',
        prisma
    }: {
        repoId: string;
        triggerNodeId: string;
        branchName?: string;
        exportType?: 'asl' | 'temporal';
        prisma: PrismaClient;
    }) {
        // 1. Resolve branch
        let b = await prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: branchName } });
        if (!b) {
            const repo = await prisma.repository.findUnique({ where: { id: repoId }, include: { branches: true } });
            if (repo) {
                const fallbackName = repo.defaultBranch || (repo.branches[0]?.name) || 'main';
                b = await prisma.repositoryBranch.findFirst({ where: { repositoryId: repoId, name: fallbackName } });
            }
        }
        if (!b) {
            throw new Error(`Repository branch not found for branch: ${branchName}`);
        }

        // 2. Fetch the latest snapshot
        const s = await prisma.architectureSnapshot.findFirst({ where: { branchId: b.id }, orderBy: { createdAt: 'desc' } });
        if (!s || !s.topology) {
            throw new Error(`No architecture snapshot available for branch ${b.name}. Please run repository sync first.`);
        }

        const topology = s.topology as any;
        const nodes: WorkflowNode[] = topology.nodes || [];
        const edges: WorkflowEdge[] = topology.edges || [];

        // Find starting trigger node
        const trigger = nodes.find(n => n.id === triggerNodeId);
        if (!trigger) {
            throw new Error(`Trigger node not found with ID: ${triggerNodeId}`);
        }

        // 3. Trace reachable execution DAG from trigger node
        const reachableNodes: WorkflowNode[] = [];
        const reachableEdges: WorkflowEdge[] = [];
        const visited = new Set<string>();
        const queue = [triggerNodeId];
        visited.add(triggerNodeId);

        const nodesMap = new Map(nodes.map(n => [n.id, n]));
        const edgesBySource = new Map<string, WorkflowEdge[]>();
        for (const edge of edges) {
            if (!edgesBySource.has(edge.source)) {
                edgesBySource.set(edge.source, []);
            }
            edgesBySource.get(edge.source)!.push(edge);
        }

        while (queue.length > 0) {
            const currId = queue.shift()!;
            const node = nodesMap.get(currId);
            if (node) {
                reachableNodes.push(node);
            }
            const outEdges = edgesBySource.get(currId) || [];
            for (const edge of outEdges) {
                reachableEdges.push(edge);
                if (!visited.has(edge.target)) {
                    visited.add(edge.target);
                    queue.push(edge.target);
                }
            }
        }

        // 4. Generate Export Content
        let code = '';
        let filename = '';

        const nameClean = trigger.label.replace(/\W+/g, '_').toLowerCase();

        if (exportType === 'asl') {
            filename = `state_machine_${nameClean}.json`;
        } else {
            filename = `workflow_${nameClean}.ts`;
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (geminiApiKey) {
            const nodesDesc = reachableNodes.map(n =>
                `- [${n.type}] ${n.label} (${n.subtype}) in file ${n.metadata?.file || 'N/A'}`
            ).join('\n');
            const edgesDesc = reachableEdges.map(e =>
                `- ${e.source} -> ${e.target} [${e.type}${e.label ? `: ${e.label}` : ''}]`
            ).join('\n');

            const systemPrompt = `You are an expert cloud architect and workflow orchestration engineer.
Your task is to generate executable workflow orchestration code based on a structured application execution workflow spec.
${exportType === 'asl'
                    ? 'Generate a valid AWS Step Functions Amazon States Language (ASL) JSON definition.'
                    : 'Generate a fully functional Temporal Workflow (TypeScript) using @temporalio/workflow.'}

Guidelines:
1. Do not include any markdown wrappers like \`\`\`json or \`\`\`typescript. Output ONLY the raw JSON or TypeScript code.
2. Ensure correctness, and follow state machine standards.
3. For Step Functions, return only valid JSON representing the state machine.
4. For Temporal, return the complete TypeScript file export.`;

            const userPrompt = `Generate a ${exportType === 'asl' ? 'Step Functions ASL JSON' : 'Temporal TS Workflow'} for the following workflow path:

Trigger Node:
- ID: ${trigger.id}
- Label: ${trigger.label}
- Type: ${trigger.type} (${trigger.subtype})
- File: ${trigger.metadata?.file || "N/A"}

Execution Path Nodes:
${nodesDesc}

Execution Path Edges:
${edgesDesc}

Generate the full executable definition.`;

            try {
                console.log(`[Workflow-Exporter] Calling Google Gemini API for ${exportType}...`);
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: `${systemPrompt}\n\n${userPrompt}` }
                                ]
                            }
                        ],
                        generationConfig: { temperature: 0.2 }
                    })
                });

                if (response.ok) {
                    const data = await response.json() as any;
                    code = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    code = code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
                } else {
                    console.error('[Workflow-Exporter] Gemini API call failed, falling back to rule-based compiler:', await response.text());
                }
            } catch (err) {
                console.error('[Workflow-Exporter] Gemini API request error, falling back to rule-based compiler:', err);
            }
        }

        if (!code) {
            if (exportType === 'asl') {
                code = this.generateASL(reachableNodes, reachableEdges, trigger);
            } else {
                code = this.generateTemporal(reachableNodes, reachableEdges, trigger);
            }
        }

        // 5. Write to local storage under /exports/
        const exportsDir = path.join(process.cwd(), 'exports', 'workflow-generated');
        await fs.mkdir(exportsDir, { recursive: true });
        const filePath = path.join(exportsDir, filename);
        await fs.writeFile(filePath, code, 'utf-8');

        return {
            filename,
            filePath,
            code,
            exportType,
            pathNodeCount: reachableNodes.length,
            pathEdgeCount: reachableEdges.length
        };
    }

    private static sanitizeStateName(name: string): string {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    private static generateASL(nodes: WorkflowNode[], edges: WorkflowEdge[], trigger: WorkflowNode): string {
        const states: Record<string, any> = {};
        const startStateName = this.sanitizeStateName(trigger.label);
        const nameClean = trigger.label.replace(/\W+/g, '_').toLowerCase();

        // Resolve dynamic AWS configuration
        const awsRegion = process.env.AWS_REGION || trigger.metadata?.awsRegion || 'us-east-1';
        const awsAccountId = process.env.AWS_ACCOUNT_ID || trigger.metadata?.awsAccountId || '112233445566';

        // Map edges by source for transitions
        const edgesBySource = new Map<string, WorkflowEdge[]>();
        for (const e of edges) {
            if (!edgesBySource.has(e.source)) edgesBySource.set(e.source, []);
            edgesBySource.get(e.source)!.push(e);
        }

        for (const node of nodes) {
            const stateName = this.sanitizeStateName(node.label);
            const outEdges = edgesBySource.get(node.id) || [];

            // Resolve standard retry policies, wait delays, and catch blocks from metadata
            const retry = node.metadata?.retryPolicy || [
                {
                    "ErrorEquals": ["States.ALL"],
                    "IntervalSeconds": 3,
                    "MaxAttempts": 3,
                    "BackoffRate": 2.0
                }
            ];

            const catchBlock = node.metadata?.errorBoundary ? [
                {
                    "ErrorEquals": ["States.ALL"],
                    "Next": this.sanitizeStateName(node.metadata.errorBoundary)
                }
            ] : undefined;

            if (node.type === 'TRIGGER') {
                const nextNodeId = outEdges[0]?.target;
                const nextNode = nextNodeId ? nodes.find(n => n.id === nextNodeId) : null;
                states[stateName] = {
                    "Type": "Pass",
                    "Comment": `Trigger: ${node.label} (${node.subtype})`,
                    ...(nextNode ? { "Next": this.sanitizeStateName(nextNode.label) } : { "End": true })
                };
            } else if (node.type === 'DECISION') {
                const choices = outEdges.map(edge => {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    return {
                        "Variable": `$.${this.sanitizeStateName(node.label)}_condition`,
                        "BooleanEquals": edge.label?.toLowerCase() === 'no' ? false : true,
                        "Next": targetNode ? this.sanitizeStateName(targetNode.label) : startStateName
                    };
                });

                states[stateName] = {
                    "Type": "Choice",
                    "Comment": `Decision: ${node.label}`,
                    "Choices": choices,
                    "Default": choices[0]?.Next || startStateName
                };
            } else if (node.type === 'ACTION' || node.type === 'INTEGRATION') {
                // If there's a custom wait delay defined
                const waitSeconds = node.metadata?.waitDelaySeconds;
                const nextNodeId = outEdges[0]?.target;
                const nextNode = nextNodeId ? nodes.find(n => n.id === nextNodeId) : null;

                const lambdaArn = `arn:aws:lambda:${awsRegion}:${awsAccountId}:function:gitpulse-${nameClean}-${stateName.toLowerCase()}`;

                if (waitSeconds) {
                    const waitStateName = `${stateName}_Wait`;
                    states[stateName] = {
                        "Type": "Task",
                        "Resource": lambdaArn,
                        "Retry": retry,
                        ...(catchBlock ? { "Catch": catchBlock } : {}),
                        "Next": waitStateName
                    };
                    states[waitStateName] = {
                        "Type": "Wait",
                        "Seconds": waitSeconds,
                        ...(nextNode ? { "Next": this.sanitizeStateName(nextNode.label) } : { "End": true })
                    };
                } else {
                    if (node.type === 'INTEGRATION') {
                        states[stateName] = {
                            "Type": "Task",
                            "Resource": "arn:aws:states:::aws-sdk:dynamodb:putItem",
                            "Parameters": {
                                "TableName": `GitPulse-${stateName}-Table`,
                                "Item": {
                                    "id": { "S.$": "$.id" },
                                    "updatedAt": { "S.$": "$.updatedAt" }
                                }
                            },
                            "Retry": retry,
                            ...(catchBlock ? { "Catch": catchBlock } : {}),
                            ...(nextNode ? { "Next": this.sanitizeStateName(nextNode.label) } : { "End": true })
                        };
                    } else {
                        states[stateName] = {
                            "Type": "Task",
                            "Resource": lambdaArn,
                            "Retry": retry,
                            ...(catchBlock ? { "Catch": catchBlock } : {}),
                            ...(nextNode ? { "Next": this.sanitizeStateName(nextNode.label) } : { "End": true })
                        };
                    }
                }
            }
        }

        const aslDefinition = {
            "Comment": `GitPulse State Machine generated for Trigger: ${trigger.label}`,
            "StartAt": startStateName,
            "States": states
        };

        return JSON.stringify(aslDefinition, null, 2);
    }

    private static generateTemporal(nodes: WorkflowNode[], edges: WorkflowEdge[], trigger: WorkflowNode): string {
        const startStateName = this.sanitizeStateName(trigger.label);
        const nameClean = startStateName.charAt(0).toUpperCase() + startStateName.slice(1);

        // Find all standard activities
        const discoveredActivities = nodes
            .filter(n => n.type === 'ACTION' || n.type === 'INTEGRATION')
            .map(n => this.sanitizeStateName(n.label));

        // Scavenge any error boundaries that might represent fallback actions not in discoveredActivities
        const fallbackActivities: string[] = [];
        for (const n of nodes) {
            const boundary = n.metadata?.errorBoundary;
            if (boundary) {
                fallbackActivities.push(this.sanitizeStateName(boundary));
            }
        }

        // Combine and filter duplicates to guarantee valid TS destructuring syntax
        const uniqueActivities = Array.from(new Set([...discoveredActivities, ...fallbackActivities]));

        // Group edges by source
        const edgesBySource = new Map<string, WorkflowEdge[]>();
        for (const e of edges) {
            if (!edgesBySource.has(e.source)) edgesBySource.set(e.source, []);
            edgesBySource.get(e.source)!.push(e);
        }

        // Build sequential workflow execution code
        let executionFlow = '';
        let currentId = trigger.id;
        const visited = new Set<string>();

        const buildBlock = (currNodeId: string, indent: string): string => {
            if (visited.has(currNodeId)) return '';
            visited.add(currNodeId);

            const node = nodes.find(n => n.id === currNodeId);
            if (!node) return '';

            let result = '';
            const outEdges = edgesBySource.get(currNodeId) || [];

            if (node.type === 'ACTION' || node.type === 'INTEGRATION') {
                const sName = this.sanitizeStateName(node.label);

                // Incorporate AST Wait properties
                const waitSeconds = node.metadata?.waitDelaySeconds;
                if (waitSeconds) {
                    result += `${indent}// Wait of ${waitSeconds} seconds registered\n`;
                    result += `${indent}await sleep('${waitSeconds}s');\n`;
                }

                // Incorporate Custom Error boundaries
                const errorBoundary = node.metadata?.errorBoundary;
                if (errorBoundary) {
                    const fallbackName = this.sanitizeStateName(errorBoundary);
                    result += `${indent}try {\n`;
                    result += `${indent}    currentData = await ${sName}(currentData);\n`;
                    result += `${indent}} catch (err) {\n`;
                    result += `${indent}    console.warn("Caught in AST Error Boundary: ${errorBoundary}");\n`;
                    result += `${indent}    currentData = await ${fallbackName}(currentData);\n`;
                    result += `${indent}}\n`;
                } else {
                    result += `${indent}currentData = await ${sName}(currentData);\n`;
                }

                const nextId = outEdges[0]?.target;
                if (nextId) {
                    result += buildBlock(nextId, indent);
                }
            } else if (node.type === 'DECISION') {
                const cond = node.metadata?.condition || "currentData.isValid";
                const yesEdge = outEdges.find(e => e.label?.toLowerCase() !== 'no');
                const noEdge = outEdges.find(e => e.label?.toLowerCase() === 'no');

                result += `${indent}// Decision: ${node.label}\n`;
                result += `${indent}if (${cond}) {\n`;
                if (yesEdge) {
                    result += buildBlock(yesEdge.target, indent + '    ');
                }
                result += `${indent}}`;
                if (noEdge) {
                    result += ` else {\n`;
                    result += buildBlock(noEdge.target, indent + '    ');
                    result += `${indent}}\n`;
                } else {
                    result += `\n`;
                }
            } else if (node.type === 'TRIGGER') {
                const nextId = outEdges[0]?.target;
                if (nextId) {
                    result += buildBlock(nextId, indent);
                }
            }

            return result;
        };

        const workflowLogic = buildBlock(trigger.id, '        ');

        return `import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

// Proxy all discovered Actions and Sinks as Temporal Activities
const { ${uniqueActivities.join(', ')} } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        initialInterval: '3s',
        backoffCoefficient: 2,
        maximumAttempts: 5,
        nonRetryableErrorTypes: ['ValidationError']
    }
});

/**
 * GitPulse Generated Deterministic Temporal Workflow
 * Trigger Entry Point: ${trigger.label}
 */
export async function ${nameClean}Workflow(payload: any): Promise<any> {
    let currentData = payload;
    console.log("Starting Workflow: ${nameClean}Workflow");

    try {
${workflowLogic}
        return currentData;
    } catch (error) {
        console.error("Workflow failed execution run:", error);
        throw error;
    }
}
`;
    }
}
