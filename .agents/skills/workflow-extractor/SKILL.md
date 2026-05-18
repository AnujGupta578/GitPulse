# SKILL: Workflow Semantic Extractor
**Skill ID:** `workflow-extractor`
**Version:** 1.0.0
**Applies To:** `AnujGupta578/GitPulse`
**Spec Reference:** `SPEC.md §3.1, §3.2, §3.3`

---

## 1. Purpose

This skill instructs Antigravity how to implement the E2E Application Workflow Diagram engine end-to-end. It replaces the current file-topology approach (random-edge heuristic in `ArchitectureAgent.ts`) with real semantic AST analysis.

---

## 2. Codebase Map (Read Before Writing Any Code)

```
BACKEND (TypeScript/Node — Fastify)
├── src/core/pipelines/RepositorySyncPipeline.ts  ← STEP 6 calls ArchitecturePipeline
├── src/core/pipelines/ArchitecturePipeline.ts    ← Calls ArchitectureAgent, saves snapshot
├── src/core/agents/ArchitectureAgent.ts          ← ⚠️ REPLACE: currently uses folder-walk + random edges
├── src/core/architecture/ArchitectureSynthesizer.ts ← ⚠️ REPLACE: returns hardcoded mock
├── src/modules/analysis/analysis.routes.ts       ← GET /api/repositories/:id/architecture (NO CHANGE)
├── src/modules/analysis/analysis.service.ts      ← getArchitecture() reads ArchitectureSnapshot (NO CHANGE)
└── prisma/schema.prisma                          ← ArchitectureSnapshot.topology: Json (NO CHANGE)

PYTHON ENGINE (FastAPI + Tree-sitter)
├── src/engine/parser.py          ← EXTEND: existing IntentParser with Tree-sitter
├── src/engine/workflow_engine.py ← CREATE: new orchestrator
├── src/engine/semantic_workflow_parser.py ← CREATE: 4 extractors
└── src/main.py                   ← ADD: POST /internal/analyze-workflow endpoint

FRONTEND (Next.js 14, App Router)
└── dashboard/src/app/workspace/[repoId]/architecture/page.tsx ← REWRITE
```

**Key constraint:** `ArchitectureSnapshot.topology` is a `Json` field. The new workflow graph is stored there with `"schemaVersion": "2.0-workflow"`. No Prisma migration needed.

---

## 3. Phase 1 — Python AST Engine

### Step 1.1 — Create `src/engine/semantic_workflow_parser.py`

Create this file with one class `SemanticWorkflowParser` containing four extractor methods. Import from the existing `IntentParser` in `parser.py`.

**Class skeleton:**
```python
from src.engine.parser import IntentParser
import tree_sitter
from typing import List, Dict, Any
import os, re

class SemanticWorkflowParser:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.intent_parser = IntentParser()  # reuse existing language setup
        self.symbol_table: Dict[str, Dict] = {}  # function_name -> {file, line, type}

    def build_symbol_table(self, files: List[Dict]) -> None:
        """Pass 1: index all function/method definitions across all files."""

    def extract_triggers(self, tree, lang: str, file_path: str) -> List[Dict]:
        """Returns list of TriggerNode dicts."""

    def extract_actions(self, tree, lang: str, file_path: str) -> List[Dict]:
        """Returns list of ActionNode dicts + caller→callee edge hints."""

    def extract_decisions(self, tree, lang: str, file_path: str) -> List[Dict]:
        """Returns list of DecisionNode dicts."""

    def extract_integrations(self, tree, lang: str, file_path: str) -> List[Dict]:
        """Returns list of IntegrationNode dicts."""
```

**Tree-sitter queries to implement:**

