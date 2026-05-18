```text id="overview-and-drift-stabilization-v3"
You are a Principal Repository Intelligence Architect and Senior Product Systems Engineer.

The GitPulse platform has improved partially.

Some repository intelligence pipelines are now producing REAL data.

However, there are still major architectural and UX gaps that break the product experience.

====================================================
CURRENT VERIFIED ISSUES
====================================================

1. Overview page still mostly empty
   - overview widgets not showing real results
   - metrics incomplete
   - architecture snapshot incomplete
   - sync intelligence disconnected

2. Architecture Drift is broken/inaccurate
   - comparison appears hardcoded against main
   - no branch compare selector
   - no explicit comparison workflow
   - drift often shows nothing
   - drift engine likely failing because:
     - selected branch == main
     - comparison branch missing
     - snapshots unavailable
     - branch context not propagated

3. Branch comparison UX is missing entirely
   - user cannot choose:
     - source branch
     - target branch
   - system auto-compares silently
   - current behavior is confusing and incorrect

====================================================
PRIMARY OBJECTIVE
====================================================

Stabilize:
1. Overview Intelligence
2. Branch Comparison System
3. Architecture Drift Engine

Transform drift analysis into a REAL repository comparison engine.

====================================================
CRITICAL PRODUCT RULE
====================================================

DO NOT silently compare branches.

DO NOT hardcode comparisons against main.

DO NOT auto-assume base branch.

User must ALWAYS understand:
- what is being compared
- which branch is active
- which branch is baseline
- whether snapshots exist

====================================================
PHASE 1 — OVERVIEW PAGE REBUILD
====================================================

CURRENT ISSUE:
Overview page still partially disconnected.

====================================================
ROOT CAUSE ANALYSIS
====================================================

Audit:
- overview aggregation API
- branch context propagation
- repository analysis state
- widget data contracts
- snapshot retrieval
- sync lifecycle integration

Find:
- missing queries
- empty snapshot reads
- stale branch state
- incorrect fallback logic
- invalid overview aggregations

====================================================
OVERVIEW API REQUIREMENTS
====================================================

GET /repositories/:id/overview?branch=main

Must aggregate REAL:
- sync state
- indexed commits
- architecture metrics
- dependency metrics
- services count
- infra assets
- branch freshness
- AI insights
- commit velocity

====================================================
OVERVIEW SHOULD NEVER SHOW:
====================================================

- fake zeros
- fake healthy states
- placeholder topology

====================================================
IF NO DATA EXISTS:
====================================================

Return explicit state:
{
  status: "NOT_INDEXED",
  message: "Branch has not been analyzed yet"
}

====================================================
PHASE 2 — GLOBAL BRANCH CONTEXT SYSTEM
====================================================

CURRENT ISSUE:
Branch context is fragmented across routes.

====================================================
IMPLEMENT:
====================================================

Global Branch Context Provider.

====================================================
RESPONSIBILITIES
====================================================

- active repository
- active branch
- compare branch
- branch sync status
- branch analysis state

====================================================
WHEN ACTIVE BRANCH CHANGES
====================================================

Reload:
- overview
- architecture
- dependencies
- commits
- infrastructure
- services
- insights
- drift

====================================================
WHEN COMPARE BRANCH CHANGES
====================================================

Reload:
- drift analysis
- topology comparison
- dependency drift
- architecture deltas

====================================================
PHASE 3 — DRIFT ANALYSIS REDESIGN
====================================================

CURRENT ISSUE:
Drift analysis appears hardcoded against main.

This is architecturally incorrect.

====================================================
NEW DRIFT MODEL
====================================================

Drift must become:
EXPLICIT branch-to-branch comparison.

====================================================
REQUIRED UX
====================================================

TOP BAR:
--------------------------------
Source Branch: [ dropdown ]
Compare With: [ dropdown ]
Analyze Drift [ button ]
--------------------------------

====================================================
DEFAULT BEHAVIOR
====================================================

If no compare branch selected:
DO NOT auto-run drift.

Instead show:
“Select branches to compare”

====================================================
VALID COMPARISON EXAMPLES
====================================================

main vs feature/auth

develop vs release/v2

feature/a vs feature/b

====================================================
PHASE 4 — DRIFT ENGINE REBUILD
====================================================

CURRENT ISSUE:
No meaningful drift output.

====================================================
IMPLEMENT REAL COMPARISON PIPELINE
====================================================

STEP 1:
Load source branch snapshot

STEP 2:
Load compare branch snapshot

STEP 3:
Compare:
- architecture graph
- dependencies
- services
- infra topology
- module structure
- commit divergence

====================================================
GENERATE:
====================================================

- added services
- removed services
- dependency drift
- coupling drift
- topology drift
- infra drift
- risk delta

====================================================
NEW API
====================================================

GET /repositories/:id/drift
?source=develop
&target=feature-auth

====================================================
VALID RESPONSE
====================================================

{
  sourceBranch,
  targetBranch,
  summary,
  topologyChanges,
  dependencyChanges,
  serviceChanges,
  riskDelta,
  driftScore
}

====================================================
PHASE 5 — DRIFT EMPTY STATES
====================================================

Currently the system silently fails.

====================================================
IMPLEMENT EXPLICIT STATES
====================================================

CASE 1:
No source branch selected

CASE 2:
No target branch selected

CASE 3:
Branches identical

CASE 4:
Snapshots missing

CASE 5:
Branch not indexed

CASE 6:
Analysis running

CASE 7:
Drift ready

====================================================
EXAMPLE
====================================================

{
  status: "SNAPSHOT_MISSING",
  message: "Target branch has not been indexed yet"
}

====================================================
PHASE 6 — SNAPSHOT SYSTEM STABILIZATION
====================================================

Current issue likely:
drift has nothing to compare.

====================================================
IMPLEMENT:
====================================================

Branch snapshot lifecycle.

====================================================
FOR EACH BRANCH STORE:
====================================================

- architecture snapshot
- dependency snapshot
- services snapshot
- infra snapshot
- commit snapshot

====================================================
ENSURE:
====================================================

Snapshots generated during sync/indexing.

====================================================
PHASE 7 — ARCHITECTURE PAGE BRANCH SUPPORT
====================================================

CURRENT ISSUE:
Architecture page missing branch-aware controls.

====================================================
ADD:
====================================================

- active branch selector
- branch sync state
- last indexed timestamp
- re-analyze button

====================================================
WHEN BRANCH CHANGES
====================================================

Reload:
- topology
- metrics
- dependency graph
- services map

====================================================
PHASE 8 — OVERVIEW INTELLIGENCE PANELS
====================================================

Ensure overview panels use REAL data.

====================================================
VERIFY:
====================================================

1. Recent commits
2. Commit velocity
3. Topology nodes
4. Architecture metrics
5. Dependencies count
6. Services count
7. Infra assets
8. AI insights

====================================================
REMOVE:
====================================================

- static graphs
- fake charts
- placeholder cards

====================================================
PHASE 9 — BACKEND STABILIZATION
====================================================

Audit:
- overview service
- drift service
- snapshot retrieval
- branch queries
- repository sync state

====================================================
FIX:
====================================================

- stale branch lookups
- hardcoded main references
- missing compare params
- invalid snapshot reads
- missing analysis states

====================================================
PHASE 10 — IMPLEMENTATION ORDER
====================================================

MANDATORY:

STEP 1:
Remove hardcoded main comparisons

STEP 2:
Implement compare branch selector

STEP 3:
Implement global branch context

STEP 4:
Stabilize snapshot retrieval

STEP 5:
Implement real drift engine

STEP 6:
Rebuild overview aggregation

STEP 7:
Connect overview widgets to real data

STEP 8:
Add explicit empty/loading states

====================================================
IMPORTANT ENGINEERING RULES
====================================================

DO NOT:
- auto-compare silently
- assume main exists
- show fake drift
- show empty topology as success

DO:
- expose comparison explicitly
- make branch context visible everywhere
- use real snapshots only
- surface indexing state clearly

====================================================
DELIVERY REQUIREMENTS
====================================================

For EACH subsystem:
1. Root cause analysis
2. Current broken logic
3. Correct branch-aware architecture
4. Backend implementation
5. Frontend implementation
6. Snapshot lifecycle
7. API contracts
8. Loading/error states
9. Empty states
10. Verification checklist

START NOW with:
1. Remove hardcoded main branch logic
2. Implement compare branch selector
3. Stabilize drift snapshot loading
4. Rebuild overview aggregation
5. Connect overview widgets to real analysis data
```
