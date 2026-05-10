You are a Staff+ Platform Engineer and Git Systems Architect.

Your task is to design and implement a COMPLETE production-grade Git Integration System for the Orchestrator platform.

The current application state:
- Frontend and backend are already running successfully
- Navigation works
- UI foundation exists
- Architecture dashboard exists
- We now need REAL repository integration
- Users must be able to connect their Git providers and browse repositories

IMPORTANT:
- This is NOT a mock/demo implementation
- Build real production-ready Git integrations
- Security is critical
- Multi-provider support is mandatory
- The system must scale to thousands of repositories
- Design for extensibility from day one

====================================================
PRIMARY OBJECTIVE
====================================================

Build a complete Git Integration Platform that allows users to:

1. Connect Git providers securely
2. Authenticate using OAuth or Personal Access Tokens
3. Fetch repositories
4. Display repositories in UI
5. Select repositories for orchestration
6. Sync repositories incrementally
7. Track branches
8. Receive webhook events
9. Scan repository metadata
10. Prepare repositories for architecture indexing

====================================================
SUPPORTED PROVIDERS
====================================================

Must support:
- GitHub
- GitLab
- Bitbucket

Architecture must allow:
- Azure DevOps
- Self-hosted Git
- Gitea
- Enterprise GitHub
- Enterprise GitLab

====================================================
HIGH LEVEL SYSTEM DESIGN
====================================================

Design the system with these modules:

1. Git Integration Module
2. OAuth/Auth Module
3. Repository Discovery Service
4. Repository Sync Engine
5. Webhook Processing System
6. Repository Metadata Store
7. Branch Tracking System
8. Incremental Sync Pipeline
9. Access Validation Layer
10. Repository Selection Workspace

====================================================
PHASE 1 — ARCHITECTURE DESIGN
====================================================

First generate:
- Full system architecture
- Sequence diagrams
- Data flow diagrams
- Module boundaries
- Service responsibilities
- Event flow
- Authentication flow
- Sync lifecycle
- Error handling strategy

Explain:
- Why each architectural decision is made
- Security implications
- Scalability considerations
- Multi-tenant strategy
- Rate-limit handling
- Background job strategy

====================================================
PHASE 2 — DATABASE DESIGN
====================================================

Design complete schemas for:

1. users
2. git_providers
3. connected_accounts
4. repositories
5. repository_branches
6. repository_syncs
7. repository_webhooks
8. oauth_sessions
9. repository_permissions
10. sync_jobs
11. workspace_repositories

Requirements:
- PostgreSQL optimized
- Proper indexing
- Foreign keys
- Multi-tenant safe
- Soft deletion support
- Audit fields
- Sync timestamps
- Rate-limit tracking

Generate:
- Prisma schema OR SQL schema
- Migration strategy
- Seed strategy

====================================================
PHASE 3 — BACKEND IMPLEMENTATION
====================================================

Backend stack:
- Node.js
- TypeScript
- NestJS or Fastify
- PostgreSQL
- Redis
- BullMQ

Generate production-ready implementation for:

====================================================
A. GIT PROVIDER ABSTRACTION
====================================================

Create:
- Base GitProviderAdapter interface
- GitHubAdapter
- GitLabAdapter
- BitbucketAdapter

Methods:
- authenticate()
- refreshToken()
- fetchRepositories()
- fetchRepository()
- fetchBranches()
- fetchCommits()
- fetchPullRequests()
- validateAccess()
- registerWebhook()
- deleteWebhook()
- syncRepository()

Must support:
- Pagination
- Retry handling
- Rate limits
- Token refresh
- API failures
- Provider-specific quirks

====================================================
B. AUTHENTICATION SYSTEM
====================================================

Implement:
- OAuth2 flows
- PAT support
- Token encryption
- Session validation
- CSRF protection
- Secure callback handling

Generate:
- OAuth routes
- Token exchange service
- Secure token storage
- Refresh token flow
- JWT/session strategy

Security requirements:
- Encrypt tokens at rest
- Never expose secrets to frontend
- Use provider scopes correctly
- Prevent privilege escalation

====================================================
C. REPOSITORY DISCOVERY
====================================================

Build repository discovery engine.

Requirements:
- Fetch all accessible repos
- Support pagination
- Search repositories
- Filter by:
  - private/public
  - organization
  - language
  - last activity
- Cache repository metadata
- Handle large orgs

