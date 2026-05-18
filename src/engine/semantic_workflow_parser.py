"""
SemanticWorkflowParser — SPEC.md §3.1 / §3.2
=============================================
Performs 4-pass AST extraction over source files to classify every
active execution block into exactly one of:
    TRIGGER | ACTION | DECISION | INTEGRATION
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple

import tree_sitter
import tree_sitter_python
import tree_sitter_typescript
import tree_sitter_javascript
import tree_sitter_go

from src.engine.parser import IntentParser


# ---------------------------------------------------------------------------
# Node / Edge factory helpers
# ---------------------------------------------------------------------------

def _make_node(
    node_type: str,
    subtype: str,
    qualifier: str,
    label: str,
    file_path: str,
    line: int,
    **metadata_extras: Any,
) -> Dict[str, Any]:
    metadata: Dict[str, Any] = {
        "file": file_path,
        "line": line,
    }
    metadata.update(metadata_extras)
    return {
        "id": f"{node_type}::{qualifier}",
        "type": node_type,
        "subtype": subtype,
        "label": label,
        "metadata": metadata,
    }


def _make_edge(
    source_id: str,
    target_id: str,
    edge_type: str,
    label: str,
) -> Dict[str, Any]:
    safe_source = source_id.replace("::", "--").replace("/", "_").replace(" ", "_")
    safe_target = target_id.replace("::", "--").replace("/", "_").replace(" ", "_")
    return {
        "id": f"edge-{safe_source}-{safe_target}",
        "source": source_id,
        "target": target_id,
        "label": label,
        "type": edge_type,
    }


# ---------------------------------------------------------------------------
# Tree-sitter query execution helper
# ---------------------------------------------------------------------------

def _run_query(
    query: tree_sitter.Query, root: tree_sitter.Node
) -> List[Tuple[tree_sitter.Node, str]]:
    """
    Normalized capture runner that handles the different Query APIs across
    tree-sitter versions (QueryCursor / direct captures / matches).
    """
    normalized: List[Tuple[tree_sitter.Node, str]] = []

    # --- Method 1: QueryCursor (newest API) ---
    try:
        cursor = tree_sitter.QueryCursor(query)
        cap_func = getattr(cursor, "captures", None)
        if cap_func and callable(cap_func):
            results = cap_func(root)
            for node, tag in results:
                if isinstance(tag, int):
                    tag = query.capture_names[tag]
                normalized.append((node, tag))
    except Exception:
        pass

    if normalized:
        return normalized

    # --- Method 2: query.captures (legacy) ---
    try:
        results = query.captures(root)
        for node, tag in results:
            if isinstance(tag, int):
                tag = query.capture_names[tag]
            normalized.append((node, tag))
    except Exception:
        pass

    if normalized:
        return normalized

    # --- Method 3: query.matches (modern dict-style) ---
    try:
        results = query.matches(root)
        for match in results:
            caps = match if isinstance(match, dict) else getattr(match, "captures", {})
            for tag_idx, nodes in caps.items():
                tag_name = query.capture_names[tag_idx] if isinstance(tag_idx, int) else tag_idx
                for node in (nodes if isinstance(nodes, list) else [nodes]):
                    normalized.append((node, tag_name))
    except Exception:
        pass

    return normalized


# ---------------------------------------------------------------------------
# Decision heuristic filter
# ---------------------------------------------------------------------------
_DECISION_SIGNALS = re.compile(r"===|!==|>=|<=|>|<|\?\.|!")


def _has_decision_signal(text: str) -> bool:
    return bool(_DECISION_SIGNALS.search(text))


# ---------------------------------------------------------------------------
# SemanticWorkflowParser
# ---------------------------------------------------------------------------

class SemanticWorkflowParser:
    """
    Two-pass semantic parser:
      Pass 1: build_symbol_table — index all function/method definitions
      Pass 2: extract_* per-file extractors, producing typed workflow nodes
    """

    def __init__(self, repo_path: str) -> None:
        self.repo_path = repo_path
        self.intent_parser = IntentParser()
        # function_name / qualified_name -> {file, line, node_id}
        self.symbol_table: Dict[str, Dict[str, Any]] = {}

    # ------------------------------------------------------------------
    # Pass 1 — Symbol Table
    # ------------------------------------------------------------------

    def build_symbol_table(self, files: List[Dict[str, Any]]) -> None:
        """
        Index all function/method definitions across all files so
        cross-file references can be resolved in Pass 2.
        """
        for file_info in files:
            path = file_info["path"]
            lang = file_info.get("lang", "typescript")
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                    source = fh.read()
            except OSError:
                continue

            try:
                tree = self.intent_parser.parse_content(source, lang)
            except Exception:
                continue

            rel_path = file_info.get("rel_path", path)
            self._index_definitions(tree.root_node, rel_path, lang)

    def _index_definitions(
        self, root: tree_sitter.Node, rel_path: str, lang: str
    ) -> None:
        """Walk the AST and index every function / method definition."""
        for node in self._walk(root):
            name: Optional[str] = None
            line: int = node.start_point[0] + 1

            if node.type in ("function_declaration", "function_definition"):
                name = self._child_text(node, ("identifier", "property_identifier"))
            elif node.type == "method_definition":
                name_node = node.child_by_field_name("name")
                name = name_node.text.decode("utf-8") if name_node else None
            elif node.type == "arrow_function":
                # e.g. const myFunc = async (req, res) => { ... }
                pass  # handled via variable_declarator below
            elif node.type == "variable_declarator":
                value = node.child_by_field_name("value")
                if value and value.type in ("arrow_function", "function"):
                    name_node = node.child_by_field_name("name")
                    name = name_node.text.decode("utf-8") if name_node else None
                    if name:
                        self.symbol_table[name] = {
                            "file": rel_path,
                            "line": line,
                            "node_id": f"ACTION::{name}",
                        }
                continue

            if name:
                self.symbol_table[name] = {
                    "file": rel_path,
                    "line": line,
                    "node_id": f"ACTION::{name}",
                }

    # ------------------------------------------------------------------
    # Pass 2 — Extractors
    # ------------------------------------------------------------------

    def extract_triggers(
        self, tree: tree_sitter.Tree, lang: str, rel_path: str
    ) -> List[Dict[str, Any]]:
        """
        Returns TriggerNode dicts by matching:
        - Express/Fastify route registrations: app.get/post/…(path, handler)
        - Next.js App Router exports: export async function GET/POST/…
        - Event listeners: emitter.on/subscribe('event', handler)
        """
        triggers: List[Dict[str, Any]] = []
        root = tree.root_node

        if lang in ("typescript", "javascript", "tsx"):
            triggers.extend(self._ts_extract_http_routes(root, rel_path))
            triggers.extend(self._ts_extract_nextjs_routes(root, rel_path))
            triggers.extend(self._ts_extract_event_listeners(root, rel_path))
        elif lang == "python":
            triggers.extend(self._py_extract_routes(root, rel_path))

        return triggers

    def extract_actions(
        self, tree: tree_sitter.Tree, lang: str, rel_path: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Returns (action_nodes, raw_edges).
        raw_edges are caller→callee hints in the form:
            {"source": node_id, "target_name": callee_fn_name}
        """
        actions: List[Dict[str, Any]] = []
        raw_edges: List[Dict[str, Any]] = []
        root = tree.root_node

        if lang in ("typescript", "javascript", "tsx"):
            actions, raw_edges = self._ts_extract_actions(root, rel_path)
        elif lang == "python":
            actions, raw_edges = self._py_extract_actions(root, rel_path)

        return actions, raw_edges

    def extract_decisions(
        self, tree: tree_sitter.Tree, lang: str, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Returns DecisionNode dicts for meaningful conditional branches."""
        decisions: List[Dict[str, Any]] = []
        root = tree.root_node

        if lang in ("typescript", "javascript", "tsx"):
            decisions.extend(self._ts_extract_decisions(root, rel_path))
        elif lang == "python":
            decisions.extend(self._py_extract_decisions(root, rel_path))

        return decisions

    def extract_integrations(
        self, tree: tree_sitter.Tree, lang: str, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Returns IntegrationNode dicts for DB/HTTP/SDK calls."""
        integrations: List[Dict[str, Any]] = []
        root = tree.root_node

        if lang in ("typescript", "javascript", "tsx"):
            integrations.extend(self._ts_extract_prisma(root, rel_path))
            integrations.extend(self._ts_extract_http_clients(root, rel_path))
        elif lang == "python":
            integrations.extend(self._py_extract_integrations(root, rel_path))

        return integrations

    # ------------------------------------------------------------------
    # TypeScript / JavaScript extractor internals
    # ------------------------------------------------------------------

    def _ts_extract_http_routes(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match: app.get('/path', handler), router.post('/path', handler), etc."""
        HTTP_METHODS = {"get", "post", "put", "patch", "delete", "all", "use"}
        triggers = []

        for node in self._walk(root):
            if node.type != "call_expression":
                continue
            fn = node.child_by_field_name("function")
            if not fn or fn.type != "member_expression":
                continue
            prop = fn.child_by_field_name("property")
            if not prop or prop.text.decode("utf-8").lower() not in HTTP_METHODS:
                continue

            method = prop.text.decode("utf-8").upper()
            args = node.child_by_field_name("arguments")
            if not args:
                continue

            # First string arg → route path
            route_path = self._first_string_arg(args)
            if route_path is None:
                route_path = "unknown"

            qualifier = f"{method} {route_path}"
            label = f"{method} {route_path}"
            line = node.start_point[0] + 1

            triggers.append(_make_node(
                "TRIGGER", "HTTP_ROUTE", qualifier, label,
                rel_path, line,
                method=method,
                path=route_path,
            ))

        return triggers

    def _ts_extract_nextjs_routes(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match: export async function GET(req) {} in app/**/route.ts"""
        if "route" not in rel_path:
            return []

        HTTP_NAMES = {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"}
        triggers = []

        for node in self._walk(root):
            if node.type not in ("export_statement",):
                continue
            decl = node.child_by_field_name("declaration")
            if not decl:
                # Some Tree-sitter builds expose children differently
                for child in node.children:
                    if child.type in ("function_declaration", "async_function_declaration"):
                        decl = child
                        break
            if not decl:
                continue
            name_node = decl.child_by_field_name("name")
            if not name_node:
                continue
            fn_name = name_node.text.decode("utf-8")
            if fn_name not in HTTP_NAMES:
                continue

            line = node.start_point[0] + 1
            route_path = self._infer_nextjs_route(rel_path)
            qualifier = f"{fn_name} {route_path}"

            triggers.append(_make_node(
                "TRIGGER", "HTTP_ROUTE", qualifier, f"{fn_name} {route_path}",
                rel_path, line,
                method=fn_name,
                path=route_path,
            ))

        return triggers

    def _ts_extract_event_listeners(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match: emitter.on('event', handler), process.on('signal', …)"""
        EVENT_METHODS = {"on", "addListener", "addEventListener", "subscribe", "once"}
        triggers = []

        for node in self._walk(root):
            if node.type != "call_expression":
                continue
            fn = node.child_by_field_name("function")
            if not fn or fn.type != "member_expression":
                continue
            prop = fn.child_by_field_name("property")
            if not prop or prop.text.decode("utf-8") not in EVENT_METHODS:
                continue

            args = node.child_by_field_name("arguments")
            event_name = self._first_string_arg(args) if args else None
            if event_name is None:
                event_name = "unknown"

            line = node.start_point[0] + 1
            qualifier = f"EVENT::{event_name}"

            triggers.append(_make_node(
                "TRIGGER", "EVENT_LISTENER", qualifier,
                f"on:{event_name}",
                rel_path, line,
            ))

        return triggers

    def _ts_extract_actions(
        self, root: tree_sitter.Node, rel_path: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Extract class methods and named functions as ActionNodes."""
        actions: List[Dict[str, Any]] = []
        raw_edges: List[Dict[str, Any]] = []
        seen: set = set()

        for node in self._walk(root):
            name: Optional[str] = None
            body: Optional[tree_sitter.Node] = None

            if node.type == "method_definition":
                name_node = node.child_by_field_name("name")
                name = name_node.text.decode("utf-8") if name_node else None
                body = node.child_by_field_name("body")

            elif node.type == "function_declaration":
                name_node = node.child_by_field_name("name")
                name = name_node.text.decode("utf-8") if name_node else None
                body = node.child_by_field_name("body")

            elif node.type == "variable_declarator":
                val = node.child_by_field_name("value")
                if val and val.type in ("arrow_function", "function"):
                    name_node = node.child_by_field_name("name")
                    name = name_node.text.decode("utf-8") if name_node else None
                    body = val.child_by_field_name("body")

            if not name or name in seen:
                continue

            # Skip constructors / lifecycle names that are not business logic
            if name in ("constructor", "ngOnInit", "componentDidMount"):
                continue

            seen.add(name)
            line = node.start_point[0] + 1
            node_id = f"ACTION::{name}"

            actions.append(_make_node(
                "ACTION", "SERVICE_METHOD", name, name,
                rel_path, line,
            ))

            # Collect callee names from within the body
            if body:
                for callee in self._collect_callees(body):
                    raw_edges.append({
                        "source": node_id,
                        "target_name": callee,
                    })

        return actions, raw_edges

    def _ts_extract_decisions(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        decisions = []

        for node in self._walk(root):
            if node.type == "if_statement":
                cond = node.child_by_field_name("condition")
                cond_text = cond.text.decode("utf-8") if cond else ""
                if not _has_decision_signal(cond_text):
                    continue
                line = node.start_point[0] + 1
                qualifier = f"IF_{rel_path.replace('/', '_')}_{line}"
                decisions.append(_make_node(
                    "DECISION", "IF_ELSE", qualifier,
                    f"if ({cond_text[:60]})",
                    rel_path, line,
                    condition=cond_text,
                ))

            elif node.type == "switch_statement":
                val = node.child_by_field_name("value")
                val_text = val.text.decode("utf-8") if val else "switch"
                line = node.start_point[0] + 1
                qualifier = f"SWITCH_{rel_path.replace('/', '_')}_{line}"
                decisions.append(_make_node(
                    "DECISION", "SWITCH_CASE", qualifier,
                    f"switch ({val_text[:60]})",
                    rel_path, line,
                    condition=val_text,
                ))

        return decisions

    def _ts_extract_prisma(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match: this.prisma.Model.operation(…) or prisma.model.op(…)"""
        integrations = []
        seen: set = set()

        for node in self._walk(root):
            if node.type != "call_expression":
                continue
            fn = node.child_by_field_name("function")
            if not fn or fn.type != "member_expression":
                continue

            fn_text = fn.text.decode("utf-8")
            # Detect prisma chain: this.prisma.* or prisma.*
            if "prisma" not in fn_text.lower():
                continue

            parts = fn_text.split(".")
            # Expect at least [obj, "prisma", model, operation]
            # or [this, "prisma", model, operation]
            prisma_idx = next(
                (i for i, p in enumerate(parts) if p.lower() == "prisma"), -1
            )
            if prisma_idx == -1:
                continue

            model = parts[prisma_idx + 1] if prisma_idx + 1 < len(parts) else "unknown"
            operation = parts[prisma_idx + 2] if prisma_idx + 2 < len(parts) else "unknown"

            line = node.start_point[0] + 1
            qualifier = f"DB::{model}.{operation}@{rel_path}:{line}"
            if qualifier in seen:
                continue
            seen.add(qualifier)

            read_ops = {"findUnique", "findFirst", "findMany", "count", "aggregate"}
            subtype = "DATABASE_READ" if operation in read_ops else "DATABASE_WRITE"

            integrations.append(_make_node(
                "INTEGRATION", subtype, qualifier,
                f"prisma.{model}.{operation}",
                rel_path, line,
                operation=operation,
                model=model,
            ))

        return integrations

    def _ts_extract_http_clients(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match: fetch(url), axios.get(url), got(url), request(url)"""
        HTTP_CLIENTS = {"fetch", "axios", "got", "request", "http", "https"}
        integrations = []
        seen: set = set()

        for node in self._walk(root):
            if node.type != "call_expression":
                continue
            fn = node.child_by_field_name("function")
            if not fn:
                continue

            fn_text = fn.text.decode("utf-8")
            root_name = fn_text.split(".")[0]

            if root_name not in HTTP_CLIENTS:
                continue

            line = node.start_point[0] + 1
            qualifier = f"HTTP::{fn_text}@{rel_path}:{line}"
            if qualifier in seen:
                continue
            seen.add(qualifier)

            integrations.append(_make_node(
                "INTEGRATION", "EXTERNAL_HTTP", qualifier,
                f"{fn_text}(…)",
                rel_path, line,
                operation="HTTP",
            ))

        return integrations

    # ------------------------------------------------------------------
    # Python extractor internals
    # ------------------------------------------------------------------

    def _py_extract_routes(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match Python FastAPI / Flask decorator patterns."""
        ROUTE_DECORATORS = re.compile(
            r"@(app|router|blueprint)\.(get|post|put|patch|delete|route)\(['\"]([^'\"]+)['\"]"
        )
        triggers = []

        # Iterate decorated_definition nodes
        for node in self._walk(root):
            if node.type not in ("decorated_definition", "function_definition"):
                continue
            node_text = node.text.decode("utf-8") if node.text else ""
            match = ROUTE_DECORATORS.search(node_text)
            if not match:
                continue

            method = match.group(2).upper()
            if method == "ROUTE":
                method = "GET"
            route_path = match.group(3)
            line = node.start_point[0] + 1
            qualifier = f"{method} {route_path}"

            triggers.append(_make_node(
                "TRIGGER", "HTTP_ROUTE", qualifier,
                f"{method} {route_path}",
                rel_path, line,
                method=method,
                path=route_path,
            ))

        return triggers

    def _py_extract_actions(
        self, root: tree_sitter.Node, rel_path: str
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        actions: List[Dict[str, Any]] = []
        raw_edges: List[Dict[str, Any]] = []
        seen: set = set()

        for node in self._walk(root):
            if node.type not in ("function_definition", "async_function_definition"):
                continue
            name_node = node.child_by_field_name("name")
            if not name_node:
                continue
            name = name_node.text.decode("utf-8")
            if name in seen or name.startswith("__"):
                continue
            seen.add(name)

            line = node.start_point[0] + 1
            node_id = f"ACTION::{name}"

            actions.append(_make_node(
                "ACTION", "SERVICE_METHOD", name, name,
                rel_path, line,
            ))

            body = node.child_by_field_name("body")
            if body:
                for callee in self._collect_callees(body):
                    raw_edges.append({"source": node_id, "target_name": callee})

        return actions, raw_edges

    def _py_extract_decisions(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        decisions = []

        for node in self._walk(root):
            if node.type == "if_statement":
                cond = node.child_by_field_name("condition")
                cond_text = cond.text.decode("utf-8") if cond else ""
                if not _has_decision_signal(cond_text):
                    continue
                line = node.start_point[0] + 1
                qualifier = f"IF_{rel_path.replace('/', '_')}_{line}"
                decisions.append(_make_node(
                    "DECISION", "IF_ELSE", qualifier,
                    f"if ({cond_text[:60]})",
                    rel_path, line,
                    condition=cond_text,
                ))

        return decisions

    def _py_extract_integrations(
        self, root: tree_sitter.Node, rel_path: str
    ) -> List[Dict[str, Any]]:
        """Match SQLAlchemy session calls and httpx/requests HTTP calls."""
        integrations = []
        seen: set = set()
        HTTP_LIBS = {"requests", "httpx", "aiohttp", "urllib"}

        for node in self._walk(root):
            if node.type != "call":
                continue
            fn = node.child_by_field_name("function")
            if not fn:
                continue
            fn_text = fn.text.decode("utf-8") if fn.text else ""
            root_name = fn_text.split(".")[0]

            line = node.start_point[0] + 1

            # DB: session.query / db.execute / Model.objects
            if root_name in ("session", "db", "conn", "cursor"):
                qualifier = f"DB::{fn_text}@{rel_path}:{line}"
                if qualifier not in seen:
                    seen.add(qualifier)
                    integrations.append(_make_node(
                        "INTEGRATION", "DATABASE_WRITE", qualifier,
                        fn_text,
                        rel_path, line,
                        operation=fn_text.split(".")[-1] if "." in fn_text else fn_text,
                    ))

            # HTTP client
            elif root_name in HTTP_LIBS:
                qualifier = f"HTTP::{fn_text}@{rel_path}:{line}"
                if qualifier not in seen:
                    seen.add(qualifier)
                    integrations.append(_make_node(
                        "INTEGRATION", "EXTERNAL_HTTP", qualifier,
                        f"{fn_text}(…)",
                        rel_path, line,
                        operation="HTTP",
                    ))

        return integrations

    # ------------------------------------------------------------------
    # Shared helpers
    # ------------------------------------------------------------------

    def _walk(self, node: tree_sitter.Node):
        """Depth-first AST traversal generator."""
        yield node
        for child in node.children:
            yield from self._walk(child)

    def _child_text(
        self, node: tree_sitter.Node, types: Tuple[str, ...]
    ) -> Optional[str]:
        for child in node.children:
            if child.type in types and child.text:
                return child.text.decode("utf-8")
        return None

    def _first_string_arg(self, args_node: tree_sitter.Node) -> Optional[str]:
        """Return the text content of the first string literal in an arguments node."""
        for child in args_node.children:
            if child.type in ("string", "string_fragment", "template_string"):
                raw = child.text.decode("utf-8")
                # Strip surrounding quotes / backticks
                return raw.strip("'\"` ")
            # string content child
            if child.type == "string_content":
                return child.text.decode("utf-8")
        return None

    def _collect_callees(self, body: tree_sitter.Node) -> List[str]:
        """
        Walk a function body and collect the names of functions being called.
        Returns bare names only (no args).
        """
        callees: List[str] = []
        for node in self._walk(body):
            if node.type != "call_expression":
                continue
            fn = node.child_by_field_name("function")
            if not fn:
                continue
            if fn.type == "identifier":
                callees.append(fn.text.decode("utf-8"))
            elif fn.type == "member_expression":
                prop = fn.child_by_field_name("property")
                if prop:
                    callees.append(prop.text.decode("utf-8"))
        return callees

    def _infer_nextjs_route(self, rel_path: str) -> str:
        """
        Convert a file path like  app/api/users/[id]/route.ts
        to a route path like      /api/users/[id]
        """
        # strip leading path components up to and including "app"
        parts = rel_path.replace("\\", "/").split("/")
        try:
            app_idx = parts.index("app")
            parts = parts[app_idx + 1 :]
        except ValueError:
            pass
        # remove trailing "route.ts" / "route.tsx"
        if parts and parts[-1].startswith("route."):
            parts = parts[:-1]
        return "/" + "/".join(parts) if parts else "/"
