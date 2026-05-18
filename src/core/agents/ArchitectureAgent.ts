/**
 * ArchitectureAgent — SPEC.md §3.1 / SKILL.md Step 2.2
 * ======================================================
 * Replaces the old folder-walk + random-edge heuristic with a call to
 * the Python SemanticWorkflowParser engine via /internal/analyze-workflow.
 *
 * DO NOT restore the old folder-walk logic.
 */

import { BaseAgent, type AgentResult, type AgentTask } from './BaseAgent.js';

// ---------------------------------------------------------------------------
// SPEC.md §3.2 — Node & Edge type contracts
// ---------------------------------------------------------------------------

export type WorkflowNodeType = 'TRIGGER' | 'ACTION' | 'DECISION' | 'INTEGRATION';

export type WorkflowNodeSubtype =
    | 'HTTP_ROUTE'
    | 'WEBHOOK'
    | 'CRON'
    | 'EVENT_LISTENER'
    | 'SERVICE_METHOD'
    | 'BUSINESS_LOGIC'
    | 'UTILITY_FUNCTION'
    | 'IF_ELSE'
    | 'SWITCH_CASE'
    | 'TERNARY_GATEWAY'
    | 'DATABASE_WRITE'
    | 'DATABASE_READ'
    | 'EXTERNAL_HTTP'
    | 'THIRD_PARTY_SDK';

export type WorkflowEdgeType =
    | 'CALL'
    | 'BRANCH_TRUE'
    | 'BRANCH_FALSE'
    | 'QUERY'
    | 'EVENT'
    | 'RECURSIVE';

export interface WorkflowNodeMetadata {
    file: string;
    line: number;
    method?: string;    // HTTP method (TRIGGER only)
    path?: string;      // route path (TRIGGER only)
    condition?: string; // branch condition text (DECISION only)
    operation?: string; // DB op or HTTP verb (INTEGRATION only)
    model?: string;     // Prisma model name (INTEGRATION only)
}

export interface WorkflowNode {
    id: string;
    type: WorkflowNodeType;
    subtype: WorkflowNodeSubtype;
    label: string;
    metadata: WorkflowNodeMetadata;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    type: WorkflowEdgeType;
}

export interface WorkflowTopology {
    schemaVersion: '2.0-workflow';
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface WorkflowMetrics {
    triggerCount: number;
    actionCount: number;
    decisionCount: number;
    integrationCount: number;
    totalNodes: number;
    totalEdges: number;
    cyclomaticComplexity: number;
    avgCallDepth: number;
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

const PYTHON_ENGINE_URL = 'http://localhost:8002/internal/analyze-workflow';
const ANALYSIS_TIMEOUT_MS = 120_000; // 2 minutes

export class ArchitectureAgent extends BaseAgent {
    constructor() {
        super(
            'ArchitectureAgent',
            'Performs semantic AST analysis of a repository clone via the Python workflow engine to produce a directed execution call graph (schemaVersion 2.0-workflow).'
        );
    }

    async execute(task: AgentTask): Promise<AgentResult> {
        const { repoPath, repoId, branchName } = task.payload || {};

        if (!repoPath) {
            return {
                status: 'FAILED',
                error: 'repoPath is required for semantic workflow analysis. Ensure the sync pipeline passes the local clone path in the task payload.',
            };
        }

        this.log(`Starting semantic workflow analysis for repo ${repoId} [${branchName}] at ${repoPath}`);

        let response: Response;
        try {
            response = await fetch(PYTHON_ENGINE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repo_path: repoPath }),
                signal: AbortSignal.timeout(ANALYSIS_TIMEOUT_MS),
            });
        } catch (err: any) {
            const msg = err?.message ?? String(err);
            this.log(`Python engine unreachable: ${msg}`);
            return {
                status: 'FAILED',
                error: `Cannot reach Python workflow engine at ${PYTHON_ENGINE_URL}: ${msg}`,
            };
        }

        if (!response.ok) {
            return {
                status: 'FAILED',
                error: `Python engine returned HTTP ${response.status}`,
            };
        }

        let result: { success: boolean; data?: { topology: WorkflowTopology; metrics: WorkflowMetrics }; error?: string };
        try {
            result = await response.json();
        } catch {
            return { status: 'FAILED', error: 'Python engine returned non-JSON response' };
        }

        if (!result.success || !result.data) {
            return {
                status: 'FAILED',
                error: result.error ?? 'Python engine returned success=false with no error message',
            };
        }

        const { topology, metrics } = result.data;

        this.log(
            `Analysis complete — Triggers: ${metrics.triggerCount}, ` +
            `Actions: ${metrics.actionCount}, ` +
            `Decisions: ${metrics.decisionCount}, ` +
            `Integrations: ${metrics.integrationCount}, ` +
            `Cyclomatic complexity: ${metrics.cyclomaticComplexity}`
        );

        return {
            status: 'COMPLETED',
            output: {
                topology,
                metrics,
                summary:
                    `Workflow analysis complete. ` +
                    `${metrics.triggerCount} triggers, ${metrics.actionCount} actions, ` +
                    `${metrics.decisionCount} decisions, ${metrics.integrationCount} integrations. ` +
                    `Cyclomatic complexity: ${metrics.cyclomaticComplexity}. ` +
                    `Avg call depth: ${metrics.avgCallDepth}.`,
            },
        };
    }
}
