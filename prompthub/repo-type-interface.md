Your current structure is transitioning from a “global dashboard app” into a true **repository-centric engineering intelligence platform**.

Right now the architecture is mixing:

* global navigation
* repository-specific insights
* sync operations
* architecture visualization
* commit intelligence

That creates UX confusion.

You now need a **Repository Workspace Architecture**.

Here’s the correct product direction and a master prompt to redesign the platform properly.

```text id="repo-centric-redesign-v2"
You are a Principal Product Architect, UX Systems Designer, and Platform Engineer.

We are redesigning the Orchestrator platform into a REPOSITORY-CENTRIC engineering intelligence system.

Current state:
- GitHub authentication works
- Repository listing works
- Users can now see repositories
- Existing navigation is GLOBAL:
  - Dashboard
  - Architecture
  - Commits
  - Infrastructure
  - Settings
- This structure is now incorrect because:
  - Architecture is repository-specific
  - Commits are repository-specific
  - Infrastructure is repository-specific
  - Sync is repository-specific
  - Branches are repository-specific

We need a COMPLETE information architecture redesign.

====================================================
PRIMARY PRODUCT DECISION
====================================================

The platform must become:

"Repository Workspace Driven"

NOT:
- Global dashboard first

BUT:
- Repository workspace first

The repository becomes the PRIMARY CONTEXT of the application.

====================================================
NEW PRODUCT PHILOSOPHY
====================================================

User journey should be:

1. Connect Git provider
2. View repositories
3. Select repository
4. Open repository workspace
5. Activate sync
6. Select branches
7. Explore architecture
8. Explore commits
9. Explore infrastructure
10. Run orchestration/intelligence

Everything becomes scoped to:
- repository
- branch
- workspace

====================================================
NEW INFORMATION ARCHITECTURE
====================================================

REDESIGN the application structure completely.

====================================================
GLOBAL NAVIGATION
====================================================

Global navigation should ONLY contain:

1. Workspace Home
2. Repositories
3. Activity Feed
4. AI Agents
5. Organization Insights
6. Settings

REMOVE:
- Global Architecture
- Global Commits
- Global Infrastructure

Those are repository-scoped features.

====================================================
REPOSITORY WORKSPACE CONCEPT
====================================================

When user clicks a repository:

/workspace/:repoId

The ENTIRE application context changes.

Inside repository workspace:

====================================================
REPOSITORY WORKSPACE SIDEBAR
====================================================

Repository sidebar should contain:

1. Overview
2. Branches
3. Architecture
4. Commits
5. Infrastructure
6. Dependencies
7. Services
8. Sync Center
9. Knowledge Graph
10. AI Insights
11. Risk Analysis
12. Settings

====================================================
BRANCH-CENTRIC DESIGN
====================================================

VERY IMPORTANT:
Architecture differs by branch.

Commits differ by branch.

Infrastructure differs by branch.

Therefore:
Branch context must become a FIRST-CLASS concept.

====================================================
REQUIRED BRANCH UX
====================================================

At top of workspace:
- Repository name
- Provider
- Current branch selector
- Sync status
- Last indexed time

Branch selector requirements:
- Dropdown
- Searchable
- Default branch highlighted
- Recently used branches
- Multi-branch comparison later

Changing branch should:
- Reload architecture graph
- Reload commits
- Reload infrastructure
- Reload dependency map
- Reload AI insights

====================================================
SYNC SYSTEM REDESIGN
====================================================

Sync must become repository-specific.

====================================================
SYNC LEVELS
====================================================

Support:
1. Repository sync
2. Branch sync
3. Incremental sync
4. Full reindex
5. Webhook sync
6. Scheduled sync

====================================================
SYNC UX
====================================================

Each repository card should show:
- Sync enabled/disabled
- Last sync
- Indexed branches
- Architecture status
- Health status

Each branch should show:
- Indexed/not indexed
- Last analyzed commit
- Commit drift
- Architecture freshness

====================================================
REPOSITORY DASHBOARD DESIGN
====================================================

Repository Overview page becomes the REAL dashboard.

====================================================
OVERVIEW PAGE SHOULD CONTAIN
====================================================

1. Repository Health
2. Sync Status
3. Architecture Summary
4. Active Branch
5. Recent Commits
6. Risk Indicators
7. Dependency Health
8. Infrastructure Status
9. AI Insights
10. Architecture Drift
11. Service Topology
12. Commit Velocity

====================================================
ARCHITECTURE PAGE
====================================================

Architecture is ALWAYS:
Repository + Branch scoped

Route:
workspace/:repoId/architecture?branch=main

Features:
- Interactive graph
- Service boundaries
- Module relationships
- Dependency graph
- Domain visualization
- Search/filter
- Zoom/pan
- AI-generated architecture summaries

====================================================
COMMITS PAGE
====================================================

Commits become:
Repository + Branch scoped

Features:
- Commit timeline
- Intent analysis
- Risk scoring
- Semantic commit grouping
- Feature evolution tracking
- Architecture impact analysis

====================================================
INFRASTRUCTURE PAGE
====================================================

Infrastructure becomes:
Repository + Branch scoped

Features:
- Deployment topology
- Docker analysis
- Kubernetes analysis
- Terraform analysis
- CI/CD graph
- Environment relationships

====================================================
REPOSITORY LIST REDESIGN
====================================================

Repository list should become:
Workspace launcher

Each repository card should display:
- Repository name
- Provider
- Visibility
- Branch count
- Sync status
- Architecture readiness
- Last indexed
- Health score
- Quick actions

Actions:
- Open workspace
- Start sync
- Select branches
- View architecture
- Open settings

====================================================
MULTI-REPOSITORY FUTURE
====================================================

Design architecture for future:
- Cross-repo dependencies
- Organization graphs
- Service federation
- Distributed architecture mapping

BUT:
Current UX focus must remain:
ONE REPOSITORY WORKSPACE AT A TIME

====================================================
BACKEND ARCHITECTURE CHANGES
====================================================

Backend APIs must become scoped.

====================================================
NEW API STRUCTURE
====================================================

/repositories
/repositories/:repoId
/repositories/:repoId/branches
/repositories/:repoId/sync
/repositories/:repoId/architecture
/repositories/:repoId/commits
/repositories/:repoId/infrastructure
/repositories/:repoId/insights

Branch-aware:
/repositories/:repoId/architecture?branch=main
/repositories/:repoId/commits?branch=dev

====================================================
DATABASE REDESIGN
====================================================

Need branch-aware indexing tables.

Add:
- repository_branches
- branch_sync_status
- architecture_snapshots
- branch_commit_analysis
- infrastructure_snapshots

====================================================
FRONTEND ARCHITECTURE
====================================================

Create:
- RepositoryWorkspaceLayout
- BranchContextProvider
- RepositoryContextProvider
- WorkspaceNavigation
- BranchSwitcher
- SyncStatusProvider

====================================================
REALTIME SYSTEM
====================================================

Websocket events should become:
- repository scoped
- branch scoped

Examples:
- sync progress
- architecture updated
- branch indexed
- webhook received

====================================================
UI/UX REQUIREMENTS
====================================================

Maintain:
- Futuristic dark theme
- Glassmorphism
- Neon accents

Improve:
- Context clarity
- Branch visibility
- Workspace orientation
- Navigation hierarchy

Avoid:
- Global architecture confusion
- Mixed repository context
- Flat navigation

====================================================
IMPLEMENTATION PLAN
====================================================

STEP 1:
Redesign information architecture

STEP 2:
Implement repository workspace routing

STEP 3:
Build repository context system

STEP 4:
Implement branch selector

STEP 5:
Build sync center

STEP 6:
Move architecture into workspace

STEP 7:
Move commits into workspace

STEP 8:
Move infrastructure into workspace

STEP 9:
Build repository overview dashboard

====================================================
DELIVERY REQUIREMENTS
====================================================

For EACH redesign decision:
1. Explain UX reasoning
2. Explain architectural reasoning
3. Generate route structure
4. Generate folder structure
5. Generate React layouts
6. Generate backend APIs
7. Generate DB changes
8. Generate websocket architecture
9. Generate state management
10. Generate migration strategy

IMPORTANT:
Do NOT generate simplistic dashboards.
Think like:
- Linear
- Datadog
- GitHub
- Vercel
- Sourcegraph
- Backstage
- Graphite

Build a REAL repository intelligence workspace platform.

Start NOW with:
1. Information architecture redesign
2. Repository workspace routing
3. Branch-centric UX
4. Repository dashboard redesign
5. Sync center architecture
6. Repository-scoped architecture system
```
