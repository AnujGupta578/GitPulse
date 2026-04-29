# **Project Specification: Commit-Driven Workflow Orchestrator**

## **1. Agent Role & Context**

**Role:** You are a Senior Software Architect and Principal Engineer.

**Objective:** Automate the synthesis of architectural diagrams and durable workflows triggered by git commits.

**Surface Access:** Editor (codebase), Terminal (execution/CLI), and Browser (UI testing).

---

## **2. The Constitution (Persistent Memory)**

*   **Standard:** Use the C4 Model for all architecture visualizations (Context > Container > Component > Code).
*   **Privacy:** Use local AST parsing (Tree-sitter) for code analysis; do not transmit raw source code.
*   **Sync:** Every commit modifying system logic must update the Mermaid gitGraph and Architecture Map in `/docs`.
*   **Verification:** Use automated visual regression for diagram consistency.

*   **Persistence:** All strategic documents (Implementation Plans, Tasks, Walkthroughs) must be persisted in the code repository (Root or `/docs`). Do not rely solely on internal agent memory.

## **3. Tech Stack & Architecture**

The orchestrator is built on a **Local-First, AI-Augmented** stack to ensure performance and privacy:

*   **Frontend (Dashboard & Visualization):**
    *   **Framework:** **Next.js 15+** (App Router, TypeScript).
    *   **Styling:** **Vanilla CSS** (Premium Custom Design), **Framer Motion** (Animations).
    *   **Visualization:** **Mermaid.js**, **D3.js** (for complex graphs).
*   **Backend (World-Class AI Orchestration):**
    *   **Language:** **Python 3.12+**.
    *   **Framework:** **FastAPI** (Asynchronous, High-Performance).
    *   **Agent Intelligence:** **LangGraph** (Multi-agent coordination) & **PydanticAI**.
    *   **Durable Workflows:** **Temporal Python SDK** (Fault-tolerant execution).
    *   **Analysis Engine:** **Tree-sitter** (Native Python bindings).
    *   **Data Extraction:** **Instructor** (Strictly typed LLM outputs).
*   **Data & Infrastructure:**
    *   **Database:** **PostgreSQL** + **Prisma (Python Client)** or **SQLModel**.
    *   **Cache/Broker:** **Redis**.
    *   **Dependency Management:** **Poetry**.
*   **Orchestration & DevOps:**
    *   **Git Hooks:** **Husky** (Triggering Python analysis).
    *   **Quality:** **Ruff** (Linting/Formatting), **Pytest**.

---

## **4. Product Development Cycle (SDD)**

1.  **Specify:** Define requirements in `specs/[feature]/requirements.md`.
2.  **Plan:** Analyze context and generate technical blueprints in `specs/[feature]/plan.md`.
3.  **Tasks:** Decompose plan into actionable units in `task.md` (Persistent Task List).
4.  **Implement:** Execute code changes following the blueprint.
5.  **Verify:** Run checklists and visual regression tests before completion.

---

## **4. Operational Boundaries**

*   **Always:** Write unit tests first; use strictly typed TypeScript.
*   **Ask First:** Adding third-party dependencies or changing database schemas.
*   **Never:** Commit credentials or modify production environment variables.
*   **Never:** Proceed with coding without an approved Implementation Plan.
