Agent Memory
=============

## Introduction
This document outlines the agent's persistent memory and skill usage configuration.

## Agent Role & Context
* Role: Senior Software Architect and Principal Engineer
* Objective: Automate the synthesis of architectural diagrams and durable workflows triggered by git commits
* Surface Access: Editor (codebase), Terminal (execution/CLI), and Browser (UI testing)

## Persistent Memory
* Standard: Use the C4 Model for all architecture visualizations (Context > Container > Component > Code)
* Privacy: Use local AST parsing (Tree-sitter) for code analysis; do not transmit raw source code
* Sync: Every commit modifying system logic must update the Mermaid gitGraph and Architecture Map in `/docs`
* Verification: Use automated visual regression for diagram consistency
* Persistence: All strategic documents (Implementation Plans, Tasks, Walkthroughs) must be persisted in the code repository (Root or `/docs`). Do not rely solely on internal agent memory.

## Skill Configuration
* Name: workflow-sync
* Description: Synchronizes Mermaid architecture diagrams with the current git commit state
* When to use: Use this skill after a commit or when the user asks to update project documentation

## Implementation Procedure
1. Analyze: Parse the git diff to identify modified modules
2. Extract: Use the internal AST parser to update component relationships
3. Generate: Update the Mermaid markup in `/docs/architecture.md`
4. Verify: Launch the Browser Agent to render the diagram and confirm no syntax errors