# Robust Implementation Plan: Commit-Driven Workflow Orchestrator

This document defines the technical architecture and delivery phases for the enterprise-grade orchestrator. No mocks; all logic is backend-driven.

## **1. Delivered & Verified (Robust Core)**

### **A. Identity & Access Layer**
*   **JWT Implementation**: Signed token issuance using FastAPI and Python-JWT.
*   **Identity API**: `/auth/login` and `/auth/register` endpoints with real-time validation.
*   **Client Handshake**: Next.js state management for authenticated sessions.

### **B. Polyglot Extraction Engine**
*   **Tree-sitter Integration**: Multi-language parsing (Python, TS, JS, Go).
*   **Hierarchical Mapping**: Parent-child relationship tracking for classes and methods.
*   **Privacy-First**: AST parsing is deterministic and local.

### **C. Real-time Observation (SSE)**
*   **Live Stream**: `/analyze/stream` endpoint providing raw signals from the engine to the dashboard.
*   **Handshake Protocol**: UI only unlocks after receiving a cryptographic `[COMPLETE]` signal from the backend.

---

## **2. Immediate Execution (Next Robust Steps)**

### **A. Persistent State Layer**
*   **Task**: Transition from in-memory user stores to **PostgreSQL** (via Prisma/SQLAlchemy).
*   **Rationale**: Ensure user accounts and analysis history survive container restarts.

### **B. Temporal Workflow Orchestration**
*   **Task**: Implement the `RepositoryCrawl` workflow in Temporal.
*   **Rationale**: Handle large-scale repository parsing (thousands of files) with fault tolerance and retries.

### **C. Advanced Visual Diffing**
*   **Task**: Implement "Drill-Down" boundaries in the D3/Mermaid dashboard.
*   **Rationale**: Allow users to click into a class and see internal logic flow changes between commits.

---

## **3. Enterprise Hardening**

*   **OAuth Integration**: Connecting the robust auth layer to GitHub Apps for seamless repo onboarding.
*   **K8s Deployment**: Helm charts for scaling the Council of Agents across distributed nodes.
*   **Encrypted Storage**: Secure handling of SSH keys and Git tokens.

---

## **4. Verification Plan**

*   **Automated**: Pytest for Auth APIs and Parser logic.
*   **Manual**: Cross-browser validation of the SSE log stream and interactive C4 maps.
