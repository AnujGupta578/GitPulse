"""
WorkflowSemanticEngine — SPEC.md §3.1
=======================================
Orchestrator that:
  1. Discovers all supported source files in a repo (skipping ignored dirs)
  2. Builds the symbol table (Pass 1)
  3. Runs all 4 extractors per-file in parallel (Pass 2)
  4. Delegates to GraphAssembler to produce the final topology + metrics
"""

from __future__ import annotations

import asyncio
import os
from typing import Any, Dict, List

from src.engine.semantic_workflow_parser import SemanticWorkflowParser
from src.engine.graph_assembler import GraphAssembler

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUPPORTED_EXTENSIONS: Dict[str, str] = {
    ".ts": "typescript",
    ".tsx": "tsx",
    ".js": "javascript",
    ".mjs": "javascript",
    ".py": "python",
    ".go": "go",
}

IGNORE_PATTERNS: List[str] = [
    "node_modules",
    ".git",
    "dist",
    "__pycache__",
    ".next",
    "build",
    ".cache",
    ".turbo",
    "coverage",
    ".nyc_output",
    "vendor",
    "venv",
    ".venv",
    "migrations",
    "generated",
    "prisma/migrations",
]

# Test files are not business logic — skip them from the workflow graph
TEST_PATTERNS: List[str] = [
    ".test.",
    ".spec.",
    "__tests__",
    "_test.go",
    "test_",
]


# ---------------------------------------------------------------------------
# WorkflowSemanticEngine
# ---------------------------------------------------------------------------


class WorkflowSemanticEngine:
    """
    End-to-end semantic workflow analysis engine.

    Usage:
        engine = WorkflowSemanticEngine('/path/to/repo')
        result = await engine.run()
        # result = {"topology": {...}, "metrics": {...}}
    """

    def __init__(self, repo_path: str) -> None:
        self.repo_path = os.path.abspath(repo_path)
        self.parser = SemanticWorkflowParser(self.repo_path)
        self.assembler = GraphAssembler()

    # ------------------------------------------------------------------
    # File discovery
    # ------------------------------------------------------------------

    def _discover_files(self) -> List[Dict[str, Any]]:
        """
        Walk the repository, returning a list of file descriptors:
            [{"path": abs_path, "rel_path": repo_relative_path, "lang": language_key}]

        Skips IGNORE_PATTERNS directories and TEST_PATTERNS files.
        """
        files: List[Dict[str, Any]] = []

        for dirpath, dirnames, filenames in os.walk(self.repo_path):
            # Prune ignored directories in-place (modifies os.walk iteration)
            rel_dir = os.path.relpath(dirpath, self.repo_path).replace("\\", "/")
            dirnames[:] = [
                d for d in dirnames
                if not any(pat in os.path.join(rel_dir, d) for pat in IGNORE_PATTERNS)
                and not d.startswith(".")
            ]

            for fname in filenames:
                _, ext = os.path.splitext(fname)
                if ext not in SUPPORTED_EXTENSIONS:
                    continue

                rel_path = os.path.join(
                    os.path.relpath(dirpath, self.repo_path), fname
                ).replace("\\", "/")

                # Skip test files
                if any(pat in rel_path for pat in TEST_PATTERNS):
                    continue

                # Skip declaration files
                if fname.endswith(".d.ts"):
                    continue

                files.append({
                    "path": os.path.join(dirpath, fname),
                    "rel_path": rel_path,
                    "lang": SUPPORTED_EXTENSIONS[ext],
                })

        return files

    # ------------------------------------------------------------------
    # Per-file analysis (async)
    # ------------------------------------------------------------------

    async def _analyze_file(
        self, file_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Parse a single file and run all 4 extractors.
        Returns {triggers, actions, decisions, integrations, raw_edges}.
        """
        path = file_info["path"]
        rel_path = file_info["rel_path"]
        lang = file_info["lang"]

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                source = fh.read()
        except OSError:
            return _empty_result()

        # Tree-sitter parsing is CPU-bound — run in a thread pool
        loop = asyncio.get_event_loop()

        def _parse_and_extract() -> Dict[str, Any]:
            try:
                tree = self.parser.intent_parser.parse_content(source, lang)
            except Exception:
                return _empty_result()

            try:
                triggers = self.parser.extract_triggers(tree, lang, rel_path)
            except Exception:
                triggers = []

            try:
                actions, raw_edges = self.parser.extract_actions(tree, lang, rel_path)
            except Exception:
                actions, raw_edges = [], []

            try:
                decisions = self.parser.extract_decisions(tree, lang, rel_path)
            except Exception:
                decisions = []

            try:
                integrations = self.parser.extract_integrations(tree, lang, rel_path)
            except Exception:
                integrations = []

            return {
                "triggers": triggers,
                "actions": actions,
                "decisions": decisions,
                "integrations": integrations,
                "raw_edges": raw_edges,
            }

        return await loop.run_in_executor(None, _parse_and_extract)

    # ------------------------------------------------------------------
    # Main run
    # ------------------------------------------------------------------

    async def run(self) -> Dict[str, Any]:
        """
        Full two-pass analysis pipeline:
          Pass 1 → build_symbol_table (sequential, fast)
          Pass 2 → extract all nodes per-file (parallel)
          Final  → assemble topology + metrics
        """
        # --- Pass 1: discover files ---
        files = self._discover_files()

        if not files:
            return {
                "topology": _empty_topology(),
                "metrics": _zero_metrics(),
            }

        # --- Pass 1: symbol table ---
        self.parser.build_symbol_table(files)

        # --- Pass 2: parallel extraction ---
        tasks = [self._analyze_file(f) for f in files]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # --- Aggregate ---
        all_triggers: List[Dict[str, Any]] = []
        all_actions: List[Dict[str, Any]] = []
        all_decisions: List[Dict[str, Any]] = []
        all_integrations: List[Dict[str, Any]] = []
        all_raw_edges: List[Dict[str, Any]] = []

        for result in results:
            if isinstance(result, Exception) or not isinstance(result, dict):
                continue
            all_triggers.extend(result.get("triggers", []))
            all_actions.extend(result.get("actions", []))
            all_decisions.extend(result.get("decisions", []))
            all_integrations.extend(result.get("integrations", []))
            all_raw_edges.extend(result.get("raw_edges", []))

        # --- Graph assembly ---
        topology = self.assembler.assemble(
            triggers=all_triggers,
            actions=all_actions,
            decisions=all_decisions,
            integrations=all_integrations,
            raw_edges=all_raw_edges,
            symbol_table=self.parser.symbol_table,
        )

        # --- Metrics ---
        metrics = GraphAssembler.compute_metrics(
            topology["nodes"],
            topology["edges"],
        )

        return {
            "topology": topology,
            "metrics": metrics,
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _empty_result() -> Dict[str, Any]:
    return {
        "triggers": [],
        "actions": [],
        "decisions": [],
        "integrations": [],
        "raw_edges": [],
    }


def _empty_topology() -> Dict[str, Any]:
    return {
        "schemaVersion": "2.0-workflow",
        "nodes": [],
        "edges": [],
    }


def _zero_metrics() -> Dict[str, Any]:
    return {
        "triggerCount": 0,
        "actionCount": 0,
        "decisionCount": 0,
        "integrationCount": 0,
        "totalNodes": 0,
        "totalEdges": 0,
        "cyclomaticComplexity": 1,
        "avgCallDepth": 0.0,
    }
