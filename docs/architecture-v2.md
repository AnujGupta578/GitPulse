# GitPulse Production Architecture v2.0

## 1. System Overview
GitPulse transforms from a prototype orchestration engine into a production-grade AI-powered Repository Orchestration Platform. The system utilizes a distributed, event-driven architecture to parse repositories, construct semantic knowledge graphs, and coordinate a Council of AI Agents for continuous codebase intelligence.

## 2. Core Architecture Stack

### Backend (Data & Orchestration Layer)
- **Framework**: Fastify + Node.js (TypeScript) for high-throughput API routing.
- **Orchestration**: Temporal.io for durable, crash-resilient distributed agent workflows.
- **Message Bus**: Redis Pub/Sub (upgraded from native EventEmitter) for cross-service agent communication.
- **Primary Database**: PostgreSQL (via Prisma ORM) for relational states (Users, Workspaces, Repositories, Commits).
- **Graph Database**: Neo4j for persistent semantic memory (Modules, APIs, Dependencies, Architectural boundaries).
- **Vector Search**: Qdrant / pgvector for semantic retrieval of architectural context.

### Frontend (Intelligence Dashboard)
- **Framework**: Next.js 15 (App Router) + React 18.
- **Styling**: Vanilla CSS with strict Glassmorphism design system (Tailwind optional but adhering to strict visual guidelines).
- **State Management**: Zustand for global state, React Query for server state caching.
- **Visualization**: React Flow for interactive architecture topologies, Framer Motion for micro-animations.

## 3. Data Models (PostgreSQL + Prisma)

### Relational Schemas
1. **User**: Authentication, Workspaces.
2. **Workspace**: Multi-tenant isolation for organizations.
3. **Repository**: Connection strings, provider types (GitHub, GitLab), Webhook secrets, Indexing state.
4. **Commit**: SHA, Author, Intent Summary, Risk Score, Architectural Impact.
5. **AgentJob**: Durable state tracking for Temporal execution logs.

## 4. Phase Execution Plan

### Phase 1: Core Foundation & Navigation
Migrating from a single-page prototype to a full Next.js App Router implementation with lazy-loaded modules for Dashboard, Architecture Explorer, Infrastructure Map, and Repository Connections.

### Phase 2: Repository Connection System
Implementing `GitProviderAdapter` to handle secure OAuth/PAT connections, Webhook processors for real-time sync, and `IncrementalIndexer` for parsing large ASTs without memory bloat.

### Phase 3-7: AI & Knowledge Graph
Utilizing the established `SemanticSummarizationAgent` as a foundation, we scale into a 7-agent cluster (Architecture, Commit, Infra, Risk, Knowledge) writing directly to Neo4j to build living documentation graphs.

## 5. Security & Scaling Strategy
- **Security**: AES-256-GCM encrypted database columns for Provider Tokens.
- **Scaling**: Fastify worker threads + Temporal workers decoupled from the HTTP API. Heavy AST parsing offloaded to Temporal Activity Queues.
