```text id="gap-filling-system-repair-v1"
You are a Principal Staff Engineer, Systems Architect, Repository Intelligence Expert, and Production Reliability Engineer.

Current state of the Orchestrator platform:

====================================================
WORKING
====================================================

- GitHub authentication works
- Repository listing works
- Repository workspace routing exists
- Branch selection partially exists
- UI shell exists
- Repository-centric navigation exists

====================================================
BROKEN / EMPTY / FAKE FEATURES
====================================================

CRITICAL ISSUES:

1. Architecture page broken
   - architecture drift throws:
     "length undefined" error
   - architecture graph not rendering
   - no real architecture analysis

2. Commits page broken
   - no commit list
   - no branch-aware commit switching
   - no commit timeline
   - no commit intelligence

3. Infrastructure page empty
   - no Docker analysis
   - no Kubernetes analysis
   - no Terraform parsing
   - no CI/CD analysis

4. Dependencies Intelligence empty
   - no dependency graph
   - no package parsing
   - no module relationship detection

5. Services Intelligence empty
   - no service discovery
   - no module boundaries
   - no domain detection

6. Sync Center fake
   - showing meaningless analytics
   - no real sync jobs
   - no branch indexing state
   - no repository indexing pipeline

7. Insights empty
   - no AI analysis
   - no summaries
   - no risk detection
   - no architecture insights

8. Settings empty
   - no repository settings
   - no webhook settings
   - no branch indexing config
   - no sync controls

====================================================
PRIMARY OBJECTIVE
====================================================

STOP showing fake/static/demo data.

Replace ALL placeholder systems with REAL repository intelligence pipelines.

The system must now become:
- repository-aware
- branch-aware
- sync-aware
- architecture-aware
- commit-aware

Every page must be connected to REAL repository analysis.

====================================================
CRITICAL PRODUCT RULE
====================================================

DO NOT render empty intelligence pages.

Instead:
- detect repository state
- detect sync state
- detect analysis state
- guide user through indexing lifecycle

Every screen must have:
1. Initial empty state
2. Sync required state
3. Indexing state
4. Analysis state
5. Success state
6. Failure state

====================================================
PHASE 1 — ROOT CAUSE AUDIT
====================================================

FIRST:
Audit the ENTIRE repository workspace system.

Find:
- why architecture drift throws length undefined
- where null data is entering
- why commit APIs return empty
- why infrastructure scanner never runs
- why dependency engine never executes
- why services analyzer never executes
- why sync center uses fake metrics
- why insights pipeline missing
- why settings page has no implementation

DO NOT GUESS.

Trace:
- frontend hooks
- backend APIs
- websocket events
- sync workers
- branch context
- repository state lifecycle
- analysis pipelines

====================================================
PHASE 2 — REPOSITORY ANALYSIS PIPELINE
====================================================

Design the REAL repository intelligence lifecycle.

====================================================
NEW REPOSITORY LIFECYCLE
====================================================

Repository State Machine:

NOT_CONNECTED
↓
CONNECTED
↓
SYNC_PENDING
↓
INDEXING
↓
ANALYZING
↓
ARCHITECTURE_READY
↓
INSIGHTS_READY
↓
CONTINUOUS_SYNC

Every page must react to this lifecycle.

====================================================
PHASE 3 — SYNC CENTER REDESIGN
====================================================

Sync Center must become the CORE ENGINE.

====================================================
SYNC CENTER RESPONSIBILITIES
====================================================

The sync center should:

1. Trigger repository clone/fetch
2. Track branch indexing
3. Parse repository structure
4. Parse commits
5. Parse dependencies
6. Parse infrastructure files
7. Generate architecture graph
8. Generate service map
9. Generate AI insights
10. Persist analysis snapshots

====================================================
SYNC CENTER UI
====================================================

REMOVE:
- fake analytics
- meaningless charts
- static metrics

REPLACE WITH:
- repository sync timeline
- branch indexing progress
- file scan progress
- commit ingestion progress
- dependency analysis progress
- architecture generation progress
- infrastructure parsing progress
- AI insight generation progress

====================================================
SYNC PIPELINE
====================================================

Build real pipeline:

STEP 1:
Fetch repository metadata

STEP 2:
Fetch selected branch

STEP 3:
Fetch commit history

STEP 4:
Parse repository tree

STEP 5:
Detect languages/frameworks

STEP 6:
Parse dependencies

STEP 7:
Detect services/modules

STEP 8:
Parse infrastructure

STEP 9:
Generate architecture graph

STEP 10:
Generate AI insights

====================================================
PHASE 4 — ARCHITECTURE SYSTEM
====================================================

REBUILD architecture engine completely.

====================================================
ARCHITECTURE INPUTS
====================================================

Parse:
- folder structure
- imports
- exports
- package.json
- tsconfig
- Dockerfiles
- internal APIs
- service communication
- monorepo structure

====================================================
ARCHITECTURE OUTPUTS
====================================================

Generate:
- module graph
- service graph
- dependency graph
- layer analysis
- domain boundaries
- architecture drift
- coupling score

====================================================
FIX LENGTH UNDEFINED ERROR
====================================================

Audit:
- graph node arrays
- edge arrays
- API response typing
- undefined/null handling
- async loading race conditions

Implement:
- runtime validation
- Zod schemas
- safe defaults
- skeleton states
- loading guards

====================================================
PHASE 5 — COMMIT INTELLIGENCE
====================================================

Implement REAL commit analysis.

====================================================
COMMIT PIPELINE
====================================================

For selected branch:
1. fetch commits
2. parse diffs
3. detect changed modules
4. classify commit intent
5. detect risky commits
6. generate commit summaries

====================================================
COMMIT PAGE FEATURES
====================================================

Add:
- branch selector
- commit timeline
- commit diff summary
- affected services
- commit risk score
- author analysis
- commit velocity
- architecture impact

====================================================
PHASE 6 — INFRASTRUCTURE INTELLIGENCE
====================================================

Build REAL infrastructure scanner.

====================================================
SCAN FOR
====================================================

- Dockerfile
- docker-compose
- Kubernetes YAML
- Helm charts
- Terraform
- GitHub Actions
- Jenkins
- CircleCI
- AWS configs

====================================================
OUTPUT
====================================================

Generate:
- deployment topology
- infra graph
- environment mapping
- service deployment map
- runtime dependencies

====================================================
PHASE 7 — DEPENDENCY INTELLIGENCE
====================================================

Build REAL dependency analyzer.

====================================================
PARSE
====================================================

- package.json
- pnpm-lock
- yarn.lock
- requirements.txt
- pom.xml
- go.mod

====================================================
OUTPUT
====================================================

Generate:
- dependency graph
- outdated dependencies
- risky dependencies
- duplicate packages
- circular dependencies

====================================================
PHASE 8 — SERVICES INTELLIGENCE
====================================================

Implement service/module discovery.

====================================================
DETECT
====================================================

- frontend apps
- backend services
- shared libraries
- API gateways
- domains/modules
- microservices

====================================================
OUTPUT
====================================================

Generate:
- service topology
- domain ownership
- inter-service communication
- bounded contexts

====================================================
PHASE 9 — INSIGHTS ENGINE
====================================================

Build AI-powered insights system.

====================================================
GENERATE
====================================================

- repository summary
- architecture summary
- risky patterns
- scaling concerns
- technical debt
- coupling risks
- deployment risks
- branch drift analysis

====================================================
PHASE 10 — SETTINGS PAGE
====================================================

Repository settings must include:

1. Branch indexing config
2. Webhook management
3. Sync schedules
4. AI analysis controls
5. Infrastructure scanning toggles
6. Repository visibility
7. Token permissions
8. Sync retention rules

====================================================
PHASE 11 — EMPTY STATE SYSTEM
====================================================

Every intelligence page must support:

STATE 1:
No branch selected

STATE 2:
Branch not indexed

STATE 3:
Sync required

STATE 4:
Analysis running

STATE 5:
Data available

STATE 6:
Analysis failed

====================================================
PHASE 12 — BACKEND ARCHITECTURE
====================================================

Create dedicated pipelines:

- RepositorySyncPipeline
- CommitIngestionPipeline
- DependencyAnalysisPipeline
- InfrastructurePipeline
- ArchitecturePipeline
- InsightsPipeline

====================================================
PHASE 13 — FRONTEND ARCHITECTURE
====================================================

Create:
- RepositoryAnalysisProvider
- BranchAnalysisProvider
- SyncLifecycleProvider
- IntelligenceStateProvider

====================================================
PHASE 14 — IMPLEMENTATION PRIORITY
====================================================

IMPLEMENT IN THIS ORDER:

STEP 1:
Fix all runtime crashes

STEP 2:
Fix branch-aware repository context

STEP 3:
Implement real sync lifecycle

STEP 4:
Implement commit ingestion

STEP 5:
Implement dependency analysis

STEP 6:
Implement infrastructure analysis

STEP 7:
Implement architecture graph

STEP 8:
Implement AI insights

STEP 9:
Implement settings system

====================================================
IMPORTANT ENGINEERING RULES
====================================================

- NO FAKE DATA
- NO STATIC PLACEHOLDERS
- NO EMPTY DASHBOARDS
- NO MOCK ANALYTICS
- NO HARDCODED ARCHITECTURE
- NO NULL RUNTIME FAILURES

Every UI must reflect REAL backend state.

====================================================
DELIVERY REQUIREMENTS
====================================================

For EACH subsystem:
1. Root cause analysis
2. Architecture reasoning
3. Backend implementation
4. Frontend implementation
5. Queue workers
6. Parsing strategy
7. DB schema
8. APIs
9. State lifecycle
10. Loading/error states
11. Realtime events
12. Scaling strategy

START NOW with:
1. Runtime crash audit
2. Repository lifecycle redesign
3. Sync center rebuild
4. Commit ingestion implementation
5. Dependency analysis implementation
6. Architecture engine rebuild
7. Infrastructure intelligence implementation
8. Insights engine implementation
```
