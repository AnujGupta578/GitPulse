# Requirements: Phase 2 - Agentic Intent Extraction Engine

## **Objective**
Develop the core intelligence layer that parses source code changes and extracts structural and behavioral intent using a multi-agent orchestration framework.

## **Functional Requirements**
1.  **Multi-Language AST Parsing**:
    *   Integrate **Tree-sitter** with support for TypeScript/JavaScript, Python, and Go.
    *   Implement a wrapper to normalize AST nodes across different languages.
2.  **Council of Agents (LangGraph)**:
    *   **Architect Agent**: Identifies changes in system structure (new services, modules, containers).
    *   **Logic Agent**: Extracts business workflows and state transitions from procedural code.
    *   **Security Agent**: Scans for policy violations and security risks (hardcoded secrets, insecure patterns).
3.  **Semantic Synthesis**:
    *   Use LLMs (via **Instructor**) to convert raw AST deltas into high-fidelity structured "Intent Objects".
    *   Generate a natural language "Rationale" for each architectural change.
4.  **Local-First Privacy**:
    *   Ensure AST parsing is strictly local. Only sanitized structural summaries are sent to LLMs for synthesis.

## **Non-Functional Requirements**
*   **Accuracy**: Analysis must correctly identify module boundaries and dependencies.
*   **Performance**: Extraction should take less than 5 seconds for average-sized commits.
*   **Scalability**: The agentic loop must be able to handle complex diffs with multiple files.
