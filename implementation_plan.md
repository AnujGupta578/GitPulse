# Implementation Plan: Commit-Driven Workflow Orchestrator

This document outlines the strategic scope, user stories, and technical roadmap for the **Commit-Driven Workflow Orchestrator**. This tool transforms git commits into active drivers of architectural intelligence and operational workflows.

## **1. Strategic Scope**

The project focuses on creating a system that listens to git events (commits/PRs) and automatically synthesizes:
*   **Architecture-as-Code**: Live Mermaid diagrams following the C4 model.
*   **Behavioral Intent**: Extracted logic flows (BPMN/State Machines).
*   **Temporal Progression**: A history of how the system's architecture has evolved.
*   **Agentic Seeding**: Instruction sets for "Walkthrough Agents" to validate features on-demand.

---

## **2. Visual Vision (Mockup)**

![World-Class Orchestrator Dashboard](/Users/anujkumar.gupta/.gemini/antigravity/brain/2d0b318e-09f0-47ad-bf2e-87880d2ec359/world_class_orchestrator_dashboard_1777492471962.png)
*Figure 1: Conceptual high-fidelity dashboard featuring real-time architecture synthesis and AI intent analysis.*

---

## **3. Infrastructure & Deployment Plan**

The platform is designed to scale from individual developers to global enterprises:

### **Individual Developer (Local-First)**
*   **Deployment**: Local CLI / VS Code Extension.
*   **Repo Access**: Direct filesystem access to the `.git` directory.
*   **Analysis**: Local Python process (FastAPI) triggered by Husky hooks.
*   **Privacy**: All AST parsing stays on-machine; only semantic summaries are processed via AI (optional encryption for transit).

### **Enterprise (Cloud/Hybrid)**
*   **Deployment**: Managed Cloud (AWS/Vercel) or Self-hosted (Docker/K8s).
*   **Repo Access**: **GitHub/GitLab App Installation**. Secure OAuth-based access with fine-grained permissions to only read code and push to `/docs`.
*   **Orchestration**: **Temporal Cloud** handles millions of concurrent analysis workflows across distributed repositories.
*   **SSO/RBAC**: Enterprise-grade identity management for architectural governance.

---

## **4. Use Case Walkthrough (The "Commit-to-Insight" Flow)**

1.  **The Trigger**: A developer pushes a commit containing a new "Payment Service" and a database schema change.
2.  **Extraction**: The `post-commit` hook (Local) or GitHub Webhook (Enterprise) notifies the **FastAPI Orchestrator**.
3.  **Analysis**: The **Council of Agents** (Architect, Logic, Security) uses **Tree-sitter** to parse the diff.
4.  **Synthesis**: 
    *   **Architect Agent** updates the C4 Container diagram.
    *   **Logic Agent** generates a BPMN flow for the new payment logic.
    *   **Security Agent** flags if the DB change violates GDPR encryption policies.
5.  **Visualization**: The **Next.js Dashboard** updates in real-time, showing the "Visual Diff" of the architecture.
6.  **Agentic Feedback**: A **Walkthrough Agent** is initialized (on-request) to navigate the UI and confirm the "Payment Flow" is functionally reachable.

---

## **5. User Stories & Tickets**

The system utilizes a **Local-First, Multi-Agent** stack:
*   **Frontend**: **Next.js 15+**, **Framer Motion**, **Vanilla CSS**.
*   **Backend**: **Python 3.12+**, **FastAPI**, **LangGraph** (Agents), **Temporal**.
*   **Analysis**: **Tree-sitter** (Native).
*   **Data**: **PostgreSQL**, **Prisma**, **Redis**.
*   **Orchestration**: **Husky**, **Poetry**, **Ruff**.

---

## **3. User Stories**

### **For Developers**
*   *As a Developer, I want my architecture diagrams to update automatically when I push code, so that my documentation is never stale.*
*   *As a Developer, I want to see a visual 'Intent Diff' before merging a PR, so I can catch unintended architectural changes.*

### **For Product Managers / CEOs**
*   *As a CEO, I want a high-level briefing of technical effort translated into business impact, so I can understand the ROI of our development cycles.*
*   *As a PM, I want a 'Walkthrough Agent' to show me a live demo of a new feature based on the committed workflow, so I can provide immediate feedback.*

### **For Architects**
*   *As an Architect, I want to define 'Policy-as-Code' guardrails, so the orchestrator can flag architectural drift automatically.*
*   *As an Architect, I want to use 'Skills' to teach the AI how to interpret my specific codebase patterns and domain-specific languages.*

---

## **6. Technical Roadmap & Progress Tracking**

Progress is tracked via granular "Tickets" in `task.md`. Each phase represents a major milestone in the development of the "World-Class" product.

## **7. Agent Rules (The Constitution)**

To ensure the agent (Antigravity) maintains track and delivers deterministic results, the following rules are **MANDATORY**:

1.  **Spec-Driven Development (SDD)**: NEVER write code without an approved `SPEC.md` and `implementation_plan.md`.
2.  **Task Integrity**: Every action must be reflected in `tasks.md`. Mark items as `[/]` (In Progress) and `[x]` (Completed).
3.  **Human-in-the-Loop**: Stop and request review after every major synthesis phase (e.g., after the extraction engine is built, before generating diagrams).
4.  **C4 Adherence**: All visualizations must strictly follow the hierarchical levels: Context > Container > Component > Code.
5.  **Privacy First**: Prioritize local AST parsing (Tree-sitter) over sending raw source code to external LLMs whenever possible.
6.  **Verification**: Every feature implementation must be verified by a "Verification Task" (e.g., running a test or launching a browser to check a diagram).

---

## **4. Technical Roadmap**

### **Phase 1: Foundation & Git Orchestration**
*   Initialize the project structure.
*   Set up a local Git Hook listener to trigger analysis on `post-commit`.
*   Establish the `SPEC.md` and `tasks.md` persistent memory system.

### **Phase 2: Agentic Intent Extraction Engine**
*   Implement a **Python-based** parser using **Tree-sitter**.
*   Develop a **LangGraph** state machine for multi-agent reasoning:
    *   **Architect Agent**: Identifies structural patterns.
    *   **Logic Agent**: Extracts business process flows.
    *   **Semantic Agent**: Summarizes rationale and intent.
*   Integrate **Instructor** for high-fidelity structured data extraction.

### **Phase 3: Generative Synthesis (Mermaid & C4)**
*   Convert extracted intent into Mermaid syntax.
*   Implement a "Visual Diffing" algorithm to highlight changes in the architecture map.
*   Automate the updates to `/docs/architecture.md`.

### **Phase 4: Temporal Workflow & Progression**
*   Implement a storage mechanism for "Workflow Snapshots" across commit history.
*   Create a "Progression Viewer" (Markdown-based or simple CLI/UI) to scrub through architectural evolution.

### **Phase 5: Agentic Seed Generation (Future)**
*   Design the schema for "Walkthrough Instructions" based on the synthesized workflows.
*   (On-Request) Generate a script for a Browser Subagent to perform a feature walkthrough.

---

## **5. Verification Plan**

### **Automated Tests**
*   Unit tests for the AST parser (verifying dependency extraction).
*   Syntax validation for generated Mermaid files.

### **Manual Verification**
*   Triggering a commit and verifying that the `docs/architecture.md` updates correctly with a visual diff.
*   Reviewing the "CEO Briefing" generated from a complex commit.