`extract_triggers()` — TypeScript query:
```
; Fastify/Express route: fastify.get('/path', handler)
(call_expression
  function: (member_expression
    property: (property_identifier) @method
    (#match? @method "^(get|post|put|patch|delete|all|use)$"))
  arguments: (arguments (string) @route_path .)) @route

; Next.js App Router: export async function GET(req) {}
(export_statement
  declaration: (function_declaration
    name: (identifier) @http_method
    (#match? @http_method "^(GET|POST|PUT|DELETE|PATCH|OPTIONS)$"))) @nextjs_route

; Event listeners: emitter.on('event', handler)
(call_expression
  function: (member_expression
    property: (property_identifier) @on
    (#match? @on "^(on|addListener|addEventListener|subscribe)$"))
  arguments: (arguments (string) @event_name .)) @event_listener
```

`extract_actions()` — Track every `async method` in a class body:
```
(method_definition
  name: (property_identifier) @method_name
  body: (statement_block) @body) @method
```
Within each method body, also capture callee names from call_expressions to build edges.

`extract_decisions()` — TypeScript query:
```
(if_statement condition: (_) @condition) @if_decision
(switch_statement value: (_) @switch_value) @switch_decision
```
**Heuristic filter:** Only emit a DECISION node if condition text contains `===`, `!==`, `>`, `<`, `?.`, or `!`.

`extract_integrations()` — Two patterns:

Prisma calls:
```
; this.prisma.Model.operation()
(call_expression
  function: (member_expression
    object: (member_expression
      object: (this)
      property: (property_identifier) @client (#eq? @client "prisma"))
    property: (property_identifier) @operation)) @prisma_call
```

HTTP calls (fetch/axios):
```
(call_expression
  function: [(identifier) (member_expression)] @fn
  (#match? @fn "^(fetch|axios|got|request)")) @http_call
```

**Node output format** (identical for all 4 extractors):
```python
{
    "id": f"{node_type}::{qualifier}",   # e.g. "TRIGGER::POST /api/repos/:id/sync"
    "type": "TRIGGER",                   # TRIGGER | ACTION | DECISION | INTEGRATION
    "subtype": "HTTP_ROUTE",             # see SPEC.md §3.2 subtype table
    "label": "POST /api/repos/:id/sync",
    "metadata": {
        "file": "src/modules/sync/sync.routes.ts",
        "line": 12,
        "method": "POST",        # HTTP method (TRIGGER only)
        "path": "/api/..",       # route path (TRIGGER only)
        "condition": "...",      # branch condition text (DECISION only)
        "operation": "create",   # DB op or HTTP verb (INTEGRATION only)
        "model": "syncJob",      # Prisma model name (INTEGRATION only)
    }
}
```

---

### Step 1.2 — Create `src/engine/graph_assembler.py`

```python
class GraphAssembler:
    """
    Takes raw extractor outputs and builds a clean DAG.
    Responsibilities:
      1. Deduplicate nodes (same function referenced from N call-sites = 1 ActionNode)
      2. Resolve cross-file symbol references using symbol_table
      3. Attach DecisionNodes as children of their parent ActionNode
      4. Anchor IntegrationNodes as leaf nodes (no outbound edges)
      5. Detect and mark cycles as RECURSIVE edge type
    """

    def assemble(
        self,
        triggers: List[Dict],
        actions: List[Dict],
        decisions: List[Dict],
        integrations: List[Dict],
        raw_edges: List[Dict],   # caller→callee hints from extract_actions()
        symbol_table: Dict,
    ) -> Dict:
        """
        Returns the topology dict:
        {
          "schemaVersion": "2.0-workflow",
          "nodes": [...],
          "edges": [...]
        }
        """
```

**Edge type rules:**
- Trigger → Action: `type: "CALL"`, label `"invokes"`
- Action → Action: `type: "CALL"`, label `"calls"`
- Action → Decision: `type: "CALL"`, label `"evaluates"`
- Decision → Action/Integration (true branch): `type: "BRANCH_TRUE"`, label `"on:true"`
- Decision → Action/Integration (false branch): `type: "BRANCH_FALSE"`, label `"on:false"`
- Action → Integration (DB): `type: "QUERY"`, label `"queries"`
- Action → Integration (HTTP): `type: "CALL"`, label `"calls"`