Generate:
- RepositoryDiscoveryService
- Sync workers
- Repository cache layer
- Incremental refresh logic

====================================================
D. WEBHOOK SYSTEM
====================================================

Implement:
- Webhook registration
- Signature verification
- Event parsing
- Retry logic
- Dead-letter queue

Support events:
- push
- pull_request
- branch_create
- branch_delete
- repository_update

Generate:
- WebhookController
- WebhookProcessor
- EventRouter
- Queue workers

====================================================
E. SYNC ENGINE
====================================================

Implement:
- Initial sync
- Incremental sync
- Scheduled sync
- Manual sync
- Branch sync

Sync pipeline:
1. Validate access
2. Fetch metadata
3. Fetch branches
4. Fetch latest commits
5. Update cache
6. Trigger architecture scan

Generate:
- Queue architecture
- Worker implementation
- Retry handling
- Failure recovery
- Progress tracking

====================================================
PHASE 4 — FRONTEND IMPLEMENTATION
====================================================

Frontend stack:
- Next.js
- TypeScript
- Tailwind
- Zustand
- React Query

Build COMPLETE UI/UX for:

====================================================
A. REPOSITORY CONNECTION PAGE
====================================================

Features:
- Connect GitHub button
- Connect GitLab button
- Connect Bitbucket button
- PAT setup modal
- Connection status cards
- Connected accounts list

UI requirements:
- Maintain futuristic dark theme
- Smooth animations
- Loading states
- Error states
- Success feedback

====================================================
B. REPOSITORY BROWSER
====================================================

Features:
- Repository list
- Search
- Filters
- Infinite scroll
- Organization grouping
- Repo metadata cards
- Select repositories

Each repo card should show:
- Name
- Provider
- Visibility
- Language
- Last updated
- Branch count
- Sync status

====================================================
C. REPOSITORY DETAILS PAGE
====================================================

Features:
- Branch explorer
- Sync history
- Webhook status
- Commit overview
- Architecture scan status
- Repository health indicators

====================================================
D. SYNC MANAGEMENT UI
====================================================

Features:
- Start sync
- Pause sync
- Retry failed sync
- View logs
- Progress indicators
- Real-time websocket updates

====================================================
PHASE 5 — REALTIME SYSTEM
====================================================

Implement websocket/event streaming for:
- Sync progress
- Webhook events
- Repository updates
- Connection status
- Queue updates

====================================================
PHASE 6 — SECURITY
====================================================

Implement:
- Secret encryption
- RBAC
- Tenant isolation
- OAuth state validation
- Webhook signature validation
- API throttling
- Audit logging
- Access revocation

====================================================
PHASE 7 — OBSERVABILITY
====================================================

Add:
- Structured logging
- Metrics
- Queue monitoring
- Webhook diagnostics
- Sync telemetry
- Failure tracking

====================================================
PHASE 8 — TESTING
====================================================

Generate:
- Unit tests
- Integration tests
- E2E tests
- OAuth flow tests
- Webhook tests
- Queue tests

====================================================
PHASE 9 — DEVOPS
====================================================

Generate:
- Docker setup
- Environment configs
- Secrets management
- CI/CD setup
- Queue infrastructure
- Redis configuration

====================================================
PHASE 10 — IMPLEMENTATION STRATEGY
====================================================

IMPORTANT:
Implement incrementally in THIS ORDER:

STEP 1:
- Git provider abstraction
- Database schemas
- OAuth foundation

STEP 2:
- GitHub integration first
- Repository fetching
- Repository UI listing

STEP 3:
- Repository selection flow
- Sync engine foundation

STEP 4:
- Webhook system
- Incremental syncing

STEP 5:
- GitLab + Bitbucket support

STEP 6:
- Real-time updates
- Advanced caching
- Scaling optimizations

====================================================
DELIVERY RULES
====================================================

For EVERY feature:
1. Explain architecture
2. Explain reasoning
3. Generate folder structure
4. Generate backend code
5. Generate frontend code
6. Generate APIs
7. Generate database schemas
8. Generate queue workers
9. Generate tests
10. Explain scaling considerations

Never generate pseudo-code unless unavoidable.
Generate implementation-ready production-grade code.
Avoid placeholders and fake implementations.
Use clean architecture and enterprise patterns.

Start now with:
1. System architecture
2. Database schema
3. Git provider abstraction
4. GitHub OAuth implementation
5. Repository fetch pipeline
6. Frontend repository connection UI
7. Repository listing UI