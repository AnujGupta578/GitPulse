```text id="critical-repo-intelligence-recovery-v2"
You are a Principal Reliability Engineer, Repository Intelligence Architect, and Full-Stack Stabilization Lead.

The GitPulse platform is currently NON-FUNCTIONAL.

====================================================
CRITICAL REALITY
====================================================

The UI exists visually.

But:
- almost all repository intelligence features are broken
- APIs are returning invalid shapes
- frontend expects arrays but receives objects/null
- sync pipelines are fake
- analysis pipelines are fake
- architecture graph is empty
- no real repository analysis exists
- branch-aware intelligence does not exist
- drift comparison does not exist
- frontend/runtime crashes everywhere

The current platform is effectively:
“A styled shell with disconnected APIs”

We must now STOP feature expansion and enter:
FULL SYSTEM STABILIZATION MODE.

====================================================
CRITICAL RULE
====================================================

DO NOT ADD NEW FEATURES.

DO NOT GENERATE MORE PLACEHOLDER APIs.

DO NOT GENERATE MORE STATIC UI.

DO NOT GENERATE EMPTY OBJECTS TO SATISFY TYPES.

We must:
1. stabilize data contracts
2. stabilize repository indexing
3. stabilize branch intelligence
4. generate REAL repository analysis
5. connect frontend to REAL backend state

====================================================
CURRENT VERIFIED FAILURES
====================================================

====================================================
FRONTEND RUNTIME FAILURES
====================================================

1. Settings page:
Cannot read properties of undefined (reading 'branchPattern')

2. Dependencies:
Cannot read properties of undefined (reading 'length')

3. Infrastructure:
x.map is not a function

4. Commits:
m.map is not a function

5. Branches:
x.filter is not a function

====================================================
API FAILURES
====================================================

/insights?_rsc=xxxx -> NOT FOUND
/activity?_rsc=xxxx -> NOT FOUND

====================================================
ARCHITECTURE API RETURNS EMPTY DATA
====================================================

{
  success: true,
  data: {
    topology: {
      nodes: [],
      edges: []
    },
    metrics: null
  }
}

====================================================
PRODUCT FAILURES
====================================================

- no branch switching in architecture
- no branch compare in drift
- no real commit ingestion
- no dependency parsing
- no infrastructure parsing
- no services detection
- no topology generation
- no AI insights
- no repository indexing lifecycle

====================================================
PRIMARY OBJECTIVE
====================================================

Transform the platform from:
“Static shell + fake APIs”

INTO:
“Real repository intelligence engine”

====================================================
PHASE 1 — COMPLETE CONTRACT AUDIT
====================================================

FIRST:
Audit ALL frontend/backend contracts.

Find EVERY mismatch between:
- frontend expectations
- backend response shapes
- Prisma models
- analysis pipelines

====================================================
GENERATE:
====================================================

1. Route contract report
2. Invalid response shape report
3. Nullability mismatch report
4. Array/object mismatch report
5. Missing endpoint report
6. Frontend crash map

====================================================
DO NOT PATCH RANDOMLY
====================================================

Trace EVERY crash to:
- backend response
- frontend assumption
- missing analysis state
- missing repository lifecycle

====================================================
PHASE 2 — API CONTRACT NORMALIZATION
====================================================

ALL APIs must return stable typed responses.

====================================================
STANDARD RESPONSE
====================================================

{
  success: true,
  data: {},
  error: null,
  meta: {}
}

====================================================
RULES
====================================================

- arrays ALWAYS arrays
- objects ALWAYS objects
- never null unexpectedly
- never undefined
- never partial shapes

====================================================
EXAMPLES
====================================================

BAD:
dependencies: undefined

GOOD:
dependencies: []

BAD:
commits: null

GOOD:
commits: []

BAD:
settings: {}

GOOD:
settings: {
  branchPattern: "*",
  autoSync: false,
  ...
}

====================================================
PHASE 3 — REPOSITORY INDEXING ENGINE
====================================================

CRITICAL ISSUE:
No REAL repository indexing exists.

The APIs are empty because:
- repositories are not analyzed
- branches are not indexed
- commits are not persisted
- dependency graph not generated
- infrastructure not parsed

====================================================
BUILD REAL INDEXING PIPELINE
====================================================

Repository Sync Lifecycle:

1. clone/fetch repo
2. checkout branch
3. scan repository tree
4. ingest commits
5. parse dependencies
6. parse infrastructure
7. generate service topology
8. generate architecture graph
9. generate AI insights
10. persist snapshots

====================================================
PHASE 4 — BRANCH INTELLIGENCE FOUNDATION
====================================================

Branch awareness is currently broken.

====================================================
IMPLEMENT:
====================================================

- repository branch table
- branch sync state
- branch indexing timestamps
- branch analysis snapshots
- active branch context

====================================================
ALL MODULES MUST BECOME:
====================================================

repository + branch aware

====================================================
PHASE 5 — ARCHITECTURE ENGINE REBUILD
====================================================

Current issue:
Architecture API always returns empty graph.

====================================================
ROOT CAUSE
====================================================

No real architecture synthesis exists.

====================================================
BUILD REAL PIPELINE
====================================================

Parse:
- imports
- exports
- folder structure
- package boundaries
- services
- modules

Generate:
- nodes
- edges
- topology metrics
- coupling graph

====================================================
ARCHITECTURE API
====================================================

GET /repositories/:id/architecture?branch=main

Must return:
{
  topology: {
    nodes: [...],
    edges: [...]
  },
  metrics: {
    services,
    modules,
    couplingScore,
    dependencyCount
  }
}

====================================================
PHASE 6 — BRANCH SWITCHING
====================================================

CURRENTLY MISSING.

====================================================
IMPLEMENT GLOBAL BRANCH CONTEXT
====================================================

Changing branch must reload:
- architecture
- commits
- dependencies
- infrastructure
- drift analysis
- insights

====================================================
PHASE 7 — DRIFT ANALYSIS SYSTEM
====================================================

CURRENTLY NON-EXISTENT.

====================================================
IMPLEMENT:
====================================================

Branch-to-branch comparison.

====================================================
UX REQUIREMENTS
====================================================

Source Branch:
- main

Target Branch:
- feature/x

Generate:
- topology drift
- dependency drift
- service drift
- commit divergence
- architecture risk

====================================================
NEW API
====================================================

GET /repositories/:id/drift?base=main&compare=feature-x

====================================================
PHASE 8 — COMMITS ENGINE
====================================================

Current issue:
commits API shape broken + no real ingestion.

====================================================
IMPLEMENT:
====================================================

- commit ingestion
- commit persistence
- branch-specific commits
- commit diff analysis

====================================================
RETURN:
====================================================

{
  commits: [...]
}

NEVER raw arrays.

====================================================
PHASE 9 — DEPENDENCY ENGINE
====================================================

Current issue:
undefined.length runtime crash.

====================================================
FIX:
====================================================

1. stable API contract
2. real dependency parsing

====================================================
PARSE:
====================================================

- package.json
- lockfiles
- workspace configs

====================================================
RETURN:
====================================================

{
  dependencies: [],
  stats: {}
}

====================================================
PHASE 10 — INFRASTRUCTURE ENGINE
====================================================

Current issue:
map() called on invalid object.

====================================================
FIX:
====================================================

Always return:
{
  resources: []
}

====================================================
REAL PARSING
====================================================

Scan:
- Docker
- K8s
- Terraform
- CI/CD configs

====================================================
PHASE 11 — SETTINGS PAGE REBUILD
====================================================

Current issue:
branchPattern undefined.

====================================================
CAUSE:
====================================================

Settings API incomplete.

====================================================
REQUIRED RESPONSE
====================================================

{
  branchPattern: "*",
  autoSync: false,
  indexingEnabled: true,
  webhookEnabled: true,
  retentionDays: 30
}

====================================================
PHASE 12 — REMOVE FAKE FALLBACKS
====================================================

STOP returning:
- fake analytics
- empty topology pretending success
- fake healthy states

Instead:
Use explicit analysis states.

====================================================
EXAMPLE
====================================================

{
  status: "NOT_INDEXED",
  message: "Branch has not been analyzed yet"
}

====================================================
PHASE 13 — FRONTEND HARDENING
====================================================

Add:
- runtime guards
- loading boundaries
- schema validation
- safe array checks
- empty state handling

====================================================
NO MORE:
====================================================

x.map(...)
x.filter(...)
x.length

WITHOUT VALIDATION.

====================================================
PHASE 14 — IMPLEMENTATION ORDER
====================================================

MANDATORY:

STEP 1:
Fix API contracts

STEP 2:
Fix runtime crashes

STEP 3:
Implement repository indexing

STEP 4:
Implement branch awareness

STEP 5:
Implement commit ingestion

STEP 6:
Implement dependency parsing

STEP 7:
Implement infrastructure parsing

STEP 8:
Implement architecture synthesis

STEP 9:
Implement drift analysis

STEP 10:
Implement AI insights

====================================================
DELIVERY REQUIREMENTS
====================================================

For EACH subsystem:
1. Root cause analysis
2. Broken contract analysis
3. Correct response schemas
4. Backend fixes
5. Frontend fixes
6. Repository indexing logic
7. Branch-aware implementation
8. Runtime hardening
9. Empty states
10. Verification checklist

====================================================
MOST IMPORTANT RULE
====================================================

Do NOT fake intelligence.

If repository has not been indexed:
SHOW THAT CLEARLY.

Only show:
- commits
- architecture
- dependencies
- topology
- risks

WHEN REAL ANALYSIS EXISTS.

START NOW with:
1. Full API contract audit
2. Runtime crash stabilization
3. Repository indexing engine
4. Branch-aware architecture engine
5. Drift comparison implementation
```