---

### Step 1.3 — Create `src/engine/workflow_engine.py`

```python
import asyncio, os
from typing import List, Dict
from src.engine.semantic_workflow_parser import SemanticWorkflowParser
from src.engine.graph_assembler import GraphAssembler

SUPPORTED_EXTENSIONS = {
    ".ts": "typescript", ".tsx": "tsx",
    ".js": "javascript",
    ".py": "python",
    ".go": "go"
}

IGNORE_PATTERNS = ["node_modules", ".git", "dist", "__pycache__", ".next", "build"]

class WorkflowSemanticEngine:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.parser = SemanticWorkflowParser(repo_path)
        self.assembler = GraphAssembler()

    def _discover_files(self) -> List[Dict]:
        """Walk repo, return [{path, lang}] skipping IGNORE_PATTERNS."""

    async def _analyze_file(self, file_info: Dict) -> Dict:
        """
        Parse one file, run all 4 extractors.
        Returns {triggers, actions, decisions, integrations, raw_edges}.
        """

    async def run(self) -> Dict:
        """
        1. discover_files()
        2. build_symbol_table() — Pass 1
        3. asyncio.gather(*[_analyze_file(f) for f in files]) — Pass 2 (parallel)
        4. assembler.assemble(all_results)
        5. compute metrics: triggerCount, actionCount, decisionCount,
           integrationCount, cyclomaticComplexity, avgCallDepth
        6. Return {topology, metrics}
        """
```

**Cyclomatic complexity formula:**
`M = E - N + 2P` where E=edges, N=nodes, P=connected components (use 1 for a single graph).

---

## 4. Phase 2 — Backend Wiring

### Step 2.1 — Add endpoint to `src/main.py`

Add after the existing auth routes:

