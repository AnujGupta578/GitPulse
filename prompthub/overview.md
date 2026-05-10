```text id="overview-rebuild-repo-workspace-v3"
You are a Principal Product Engineer, Repository Intelligence Architect, and Senior UX Systems Designer.

We are now rebuilding the Repository Workspace Overview page of the GitPulse platform.

====================================================
CURRENT PROBLEM
====================================================

The repository workspace shell exists visually, but the Overview page is mostly fake, empty, disconnected, or misleading.

The current UI has:
- branch selector not loading branch list
- fake “Synced” state
- empty architecture snapshot
- empty AI intelligence
- empty recent commits
- fake topology
- fake commit velocity
- zero architecture nodes
- zero active branches
- no repository lifecycle awareness

The UI looks good visually but has NO real intelligence pipeline behind it.

We must now transform the Overview page into a REAL repository intelligence dashboard.

====================================================
PRIMARY OBJECTIVE
====================================================

The Overview page must become the REAL operational intelligence center for a repository + branch.

It must:
- reflect actual repository state
- reflect branch indexing state
- reflect sync lifecycle
- reflect real analysis progress
- show meaningful intelligence
- guide user through repository indexing lifecycle

====================================================
CRITICAL PRODUCT RULE
====================================================

DO NOT show fake zero metrics.

DO NOT show empty widgets without context.

DO NOT show “Healthy” unless analysis actually completed.

EVERY widget must be:
- state-aware
- sync-aware
- branch-aware
- analysis-aware

====================================================
OVERVIEW PAGE REDESIGN
====================================================

The page should dynamically adapt based on repository lifecycle.

====================================================
REPOSITORY LIFECYCLE STATES
====================================================

STATE 1:
Repository connected but never synced

STATE 2:
Repository syncing

STATE 3:
Branch indexing

STATE 4:
Architecture analysis running

STATE 5:
Insights generation running

STATE 6:
Repository intelligence ready

STATE 7:
Sync failed

====================================================
OVERVIEW PAGE MUST REACT TO EACH STATE
====================================================

Example:

If repository never synced:
- show onboarding CTA
- show “Start Initial Analysis”
- explain what analysis will generate

If syncing:
- show live sync progress
- show branch indexing progress
- show commit ingestion progress

If analysis complete:
- show architecture metrics
- show dependency graph summary
- show commit insights
- show topology
- show AI summary

====================================================
PHASE 1 — BRANCH SELECTOR FIX
====================================================

CURRENT ISSUE:
Branch dropdown exists visually but does not load branches.

====================================================
FIX REQUIREMENTS
====================================================

Build REAL branch loading pipeline.

Backend:
GET /repositories/:repoId/branches

Must return:
- branch name
- default branch
- indexed status
- last indexed commit
- last sync time
- analysis readiness

Frontend:
- searchable dropdown
- loading state
- empty state
- default branch badge
- indexed status indicator

When branch changes:
- reload ALL overview widgets
- reload architecture snapshot
- reload commits
- reload sync status
- reload AI insights

====================================================
PHASE 2 — SYNC TOGGLE REDESIGN
====================================================

CURRENT ISSUE:
“Synced” status is fake/static.

====================================================
NEW DESIGN
====================================================

Replace static synced badge with:

====================================================
SYNC CONTROL PANEL
====================================================

Should include:
- Enable Sync toggle
- Auto Sync toggle
- Manual Sync button
- Full Reindex button
- Sync status indicator
- Last sync timestamp

====================================================
SYNC STATES
====================================================

NOT_SYNCED
SYNCING
INDEXING
ANALYZING
READY
FAILED
PAUSED

====================================================
SYNC STATUS UI
====================================================

Must show:
- progress %
- current task
- files indexed
- commits analyzed
- dependencies parsed
- architecture generated

====================================================
PHASE 3 — OVERVIEW METRICS REBUILD
====================================================

CURRENT ISSUE:
Metrics show fake zeros.

====================================================
REMOVE FAKE CARDS
====================================================

Replace:
- Commit History
- Architecture Nodes
- Active Branches
- Sync Status

WITH REAL ANALYSIS CARDS.

====================================================
NEW METRICS
====================================================

1. Indexed Commits
2. Parsed Files
3. Services Detected
4. Dependencies Parsed
5. Architecture Components
6. Infrastructure Assets
7. Last Indexed Commit
8. Branch Drift Score
9. Risk Score
10. Sync Freshness

====================================================
BACKEND SOURCES
====================================================

Metrics must come from:
- repository scan results
- AST analysis
- dependency graph
- commit ingestion
- infrastructure parser

====================================================
PHASE 4 — ARCHITECTURE SNAPSHOT
====================================================

CURRENT ISSUE:
No architecture snapshot exists.

====================================================
REQUIRED IMPLEMENTATION
====================================================

Generate REAL architecture preview.

Pipeline:
1. Parse repository tree
2. Detect modules/services
3. Detect imports
4. Detect dependencies
5. Build topology graph
6. Generate snapshot layout

====================================================
ARCHITECTURE SNAPSHOT UI
====================================================

Show:
- service nodes
- module nodes
- dependency edges
- bounded contexts
- layered structure

====================================================
EMPTY STATE
====================================================

If no architecture generated:
Show:
- “Architecture analysis not generated yet”
- “Run analysis”
- “Select indexed branch”

====================================================
PHASE 5 — AI INTELLIGENCE PANEL
====================================================

CURRENT ISSUE:
AI Intelligence is fake placeholder.

====================================================
REBUILD AS:
====================================================

Repository Intelligence Summary

Generate REAL summaries:
- detected architecture style
- detected frameworks
- repository complexity
- coupling concerns
- scaling risks
- technical debt signals
- architectural hotspots

====================================================
AI PANEL MUST SHOW
====================================================

- summary paragraph
- risk indicators
- architecture observations
- dominant technologies
- branch-specific insights

====================================================
PHASE 6 — RECENT COMMITS PANEL
====================================================

CURRENT ISSUE:
No commit ingestion.

====================================================
IMPLEMENT REAL COMMIT PIPELINE
====================================================

For selected branch:
- fetch commits
- persist commits
- analyze commits
- classify intent

====================================================
RECENT COMMITS PANEL
====================================================

Show:
- commit message
- author
- timestamp
- affected modules
- risk score
- semantic intent

Add:
- branch-specific commits
- infinite scroll
- open full commits page

====================================================
PHASE 7 — TOPOLOGICAL NODES PANEL
====================================================

CURRENT ISSUE:
No topology analysis.

====================================================
IMPLEMENT:
====================================================

Generate:
- service topology
- module relationships
- dependency hotspots
- graph density

====================================================
SHOW:
====================================================

- total services
- core modules
- dependency bottlenecks
- graph complexity

====================================================
PHASE 8 — COMMIT VELOCITY PANEL
====================================================

CURRENT ISSUE:
Fake graph.

====================================================
IMPLEMENT REAL VELOCITY ANALYSIS
====================================================

Generate:
- commits per day
- commits per branch
- contributor activity
- architecture churn

Use REAL commit history.

====================================================
PHASE 9 — OVERVIEW BACKEND PIPELINE
====================================================

Create:
- RepositoryOverviewService
- BranchAnalysisService
- OverviewAggregationPipeline
- RepositoryHealthEngine
- SyncStateEngine

====================================================
NEW API
====================================================

GET /repositories/:repoId/overview?branch=main

Response:
{
  repository,
  branch,
  syncStatus,
  metrics,
  architectureSnapshot,
  recentCommits,
  aiInsights,
  topology,
  velocity,
  riskAnalysis
}

====================================================
PHASE 10 — STATE MANAGEMENT
====================================================

Create:
- useRepositoryOverview()
- useBranchContext()
- useSyncLifecycle()
- useOverviewMetrics()

====================================================
PHASE 11 — EMPTY/LOADING STATES
====================================================

EVERY widget must support:
- loading
- syncing
- partial analysis
- ready
- failed
- retry

====================================================
PHASE 12 — UI/UX IMPROVEMENTS
====================================================

Keep:
- futuristic dark theme
- neon gradients
- glassmorphism

Improve:
- hierarchy
- readability
- repository context
- branch context
- sync visibility

====================================================
PHASE 13 — IMPLEMENTATION PRIORITY
====================================================

STEP 1:
Fix branch selector

STEP 2:
Implement repository overview API

STEP 3:
Implement sync lifecycle engine

STEP 4:
Implement commit ingestion

STEP 5:
Implement architecture snapshot

STEP 6:
Implement AI insights

STEP 7:
Implement topology analysis

STEP 8:
Implement commit velocity

====================================================
IMPORTANT ENGINEERING RULES
====================================================

- NO FAKE METRICS
- NO STATIC STATUS
- NO EMPTY PLACEHOLDERS
- NO HARDCODED GRAPHS
- NO STATIC COMMITS

All overview data must be:
- repository-aware
- branch-aware
- sync-aware
- generated from real repository analysis

====================================================
DELIVERY REQUIREMENTS
====================================================

For EACH feature:
1. Root cause analysis
2. UX reasoning
3. Backend implementation
4. Frontend implementation
5. DB schema
6. Queue workers
7. Sync lifecycle
8. API contracts
9. React hooks
10. Realtime updates
11. Loading/error states
12. Scaling strategy

START NOW with:
1. Branch selector repair
2. Repository overview API
3. Sync lifecycle redesign
4. Commit ingestion system
5. Architecture snapshot generator
6. AI intelligence pipeline
7. Topology analysis system
8. Commit velocity engine
```
