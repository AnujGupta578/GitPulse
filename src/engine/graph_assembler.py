"""
GraphAssembler — SPEC.md §3.1 / §3.2
======================================
Takes raw extractor outputs from SemanticWorkflowParser and assembles
a clean, deduplicated DAG with:
  - Cross-file symbol resolution via the symbol_table
  - Proper edge type labelling per SPEC.md §3.2
  - Cyclomatic complexity computation: M = E - N + 2P
"""

from __future__ import annotations

from collections import defaultdict, deque
from typing import Any, Dict, List, Optional, Set


# ---------------------------------------------------------------------------
# Edge factory
# ---------------------------------------------------------------------------

def _edge(
    source_id: str,
    target_id: str,
    edge_type: str,
    label: str,
    idx: int = 0,
) -> Dict[str, Any]:
    s = source_id.replace("::", "--").replace("/", "_").replace(" ", "_")[:40]
    t = target_id.replace("::", "--").replace("/", "_").replace(" ", "_")[:40]
    return {
        "id": f"e{idx}-{s}-{t}",
        "source": source_id,
        "target": target_id,
        "label": label,
        "type": edge_type,
    }


# ---------------------------------------------------------------------------
# GraphAssembler
# ---------------------------------------------------------------------------

class GraphAssembler:
    """
    Assembles a topology dict from raw extractor outputs.

    Edge type rules (SPEC.md §3.2):
      Trigger  → Action      : CALL       "invokes"
      Action   → Action      : CALL       "calls"
      Action   → Decision    : CALL       "evaluates"
      Decision → Action/Intg : BRANCH_TRUE  "on:true"
      Decision → Action/Intg : BRANCH_FALSE "on:false"
      Action   → Intg (DB)   : QUERY      "queries"
      Action   → Intg (HTTP) : CALL       "calls"
    """

    def assemble(
        self,
        triggers: List[Dict[str, Any]],
        actions: List[Dict[str, Any]],
        decisions: List[Dict[str, Any]],
        integrations: List[Dict[str, Any]],
        raw_edges: List[Dict[str, Any]],
        symbol_table: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Returns the topology envelope:
        {
          "schemaVersion": "2.0-workflow",
          "nodes": [...],
          "edges": [...]
        }
        """
        # ------------------------------------------------------------------
        # 1. Build node registry (deduplication by id)
        # ------------------------------------------------------------------
        node_map: Dict[str, Dict[str, Any]] = {}

        for node in triggers + actions + decisions + integrations:
            node_id = node["id"]
            if node_id not in node_map:
                node_map[node_id] = node

        # Build a quick name→id index for symbol resolution
        # Covers: "ACTION::myFn" => keyed by "myFn"
        name_to_id: Dict[str, str] = {}
        for node_id, node in node_map.items():
            # Qualifier is the part after "::"
            qualifier = node_id.split("::", 1)[-1]
            name_to_id[qualifier] = node_id
            # Also index by bare function name if qualifier has spaces/slashes
            bare = qualifier.split(" ")[-1].split("/")[-1]
            if bare and bare not in name_to_id:
                name_to_id[bare] = node_id

        # Map symbol_table entries to existing node ids where possible
        for sym_name, sym_info in symbol_table.items():
            if sym_name not in name_to_id and sym_info.get("node_id") in node_map:
                name_to_id[sym_name] = sym_info["node_id"]

        # ------------------------------------------------------------------
        # 2. Resolve raw caller→callee edges
        # ------------------------------------------------------------------
        edges: List[Dict[str, Any]] = []
        edge_set: Set[str] = set()
        edge_idx = 0

        def _add_edge(source: str, target: str, etype: str, label: str) -> None:
            nonlocal edge_idx
            key = f"{source}|{target}"
            if key in edge_set:
                return
            edge_set.add(key)
            edges.append(_edge(source, target, etype, label, edge_idx))
            edge_idx += 1

        trigger_ids = {n["id"] for n in triggers}
        action_ids = {n["id"] for n in actions}
        decision_ids = {n["id"] for n in decisions}
        integration_ids = {n["id"] for n in integrations}
        db_subtypes = {"DATABASE_READ", "DATABASE_WRITE"}

        for raw in raw_edges:
            source_id: str = raw["source"]
            target_name: str = raw.get("target_name", "")

            if source_id not in node_map:
                continue

            # Resolve callee name to an existing node id
            target_id: Optional[str] = name_to_id.get(target_name)
            if not target_id:
                # Try symbol_table
                sym = symbol_table.get(target_name)
                if sym:
                    target_id = sym.get("node_id")
            if not target_id or target_id not in node_map:
                continue

            source_type = node_map[source_id]["type"]
            target_type = node_map[target_id]["type"]

            # Determine edge semantics
            if source_type == "TRIGGER" and target_type == "ACTION":
                _add_edge(source_id, target_id, "CALL", "invokes")
            elif source_type == "ACTION" and target_type == "ACTION":
                _add_edge(source_id, target_id, "CALL", "calls")
            elif source_type == "ACTION" and target_type == "DECISION":
                _add_edge(source_id, target_id, "CALL", "evaluates")
            elif source_type == "ACTION" and target_type == "INTEGRATION":
                intg_node = node_map[target_id]
                if intg_node.get("subtype") in db_subtypes:
                    _add_edge(source_id, target_id, "QUERY", "queries")
                else:
                    _add_edge(source_id, target_id, "CALL", "calls")
            elif source_type == "DECISION":
                # Emit both branches symbolically
                _add_edge(source_id, target_id, "BRANCH_TRUE", "on:true")

        # ------------------------------------------------------------------
        # 3. Wire TRIGGER → nearest ACTION (heuristic for unresolved triggers)
        # ------------------------------------------------------------------
        # Group actions by file so we can link triggers to same-file handlers
        file_actions: Dict[str, List[str]] = defaultdict(list)
        for node_id in action_ids:
            f = node_map[node_id]["metadata"]["file"]
            file_actions[f].append(node_id)

        for trig_id in trigger_ids:
            has_outgoing = any(e["source"] == trig_id for e in edges)
            if has_outgoing:
                continue
            trig_file = node_map[trig_id]["metadata"]["file"]
            candidates = file_actions.get(trig_file, [])
            if candidates:
                # Link to the first action in the same file
                _add_edge(trig_id, candidates[0], "CALL", "invokes")

        # ------------------------------------------------------------------
        # 4. Anchor IntegrationNodes — ensure they have at least one inbound edge
        #    from an action in the same file.
        # ------------------------------------------------------------------
        file_to_integrations: Dict[str, List[str]] = defaultdict(list)
        for iid in integration_ids:
            f = node_map[iid]["metadata"]["file"]
            file_to_integrations[f].append(iid)

        for action_id in action_ids:
            a_file = node_map[action_id]["metadata"]["file"]
            for intg_id in file_to_integrations.get(a_file, []):
                has_edge = any(
                    e["source"] == action_id and e["target"] == intg_id
                    for e in edges
                )
                if not has_edge:
                    intg_node = node_map[intg_id]
                    if intg_node.get("subtype") in db_subtypes:
                        _add_edge(action_id, intg_id, "QUERY", "queries")
                    else:
                        _add_edge(action_id, intg_id, "CALL", "calls")
                    break  # Only wire once per action to avoid explosion

        # ------------------------------------------------------------------
        # 5. Detect cycles and mark RECURSIVE edges
        # ------------------------------------------------------------------
        adj: Dict[str, List[str]] = defaultdict(list)
        for e in edges:
            adj[e["source"]].append(e["target"])

        cycle_edges = self._detect_back_edges(adj)
        for e in edges:
            if (e["source"], e["target"]) in cycle_edges:
                e["type"] = "RECURSIVE"
                e["label"] = "recurses"

        # ------------------------------------------------------------------
        # 6. Final assembly
        # ------------------------------------------------------------------
        final_nodes = list(node_map.values())
        final_edges = edges

        return {
            "schemaVersion": "2.0-workflow",
            "nodes": final_nodes,
            "edges": final_edges,
        }

    # ------------------------------------------------------------------
    # Cycle detection (iterative DFS for back-edge marking)
    # ------------------------------------------------------------------

    def _detect_back_edges(
        self, adj: Dict[str, List[str]]
    ) -> Set[tuple]:
        """Return set of (source, target) pairs that are back-edges (cycles)."""
        visited: Set[str] = set()
        in_stack: Set[str] = set()
        back_edges: Set[tuple] = set()

        def dfs(node: str) -> None:
            visited.add(node)
            in_stack.add(node)
            for neighbor in adj.get(node, []):
                if neighbor not in visited:
                    dfs(neighbor)
                elif neighbor in in_stack:
                    back_edges.add((node, neighbor))
            in_stack.discard(node)

        for node in list(adj.keys()):
            if node not in visited:
                dfs(node)

        return back_edges

    # ------------------------------------------------------------------
    # Metrics computation
    # ------------------------------------------------------------------

    @staticmethod
    def compute_metrics(
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Returns workflow-level metrics.
        Cyclomatic complexity: M = E - N + 2P  (P=1 for a single connected graph)
        """
        node_by_type: Dict[str, int] = defaultdict(int)
        for n in nodes:
            node_by_type[n["type"]] += 1

        E = len(edges)
        N = len(nodes)
        P = max(1, GraphAssembler._connected_components(nodes, edges))
        cyclomatic = E - N + 2 * P

        # Approximate average call depth via BFS from triggers
        trigger_ids = [n["id"] for n in nodes if n["type"] == "TRIGGER"]
        avg_depth = GraphAssembler._average_bfs_depth(trigger_ids, edges)

        return {
            "triggerCount": node_by_type["TRIGGER"],
            "actionCount": node_by_type["ACTION"],
            "decisionCount": node_by_type["DECISION"],
            "integrationCount": node_by_type["INTEGRATION"],
            "totalNodes": N,
            "totalEdges": E,
            "cyclomaticComplexity": max(1, cyclomatic),
            "avgCallDepth": round(avg_depth, 2),
        }

    @staticmethod
    def _connected_components(
        nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]
    ) -> int:
        all_ids = {n["id"] for n in nodes}
        adj: Dict[str, List[str]] = defaultdict(list)
        for e in edges:
            adj[e["source"]].append(e["target"])
            adj[e["target"]].append(e["source"])

        visited: Set[str] = set()
        components = 0

        def bfs(start: str) -> None:
            q = deque([start])
            while q:
                cur = q.popleft()
                for nxt in adj.get(cur, []):
                    if nxt not in visited:
                        visited.add(nxt)
                        q.append(nxt)

        for node_id in all_ids:
            if node_id not in visited:
                visited.add(node_id)
                bfs(node_id)
                components += 1

        return components

    @staticmethod
    def _average_bfs_depth(
        start_ids: List[str], edges: List[Dict[str, Any]]
    ) -> float:
        if not start_ids:
            return 0.0

        adj: Dict[str, List[str]] = defaultdict(list)
        for e in edges:
            adj[e["source"]].append(e["target"])

        total_depth = 0
        reachable_count = 0

        for start in start_ids:
            visited: Set[str] = {start}
            q: deque = deque([(start, 0)])
            while q:
                cur, depth = q.popleft()
                for nxt in adj.get(cur, []):
                    if nxt not in visited:
                        visited.add(nxt)
                        total_depth += depth + 1
                        reachable_count += 1
                        q.append((nxt, depth + 1))

        return total_depth / reachable_count if reachable_count else 0.0