```python
from src.engine.workflow_engine import WorkflowSemanticEngine
from pydantic import BaseModel

class WorkflowAnalysisRequest(BaseModel):
    repo_path: str
    language_hint: str = "auto"   # auto-detect per file

@app.post("/internal/analyze-workflow")
async def analyze_workflow(request: WorkflowAnalysisRequest):
    """
    Internal endpoint called by ArchitecturePipeline.ts.
    NOT exposed through CORS (localhost only).
    """
    try:
        engine = WorkflowSemanticEngine(request.repo_path)
        result = await engine.run()
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

### Step 2.2 — Rewrite `src/core/agents/ArchitectureAgent.ts`

Replace the entire `execute()` method body. Remove the folder-walk, random-edge heuristic, and mock services. Replace with:

```typescript
async execute(task: AgentTask): Promise<AgentResult> {
    const { repoPath, repoId, branchName } = task.payload || {};

    if (!repoPath) {
        return { status: 'FAILED', error: 'repoPath is required for semantic workflow analysis' };
    }

    // Call the Python engine via internal HTTP
    const response = await fetch('http://localhost:8000/internal/analyze-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_path: repoPath }),
        signal: AbortSignal.timeout(120_000)   // 2 min timeout for large repos
    });

    const result = await response.json();

    if (!result.success) {
        return { status: 'FAILED', error: result.error };
    }

    return {
        status: 'COMPLETED',
        output: {
            topology: result.data.topology,
            metrics: result.data.metrics,
            summary: `Workflow analysis complete. ${result.data.metrics.triggerCount} triggers, ` +
                     `${result.data.metrics.actionCount} actions, ` +
                     `${result.data.metrics.integrationCount} integrations. ` +
                     `Cyclomatic complexity: ${result.data.metrics.cyclomaticComplexity}.`
        }
    };
}
```

### Step 2.3 — Update `src/core/pipelines/RepositorySyncPipeline.ts`

At STEP 6 (`SYNTHESIZING_ARCHITECTURE`, line 94-99), pass `repoPath` to the payload. The `clonedRepoPath` needs to be the local disk path where the repo was checked out during sync. Update the `archPipeline.execute()` call:

```typescript
// STEP 6: Architecture (Semantic Workflow)
await updateJob('SYNTHESIZING_ARCHITECTURE', 95);
const archPipeline = new ArchitecturePipeline(this.prisma);
await archPipeline.execute(repo.id, branchRecord.id, targetBranch.sha, {
    repoPath: clonedRepoPath,   // ← ADD THIS
    repoId: repo.id,
    branchName,
    tree: tree.map((f: any) => ({ path: f.path, type: f.type })),
    detectedServices: [],
    infraFiles: infraFileNodes.map((f: any) => f.path)
});
```

**No changes needed to:**
- `ArchitecturePipeline.ts` — already calls `agent.execute(task)` and saves `result.output.topology`
- `analysis.service.ts` — already reads `ArchitectureSnapshot.topology` generically
- `analysis.routes.ts` — already returns `topology` as-is
- `prisma/schema.prisma` — `topology: Json` is schema-agnostic

---

## 5. Phase 3 — Frontend Rewrite

### Step 3.1 — Install dependencies

```bash
cd dashboard
npm install @xyflow/react dagre @types/dagre
```

### Step 3.2 — Create node components

**File:** `dashboard/src/app/workspace/[repoId]/architecture/nodes/`

Create 4 files: `TriggerNode.tsx`, `ActionNode.tsx`, `DecisionNode.tsx`, `IntegrationNode.tsx`.

Each component receives React Flow's `NodeProps` and renders a styled card. Color tokens:

```typescript
export const NODE_COLORS = {
  TRIGGER:     { border: '#00F2FF', bg: 'rgba(0,242,255,0.08)',  icon: 'Zap'      },
  ACTION:      { border: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: 'Cpu'      },
  DECISION:    { border: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: 'GitBranch'},
  INTEGRATION: { border: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: 'Database' },
} as const;
```

**DecisionNode** must render as a rotated square (diamond) using `transform: rotate(45deg)` on the outer container and `transform: rotate(-45deg)` on the inner content to keep text upright.

**Each node** must expose `data.metadata` (file, line, method, path, condition, operation) for the detail panel.

### Step 3.3 — Create Dagre layout utility

**File:** `dashboard/src/app/workspace/[repoId]/architecture/lib/layoutDagre.ts`

```typescript
import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

const NODE_WIDTH  = 200;
const NODE_HEIGHT = 80;

export function applyDagreLayout(nodes: Node[], edges: Edge[]): Node[] {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach(e => g.setEdge(e.source, e.target));

    dagre.layout(g);

    return nodes.map(n => {
        const { x, y } = g.node(n.id);
        return { ...n, position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 } };
    });
}
```

### Step 3.4 — Rewrite `architecture/page.tsx`

**Full component structure:**

```tsx
'use client';

