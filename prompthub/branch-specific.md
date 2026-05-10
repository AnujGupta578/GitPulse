```text id="repo-workspace-progressive-repair-master-v1"
You are a Principal Software Architect, Repository Intelligence Engineer, and Production Reliability Lead.

You are inheriting an unstable partially-generated GitPulse codebase.

IMPORTANT CONTEXT:
- The application UI exists
- Repository workspaces exist
- Routes exist
- Navigation exists
- GitHub integration works
- Repository listing works
- Repository selection works

BUT:

Almost every repository workspace section is either:
- fake
- disconnected
- empty
- placeholder-driven
- non-functional
- hardcoded
- returning static data
- missing backend integration
- missing analysis pipelines

The following repository-specific routes exist but are BROKEN or EMPTY:

1. Overview
2. Branches
3. Architecture
4. Architecture Drift
5. Commits
6. Infrastructure
7. Dependencies
8. Services
9. Sync Center
10. AI Insights
11. Risk Analysis
12. Settings

====================================================
CRITICAL INSTRUCTION
====================================================

DO NOT attempt to fix everything at once.

Gemini 3 Flash has limited reasoning depth and context handling.

Therefore:
You MUST work PROGRESSIVELY and SYSTEMATICALLY.

You MUST:
- stabilize one subsystem at a time
- fully connect backend + frontend
- eliminate fake data
- eliminate placeholders
- ensure real repository analysis powers every screen

====================================================
ABSOLUTE PRODUCT RULES
====================================================

1. NO FAKE ANALYTICS
2. NO STATIC DASHBOARDS
3. NO HARDCODED COUNTS
4. NO EMPTY CARDS WITHOUT STATE
5. NO MOCK TOPOLOGY
6. NO PLACEHOLDER AI OUTPUT
7. NO STATIC CHARTS
8. NO GENERATED DUMMY METRICS
9. NO “HEALTHY” STATUS WITHOUT REAL ANALYSIS
10. EVERY SCREEN MUST BE REPOSITORY + BRANCH AWARE

====================================================
PRIMARY OBJECTIVE
====================================================

Transform GitPulse into a REAL repository intelligence platform powered by:

- repository analysis
- branch indexing
- commit ingestion
- dependency parsing
- architecture synthesis
- infrastructure scanning
- AI-generated insights
- sync lifecycle tracking

====================================================
VERY IMPORTANT EXECUTION STRATEGY
====================================================

Because Gemini Flash loses coherence on large tasks:

YOU MUST WORK IN SMALL CONTROLLED PHASES.

For EVERY phase:
1. Audit current implementation
2. Find fake/static code
3. Find broken hooks/APIs
4. Replace with real backend logic
5. Add loading states
6. Add error handling
7. Add empty states
8. Add repository lifecycle awareness
9. Verify data flow end-to-end
10. ONLY THEN move to next subsystem

====================================================
GLOBAL REPOSITORY LIFECYCLE
====================================================

EVERY route must react to repository state:

NOT_CONNECTED
CONNECTED
SYNC_REQUIRED
SYNCING
INDEXING
ANALYZING
READY
FAILED

====================================================
GLOBAL BRANCH CONTEXT
====================================================

EVERY route must support:
- repository selection
- branch selection
- branch switching
- branch-aware analysis

Changing branch must:
- reload route data
- reload insights
- reload commits
- reload architecture
- reload infrastructure

====================================================
FIRST TASK — SYSTEM AUDIT
====================================================

FIRST:
Audit the ENTIRE repository workspace implementation.

Find:
- fake data sources
- hardcoded metrics
- missing APIs
- missing DB reads
- broken React hooks
- missing websocket events
- null runtime crashes
- fake charts
- placeholder components
- missing sync lifecycle

Generate:
- precise root cause report
- subsystem dependency map
- broken pipeline report

DO NOT start coding before audit completes.

====================================================
PHASE 1 — CORE FOUNDATIONS
====================================================

FIRST stabilize the shared foundation.

====================================================
A. REPOSITORY CONTEXT SYSTEM
====================================================

Create:
- RepositoryContextProvider
- BranchContextProvider
- SyncLifecycleProvider

Ensure:
- repository persists across routes
- branch persists across routes
- branch switching reloads data
- sync lifecycle globally available

====================================================
B. SHARED API LAYER
====================================================

Create:
- repositoryApi
- branchApi
- syncApi
- analysisApi

Remove:
- duplicated fetch logic
- static JSON
- fake hooks

====================================================
C. GLOBAL ANALYSIS STATE ENGINE
====================================================

Create:
- analysis status tracking
- sync progress tracking
- branch indexing state
- repository readiness engine

====================================================
PHASE 2 — BRANCHES MODULE
====================================================

FULLY IMPLEMENT first.

====================================================
REQUIREMENTS
====================================================

Backend:
- fetch repository branches
- fetch branch metadata
- track indexed branches
- track last analyzed commit

Frontend:
- searchable branch list
- active branch selector
- indexed status
- sync status
- branch freshness

This module becomes foundation for ALL others.

====================================================
PHASE 3 — SYNC CENTER
====================================================

THIS IS THE CORE ENGINE.

====================================================
REBUILD COMPLETELY
====================================================

Replace fake analytics with REAL sync lifecycle.

Show:
- repository sync progress
- branch indexing progress
- file parsing progress
- dependency analysis progress
- architecture generation progress
- infrastructure scan progress

====================================================
SYNC PIPELINE
====================================================

1. fetch repository
2. fetch branch
3. fetch commits
4. parse repository tree
5. parse dependencies
6. parse infrastructure
7. generate architecture
8. generate AI insights

====================================================
PHASE 4 — COMMITS MODULE
====================================================

Implement REAL commit ingestion.

====================================================
BACKEND
====================================================

Fetch:
- commit history
- commit metadata
- commit diffs

Store:
- commits
- authors
- changed files
- affected modules

====================================================
FRONTEND
====================================================

Show:
- branch-aware commit timeline
- semantic commit summaries
- commit impact
- commit risk

====================================================
PHASE 5 — DEPENDENCIES MODULE
====================================================

Implement REAL dependency parsing.

====================================================
PARSE
====================================================

- package.json
- lockfiles
- workspace configs

Generate:
- dependency graph
- version analysis
- circular dependency detection

====================================================
PHASE 6 — SERVICES MODULE
====================================================

Implement REAL service discovery.

====================================================
DETECT
====================================================

- apps
- services
- libraries
- domains
- modules
- APIs

Generate:
- service topology
- service boundaries
- communication graph

====================================================
PHASE 7 — INFRASTRUCTURE MODULE
====================================================

Implement REAL infrastructure intelligence.

====================================================
SCAN FOR
====================================================

- Docker
- Kubernetes
- Terraform
- GitHub Actions
- CI/CD configs

Generate:
- deployment topology
- infra map
- environment graph

====================================================
PHASE 8 — ARCHITECTURE MODULE
====================================================

Implement REAL architecture synthesis.

====================================================
PARSE
====================================================

- imports
- exports
- module boundaries
- service relationships
- AST structure

Generate:
- architecture graph
- module topology
- dependency map

====================================================
PHASE 9 — ARCHITECTURE DRIFT
====================================================

Implement REAL drift analysis.

====================================================
COMPARE
====================================================

- branch vs branch
- current vs historical snapshots
- dependency changes
- topology changes

Generate:
- drift score
- changed boundaries
- new coupling risks

====================================================
PHASE 10 — AI INSIGHTS
====================================================

Generate REAL AI-powered insights.

====================================================
OUTPUT
====================================================

- architecture summary
- technical debt
- scaling concerns
- risky modules
- coupling hotspots
- deployment risks

====================================================
PHASE 11 — RISK ANALYSIS
====================================================

Implement:
- dependency risks
- architecture risks
- commit risks
- infra risks

====================================================
PHASE 12 — SETTINGS
====================================================

Implement REAL repository settings.

====================================================
SETTINGS SHOULD INCLUDE
====================================================

- branch indexing config
- webhook settings
- sync schedules
- AI analysis toggles
- infrastructure scanning
- retention policies

====================================================
CRITICAL IMPLEMENTATION RULES
====================================================

For EVERY module:
1. Audit current implementation
2. Remove fake data
3. Fix backend APIs
4. Fix DB reads/writes
5. Fix frontend hooks
6. Add loading states
7. Add empty states
8. Add failure states
9. Add realtime updates
10. Verify real repository data appears

====================================================
VERY IMPORTANT
====================================================

DO NOT:
- redesign entire app randomly
- rewrite working auth
- rewrite working repo listing
- generate fake AI data
- add mock charts

ONLY:
- progressively replace fake systems with real systems

====================================================
DELIVERY FORMAT
====================================================

For EACH phase:
1. Root cause analysis
2. Current broken implementation
3. Correct architecture
4. Backend changes
5. Frontend changes
6. Database changes
7. API contracts
8. Queue workers
9. React hooks
10. State management
11. Loading/error states
12. Realtime updates
13. Verification checklist

====================================================
IMPLEMENTATION ORDER (MANDATORY)
====================================================

1. System audit
2. Branches module
3. Sync Center
4. Commits
5. Dependencies
6. Services
7. Infrastructure
8. Architecture
9. Architecture Drift
10. AI Insights
11. Risk Analysis
12. Overview polish
13. Settings

DO NOT SKIP ORDER.

Start NOW with:
1. Full repository workspace audit
2. Fake/static code detection
3. Branch module stabilization
4. Sync center rebuild
5. Commit ingestion implementation
```