import { ReactFlow, Background, Controls, MiniMap,
         useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { applyDagreLayout } from './lib/layoutDagre';
import TriggerNode     from './nodes/TriggerNode';
import ActionNode      from './nodes/ActionNode';
import DecisionNode    from './nodes/DecisionNode';
import IntegrationNode from './nodes/IntegrationNode';

const nodeTypes = {
    TRIGGER:     TriggerNode,
    ACTION:      ActionNode,
    DECISION:    DecisionNode,
    INTEGRATION: IntegrationNode,
};

export default function ArchitecturePage() {
    // 1. Fetch /api/repositories/:id/architecture
    // 2. Map topology.nodes → ReactFlow nodes (type = node.type)
    // 3. Map topology.edges → ReactFlow edges (with animated: true for QUERY type)
    // 4. Run applyDagreLayout(nodes, edges)
    // 5. Render:
    //    <ReactFlow nodeTypes={nodeTypes} fitView>
    //      <Background variant={BackgroundVariant.Dots} />
    //      <Controls />
    //      <MiniMap />
    //    </ReactFlow>
    // 6. State: activeFilter (Set<string>), selectedNode (for detail panel)
}
```

**schemaVersion guard:** Before rendering, check `topology.schemaVersion`. If it is not `"2.0-workflow"`, display an "Analysis Pending" state with a "Trigger Re-sync" button. Do not attempt to render v1 topology data with the new node types.

**Filter toolbar:** Render 4 toggle buttons (one per node type). When a type is toggled off, set `hidden: true` on all nodes of that type. React Flow handles visibility automatically.

**Focus Flow mode:** On `TriggerNode` click:
1. BFS from the clicked trigger node through the edge list
2. Collect all reachable node IDs
3. Set `style.opacity = 0.15` on all non-reachable nodes and edges
4. Set `selected: true` on all reachable nodes

**Detail panel:** Slide-in panel (position: absolute, right: 0) triggered by `onNodeClick`. Render `selectedNode.data.metadata` fields: file (as a monospace path), line, method, subtype, and a list of directly connected nodes.

**Metrics footer:** Replace old coupling/integrity metrics with:
- Trigger Count (`metrics.triggerCount`)
- Actions (`metrics.actionCount`)
- Decisions (`metrics.decisionCount`)
- Integrations (`metrics.integrationCount`)
- Cyclomatic Complexity (`metrics.cyclomaticComplexity`)

---

## 6. Verification Checklist

Run these checks after each phase before proceeding:

### Phase 1 Verification
```bash
# From repo root — run the parser against this repo's own source files
python -c "
from src.engine.workflow_engine import WorkflowSemanticEngine
import asyncio, json

engine = WorkflowSemanticEngine('.')
result = asyncio.run(engine.run())
print(f'Triggers:     {result[\"metrics\"][\"triggerCount\"]}')
print(f'Actions:      {result[\"metrics\"][\"actionCount\"]}')
print(f'Decisions:    {result[\"metrics\"][\"decisionCount\"]}')
print(f'Integrations: {result[\"metrics\"][\"integrationCount\"]}')
"
```

**Expected minimum output for this repo:**
- Triggers ≥ 8 (10 routes in `analysis.routes.ts` + `sync.routes.ts` + auth routes in `main.py`)
- Actions ≥ 15 (service methods across `analysis.service.ts`, `sync.service.ts`)
- Decisions ≥ 5 (null guards, status checks in service methods)
- Integrations ≥ 20 (Prisma calls across all services)

### Phase 2 Verification
```bash
# Trigger a manual sync and check the saved topology schemaVersion
curl http://localhost:8000/internal/analyze-workflow \
  -X POST -H "Content-Type: application/json" \
  -d '{"repo_path": "."}'
# Must return: { "success": true, "data": { "topology": { "schemaVersion": "2.0-workflow", ... } } }
```

### Phase 3 Verification
- Open the Architecture tab in the dashboard for any synced repository.
- Confirm nodes render in a left-to-right flow (not circular).
- Confirm 4 distinct colors are visible (Cyan / Violet / Amber / Emerald).
- Click a TriggerNode — confirm Focus Flow highlights its execution path.
- Confirm filter buttons hide/show node groups.
- Open browser DevTools — confirm no console errors from `@xyflow/react`.

---

## 7. Do Not Touch

The following files must NOT be modified during this implementation:

| File | Reason |
|---|---|
| `prisma/schema.prisma` | No migration needed; `topology: Json` accepts new schema |
| `src/modules/analysis/analysis.routes.ts` | API contract unchanged |
| `src/modules/analysis/analysis.service.ts` | `getArchitecture()` passes topology through generically |
| `src/core/pipelines/ArchitecturePipeline.ts` | Already saves `result.output.topology` correctly |
| `dashboard/src/app/globals.css` | Do not alter global styles |
| All other workspace tabs | (`commits`, `dependencies`, `drift`, `insights`, etc.) — untouched |
