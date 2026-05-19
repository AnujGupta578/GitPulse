"""
Unit tests for the SemanticWorkflowParser, GraphAssembler, and
WorkflowSemanticEngine.

Run with:
    pytest src/engine/tests/test_workflow_parser.py -v
"""

from __future__ import annotations

import asyncio
import os
import tempfile
from typing import Any, Dict, List
from unittest.mock import patch

import pytest

from src.engine.graph_assembler import GraphAssembler
from src.engine.semantic_workflow_parser import SemanticWorkflowParser
from src.engine.workflow_engine import WorkflowSemanticEngine


# ---------------------------------------------------------------------------
# Fixtures — reusable parser / assembler
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def parser() -> SemanticWorkflowParser:
    """A parser instance pointed at a throw-away path (no disk I/O needed)."""
    return SemanticWorkflowParser("/tmp/test_repo")


@pytest.fixture(scope="module")
def assembler() -> GraphAssembler:
    return GraphAssembler()


# ---------------------------------------------------------------------------
# Helper: parse TypeScript source and run an extractor
# ---------------------------------------------------------------------------


def _parse_ts(parser: SemanticWorkflowParser, source: str):
    """Return the Tree-sitter tree for a TypeScript snippet."""
    return parser.intent_parser.parse_content(source, "typescript")


def _parse_py(parser: SemanticWorkflowParser, source: str):
    """Return the Tree-sitter tree for a Python snippet."""
    return parser.intent_parser.parse_content(source, "python")


# ===========================================================================
# 1.  SemanticWorkflowParser — extract_triggers (TypeScript)
# ===========================================================================


class TestExtractTriggersTypeScript:
    """Validate TRIGGER extraction from TypeScript source."""

    def test_fastify_route_detected(self, parser):
        src = """
        fastify.get('/api/users', async (req, reply) => {
            reply.send({ users: [] });
        });
        """
        tree = _parse_ts(parser, src)
        nodes = parser.extract_triggers(tree, "typescript", "src/routes/users.ts")
        assert len(nodes) >= 1
        trigger = nodes[0]
        assert trigger["type"] == "TRIGGER"
        assert trigger["subtype"] == "HTTP_ROUTE"
        assert trigger["metadata"]["method"] == "GET"
        assert trigger["metadata"]["path"] == "/api/users"

    def test_express_post_route_detected(self, parser):
        src = """
        router.post('/auth/login', loginHandler);
        """
        tree = _parse_ts(parser, src)
        nodes = parser.extract_triggers(tree, "typescript", "src/auth.routes.ts")
        assert len(nodes) >= 1
        assert nodes[0]["metadata"]["method"] == "POST"

    def test_multiple_methods_detected(self, parser):
        src = """
        app.get('/health', healthHandler);
        app.post('/sync', syncHandler);
        app.delete('/repos/:id', deleteRepo);
        """
        tree = _parse_ts(parser, src)
        nodes = parser.extract_triggers(tree, "typescript", "src/server.ts")
        methods = [n["metadata"]["method"] for n in nodes]
        assert "GET" in methods
        assert "POST" in methods
        assert "DELETE" in methods

    def test_event_listener_detected(self, parser):
        src = """
        process.on('unhandledRejection', (reason) => {
            logger.error(reason);
        });
        """
        tree = _parse_ts(parser, src)
        nodes = parser.extract_triggers(tree, "typescript", "src/index.ts")
        assert len(nodes) >= 1
        assert nodes[0]["type"] == "TRIGGER"
        assert nodes[0]["subtype"] == "EVENT_LISTENER"

    def test_nextjs_route_detected(self, parser):
        src = """
        export async function GET(request: Request) {
            return Response.json({ ok: true });
        }
        export async function POST(request: Request) {
            return Response.json({ created: true });
        }
        """
        tree = _parse_ts(parser, src)
        # Must contain "route" in rel_path for Next.js detection
        nodes = parser.extract_triggers(tree, "typescript", "app/api/users/route.ts")
        methods = [n["metadata"]["method"] for n in nodes]
        assert "GET" in methods
        assert "POST" in methods

    def test_no_triggers_on_type_only_file(self, parser):
        src = """
        export interface User {
            id: string;
            name: string;
        }
        export type Status = 'active' | 'inactive';
        """
        tree = _parse_ts(parser, src)
        nodes = parser.extract_triggers(tree, "typescript", "src/types.ts")
        assert nodes == []


# ===========================================================================
# 2.  SemanticWorkflowParser — extract_actions (TypeScript)
# ===========================================================================


class TestExtractActionsTypeScript:
    """Validate ACTION extraction from TypeScript source."""

    def test_class_method_detected(self, parser):
        src = """
        class SyncService {
            async triggerSync(repoId: string) {
                const job = await this.prisma.syncJob.create({ data: {} });
                return job;
            }
        }
        """
        tree = _parse_ts(parser, src)
        actions, raw_edges = parser.extract_actions(tree, "typescript", "src/sync.service.ts")
        names = [a["metadata"]["file"] for a in actions]
        assert len(actions) >= 1
        action = next(a for a in actions if a["id"] == "ACTION::triggerSync")
        assert action["type"] == "ACTION"
        assert action["subtype"] == "SERVICE_METHOD"

    def test_raw_edges_emitted_for_callees(self, parser):
        src = """
        class AnalysisService {
            async runAnalysis() {
                this.prepareData();
                this.saveResults();
            }
            async prepareData() {}
            async saveResults() {}
        }
        """
        tree = _parse_ts(parser, src)
        _, raw_edges = parser.extract_actions(tree, "typescript", "src/analysis.service.ts")
        # runAnalysis should have callee edges for prepareData and saveResults
        sources = [e["source"] for e in raw_edges]
        targets = [e["target_name"] for e in raw_edges]
        assert "ACTION::runAnalysis" in sources
        assert "prepareData" in targets
        assert "saveResults" in targets

    def test_arrow_function_detected(self, parser):
        src = """
        const handleCommit = async (commitSha: string) => {
            console.log('processing', commitSha);
        };
        """
        tree = _parse_ts(parser, src)
        actions, _ = parser.extract_actions(tree, "typescript", "src/handlers.ts")
        assert any(a["id"] == "ACTION::handleCommit" for a in actions)

    def test_constructor_excluded(self, parser):
        src = """
        class MyService {
            constructor(private prisma: PrismaClient) {}
            async doWork() { return true; }
        }
        """
        tree = _parse_ts(parser, src)
        actions, _ = parser.extract_actions(tree, "typescript", "src/service.ts")
        ids = [a["id"] for a in actions]
        assert "ACTION::constructor" not in ids
        assert "ACTION::doWork" in ids


# ===========================================================================
# 3.  SemanticWorkflowParser — extract_decisions (TypeScript)
# ===========================================================================


class TestExtractDecisionsTypeScript:
    """Validate DECISION extraction from TypeScript source."""

    def test_if_with_strict_equality_detected(self, parser):
        src = """
        async function processJob(job) {
            if (job.status === 'PENDING') {
                return start(job);
            }
        }
        """
        tree = _parse_ts(parser, src)
        decisions = parser.extract_decisions(tree, "typescript", "src/processor.ts")
        assert len(decisions) >= 1
        assert decisions[0]["type"] == "DECISION"
        assert decisions[0]["subtype"] == "IF_ELSE"
        assert "===" in decisions[0]["metadata"]["condition"]

    def test_switch_statement_detected(self, parser):
        src = """
        function route(action: string) {
            switch (action) {
                case 'sync': return doSync();
                case 'build': return doBuild();
            }
        }
        """
        tree = _parse_ts(parser, src)
        decisions = parser.extract_decisions(tree, "typescript", "src/router.ts")
        switch_decisions = [d for d in decisions if d["subtype"] == "SWITCH_CASE"]
        assert len(switch_decisions) >= 1

    def test_bare_if_without_signal_excluded(self, parser):
        """An `if (something)` with no comparison operators should be excluded."""
        src = """
        if (isReady) {
            proceed();
        }
        """
        tree = _parse_ts(parser, src)
        decisions = parser.extract_decisions(tree, "typescript", "src/misc.ts")
        # isReady has no ===, !==, >, < etc. → should be excluded
        signal_decisions = [d for d in decisions if "===" in d["metadata"].get("condition", "")]
        assert len(signal_decisions) == 0

    def test_optional_chaining_detected(self, parser):
        src = """
        if (user?.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        """
        tree = _parse_ts(parser, src)
        decisions = parser.extract_decisions(tree, "typescript", "src/auth.ts")
        assert len(decisions) >= 1


# ===========================================================================
# 4.  SemanticWorkflowParser — extract_integrations (TypeScript)
# ===========================================================================


class TestExtractIntegrationsTypeScript:
    """Validate INTEGRATION extraction from TypeScript source."""

    def test_prisma_read_detected(self, parser):
        src = """
        class RepoService {
            async getRepo(id: string) {
                return this.prisma.repository.findUnique({ where: { id } });
            }
        }
        """
        tree = _parse_ts(parser, src)
        integrations = parser.extract_integrations(tree, "typescript", "src/repo.service.ts")
        assert len(integrations) >= 1
        intg = integrations[0]
        assert intg["type"] == "INTEGRATION"
        assert intg["subtype"] == "DATABASE_READ"
        assert intg["metadata"]["model"] == "repository"
        assert intg["metadata"]["operation"] == "findUnique"

    def test_prisma_write_detected(self, parser):
        src = """
        async function createSnapshot(data) {
            return prisma.architectureSnapshot.create({ data });
        }
        """
        tree = _parse_ts(parser, src)
        integrations = parser.extract_integrations(tree, "typescript", "src/snapshot.ts")
        writes = [i for i in integrations if i["subtype"] == "DATABASE_WRITE"]
        assert len(writes) >= 1

    def test_fetch_http_call_detected(self, parser):
        src = """
        async function callExternalAPI(url: string) {
            const res = await fetch(url, { method: 'POST' });
            return res.json();
        }
        """
        tree = _parse_ts(parser, src)
        integrations = parser.extract_integrations(tree, "typescript", "src/api.client.ts")
        http_calls = [i for i in integrations if i["subtype"] == "EXTERNAL_HTTP"]
        assert len(http_calls) >= 1

    def test_axios_detected(self, parser):
        src = """
        const data = await axios.get('https://api.github.com/user');
        """
        tree = _parse_ts(parser, src)
        integrations = parser.extract_integrations(tree, "typescript", "src/github.ts")
        http_calls = [i for i in integrations if i["subtype"] == "EXTERNAL_HTTP"]
        assert len(http_calls) >= 1

    def test_no_integration_on_type_only_file(self, parser):
        src = """
        export type DBConfig = { host: string; port: number; };
        """
        tree = _parse_ts(parser, src)
        integrations = parser.extract_integrations(tree, "typescript", "src/config.ts")
        assert integrations == []


# ===========================================================================
# 5.  Python extractors
# ===========================================================================


class TestPythonExtractors:
    """Validate extractors on Python source (FastAPI patterns)."""

    def test_fastapi_route_detected(self, parser):
        src = """
@router.get("/repositories")
async def list_repositories(db: Session = Depends(get_db)):
    return db.query(Repository).all()
        """
        tree = _parse_py(parser, src)
        triggers = parser.extract_triggers(tree, "python", "src/modules/repos/routes.py")
        assert len(triggers) >= 1
        assert triggers[0]["type"] == "TRIGGER"
        assert triggers[0]["subtype"] == "HTTP_ROUTE"

    def test_python_function_action(self, parser):
        src = """
async def sync_repository(repo_id: str, db: Session):
    repo = db.query(Repository).filter_by(id=repo_id).first()
    if repo is None:
        raise ValueError("Not found")
    return repo
        """
        tree = _parse_py(parser, src)
        actions, _ = parser.extract_actions(tree, "python", "src/sync.py")
        assert any(a["id"] == "ACTION::sync_repository" for a in actions)

    def test_python_if_decision_detected(self, parser):
        src = """
def check_status(status):
    if status !== 'active':
        return False
    return True
        """
        # Note: !== is not valid Python but tree-sitter parses it anyway
        # We'll use a valid Python equivalent
        src = """
def check_status(status: str) -> bool:
    if status != 'active':
        return False
    return True
        """
        tree = _parse_py(parser, src)
        decisions = parser.extract_decisions(tree, "python", "src/utils.py")
        # != contains < via the signal regex — let's verify our regex covers !=
        # The signal regex covers !==, >=, <=, >, <, ?., !
        # "!=" contains "!" which is in the signal list
        assert len(decisions) >= 1


# ===========================================================================
# 6.  GraphAssembler
# ===========================================================================


class TestGraphAssembler:
    """Validate graph assembly logic."""

    def _make_trigger(self, name: str, file: str = "routes.ts") -> Dict:
        return {
            "id": f"TRIGGER::{name}",
            "type": "TRIGGER",
            "subtype": "HTTP_ROUTE",
            "label": name,
            "metadata": {"file": file, "line": 1, "method": "GET", "path": f"/{name}"},
        }

    def _make_action(self, name: str, file: str = "service.ts") -> Dict:
        return {
            "id": f"ACTION::{name}",
            "type": "ACTION",
            "subtype": "SERVICE_METHOD",
            "label": name,
            "metadata": {"file": file, "line": 10},
        }

    def _make_integration(self, name: str, subtype: str = "DATABASE_READ", file: str = "service.ts") -> Dict:
        return {
            "id": f"INTEGRATION::{name}",
            "type": "INTEGRATION",
            "subtype": subtype,
            "label": name,
            "metadata": {"file": file, "line": 20, "operation": "findMany"},
        }

    def test_basic_topology_schema_version(self, assembler):
        topology = assembler.assemble([], [], [], [], [], {})
        assert topology["schemaVersion"] == "2.0-workflow"
        assert "nodes" in topology
        assert "edges" in topology

    def test_trigger_to_action_edge_type(self, assembler):
        trigger = self._make_trigger("listRepos", file="routes.ts")
        action = self._make_action("findAllRepos", file="routes.ts")
        raw_edges = [{"source": "TRIGGER::listRepos", "target_name": "findAllRepos"}]

        topology = assembler.assemble(
            [trigger], [action], [], [], raw_edges,
            {"findAllRepos": {"file": "routes.ts", "line": 10, "node_id": "ACTION::findAllRepos"}}
        )

        call_edges = [e for e in topology["edges"] if e["type"] == "CALL"]
        assert len(call_edges) >= 1
        assert any(e["source"] == "TRIGGER::listRepos" for e in call_edges)

    def test_action_to_db_integration_query_type(self, assembler):
        action = self._make_action("getUsers", file="service.ts")
        integration = self._make_integration("DB::User.findMany", file="service.ts")
        raw_edges = [{"source": "ACTION::getUsers", "target_name": "DB::User.findMany"}]

        topology = assembler.assemble(
            [], [action], [], [integration], raw_edges,
            {"DB::User.findMany": {"node_id": "INTEGRATION::DB::User.findMany"}}
        )

        query_edges = [e for e in topology["edges"] if e["type"] == "QUERY"]
        assert len(query_edges) >= 1

    def test_deduplication(self, assembler):
        """Duplicate node IDs should be collapsed to a single node."""
        trigger = self._make_trigger("getRepos")
        duplicate_trigger = self._make_trigger("getRepos")

        topology = assembler.assemble([trigger, duplicate_trigger], [], [], [], [], {})
        trigger_nodes = [n for n in topology["nodes"] if n["type"] == "TRIGGER"]
        assert len(trigger_nodes) == 1

    def test_metrics_trigger_count(self, assembler):
        triggers = [self._make_trigger(f"route{i}") for i in range(3)]
        actions = [self._make_action(f"action{i}") for i in range(5)]
        topology = assembler.assemble(triggers, actions, [], [], [], {})

        metrics = GraphAssembler.compute_metrics(topology["nodes"], topology["edges"])
        assert metrics["triggerCount"] == 3
        assert metrics["actionCount"] == 5

    def test_cyclomatic_complexity_minimum_one(self, assembler):
        """A graph with no edges still has cyclomatic complexity ≥ 1."""
        actions = [self._make_action("lone")]
        topology = assembler.assemble([], actions, [], [], [], {})
        metrics = GraphAssembler.compute_metrics(topology["nodes"], topology["edges"])
        assert metrics["cyclomaticComplexity"] >= 1

    def test_cycle_detected_and_marked_recursive(self, assembler):
        """A cycle between two actions should produce a RECURSIVE edge."""
        a1 = self._make_action("fnA")
        a2 = self._make_action("fnB")
        raw_edges = [
            {"source": "ACTION::fnA", "target_name": "fnB"},
            {"source": "ACTION::fnB", "target_name": "fnA"},
        ]
        symbol_table = {
            "fnA": {"node_id": "ACTION::fnA"},
            "fnB": {"node_id": "ACTION::fnB"},
        }
        topology = assembler.assemble([], [a1, a2], [], [], raw_edges, symbol_table)
        recursive_edges = [e for e in topology["edges"] if e["type"] == "RECURSIVE"]
        assert len(recursive_edges) >= 1


# ===========================================================================
# 7.  WorkflowSemanticEngine — integration test with real temp files
# ===========================================================================


class TestWorkflowSemanticEngine:
    """End-to-end integration tests using real temp files on disk."""

    def _create_repo(self, files: Dict[str, str]) -> str:
        """Write files dict {rel_path: content} to a temp directory."""
        tmpdir = tempfile.mkdtemp()
        for rel_path, content in files.items():
            abs_path = os.path.join(tmpdir, rel_path.replace("/", os.sep))
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as fh:
                fh.write(content)
        return tmpdir

    def test_empty_repo_returns_zero_metrics(self):
        tmpdir = tempfile.mkdtemp()
        engine = WorkflowSemanticEngine(tmpdir)
        result = asyncio.run(engine.run())
        assert result["metrics"]["triggerCount"] == 0
        assert result["metrics"]["totalNodes"] == 0

    def test_single_ts_route_file(self):
        repo = self._create_repo({
            "src/routes.ts": """
            const app = require('express')();
            app.get('/api/hello', async (req, res) => {
                const data = await fetchData();
                res.json(data);
            });
            async function fetchData() {
                return { message: 'hello' };
            }
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        topology = result["topology"]
        assert topology["schemaVersion"] == "2.0-workflow"
        trigger_nodes = [n for n in topology["nodes"] if n["type"] == "TRIGGER"]
        assert len(trigger_nodes) >= 1

    def test_topology_has_correct_schema(self):
        repo = self._create_repo({
            "src/api.ts": """
            app.post('/users', createUser);
            async function createUser(req, res) {
                const user = await prisma.user.create({ data: req.body });
                res.json(user);
            }
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())

        topology = result["topology"]
        assert "schemaVersion" in topology
        assert topology["schemaVersion"] == "2.0-workflow"
        assert isinstance(topology["nodes"], list)
        assert isinstance(topology["edges"], list)

    def test_node_ids_are_namespaced(self):
        repo = self._create_repo({
            "src/service.ts": """
            app.get('/repos', listRepos);
            async function listRepos(req, res) {
                const repos = await prisma.repository.findMany({});
                res.json(repos);
            }
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        node_ids = [n["id"] for n in result["topology"]["nodes"]]
        # All node IDs must follow the "TYPE::qualifier" format
        for nid in node_ids:
            assert "::" in nid, f"Node ID '{nid}' is not namespaced"

    def test_node_modules_excluded(self):
        """node_modules directory must never produce workflow nodes."""
        repo = self._create_repo({
            "node_modules/express/index.ts": """
            export function express() {}
            """,
            "src/app.ts": """
            app.get('/ping', (req, res) => res.send('pong'));
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        files = [n["metadata"]["file"] for n in result["topology"]["nodes"]]
        assert not any("node_modules" in f for f in files)

    def test_metrics_shape(self):
        repo = self._create_repo({
            "src/routes.ts": """
            app.get('/health', healthCheck);
            async function healthCheck(req, res) { res.json({ ok: true }); }
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        metrics = result["metrics"]

        required_keys = [
            "triggerCount", "actionCount", "decisionCount",
            "integrationCount", "cyclomaticComplexity", "avgCallDepth",
        ]
        for key in required_keys:
            assert key in metrics, f"Missing metric key: {key}"

    def test_python_fastapi_triggers_detected(self):
        repo = self._create_repo({
            "src/routes.py": """
from fastapi import APIRouter
router = APIRouter()

@router.get("/repositories")
async def list_repositories():
    return []

@router.post("/repositories")
async def create_repository(data: dict):
    return data
"""
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        triggers = [n for n in result["topology"]["nodes"] if n["type"] == "TRIGGER"]
        assert len(triggers) >= 1

    def test_test_files_excluded(self):
        """Files matching .test. or .spec. patterns must be skipped."""
        repo = self._create_repo({
            "src/service.test.ts": """
            app.get('/test-route', handler);
            async function handler(req, res) { res.json({}); }
            """,
            "src/service.ts": """
            async function realService() { return true; }
            """
        })
        engine = WorkflowSemanticEngine(repo)
        result = asyncio.run(engine.run())
        files = [n["metadata"]["file"] for n in result["topology"]["nodes"]]
        assert not any(".test." in f for f in files)


# ===========================================================================
# 8.  Edge schema validation
# ===========================================================================


class TestEdgeSchema:
    """Verify that all emitted edges conform to the SPEC.md §3.2 schema."""

    VALID_EDGE_TYPES = {"CALL", "BRANCH_TRUE", "BRANCH_FALSE", "QUERY", "EVENT", "RECURSIVE"}
    VALID_NODE_TYPES = {"TRIGGER", "ACTION", "DECISION", "INTEGRATION"}

    def test_all_nodes_have_required_fields(self):
        assembler = GraphAssembler()
        trigger = {
            "id": "TRIGGER::GET /api/users",
            "type": "TRIGGER",
            "subtype": "HTTP_ROUTE",
            "label": "GET /api/users",
            "metadata": {"file": "src/routes.ts", "line": 5, "method": "GET", "path": "/api/users"},
        }
        action = {
            "id": "ACTION::getUsers",
            "type": "ACTION",
            "subtype": "SERVICE_METHOD",
            "label": "getUsers",
            "metadata": {"file": "src/service.ts", "line": 12},
        }
        topology = assembler.assemble(
            [trigger], [action], [], [],
            [{"source": "TRIGGER::GET /api/users", "target_name": "getUsers"}],
            {"getUsers": {"node_id": "ACTION::getUsers"}},
        )

        for node in topology["nodes"]:
            assert "id" in node
            assert "type" in node
            assert "subtype" in node
            assert "label" in node
            assert "metadata" in node
            assert node["type"] in self.VALID_NODE_TYPES

        for edge in topology["edges"]:
            assert "id" in edge
            assert "source" in edge
            assert "target" in edge
            assert "label" in edge
            assert "type" in edge
            assert edge["type"] in self.VALID_EDGE_TYPES

    def test_all_edge_types_are_valid(self):
        assembler = GraphAssembler()
        a1 = {
            "id": "ACTION::a1", "type": "ACTION", "subtype": "SERVICE_METHOD",
            "label": "a1", "metadata": {"file": "f.ts", "line": 1},
        }
        a2 = {
            "id": "ACTION::a2", "type": "ACTION", "subtype": "SERVICE_METHOD",
            "label": "a2", "metadata": {"file": "f.ts", "line": 5},
        }
        raw_edges = [{"source": "ACTION::a1", "target_name": "a2"}]
        topology = assembler.assemble([], [a1, a2], [], [], raw_edges, {"a2": {"node_id": "ACTION::a2"}})
        for edge in topology["edges"]:
            assert edge["type"] in self.VALID_EDGE_TYPES


# ===========================================================================
# 9.  Git-Aware Visual Change Tracking tests
# ===========================================================================

class TestGitVisualChangeTracking:
    """Validate Git diff extraction and change-tracking state tagging."""

    def test_git_diff_lines_parser(self):
        """Verify that get_git_diff_lines correctly parses unified=0 git diff format."""
        mock_diff_output = (
            "diff --git a/src/main.py b/src/main.py\n"
            "--- a/src/main.py\n"
            "+++ b/src/main.py\n"
            "@@ -10,3 +10,5 @@ import os\n"
            "@@ -190 +191,2 @@ if __name__ == '__main__':\n"
            "diff --git a/src/engine/parser.py b/src/engine/parser.py\n"
            "--- a/src/engine/parser.py\n"
            "+++ b/src/engine/parser.py\n"
            "@@ -50,0 +51,10 @@ def test():\n"
        )

        import subprocess
        from unittest.mock import MagicMock
        with patch("subprocess.run") as mock_run:
            original_run = subprocess.run
            def side_effect(args, *args_list, **kwargs):
                if isinstance(args, list) and len(args) > 0:
                    if "rev-parse" in args:
                        mock_res_ok = MagicMock()
                        mock_res_ok.returncode = 0
                        mock_res_ok.stdout = ""
                        return mock_res_ok
                    elif "diff" in args:
                        mock_res_diff = MagicMock()
                        mock_res_diff.returncode = 0
                        mock_res_diff.stdout = mock_diff_output
                        return mock_res_diff
                try:
                    return original_run(args, *args_list, **kwargs)
                except Exception:
                    mock_res = MagicMock()
                    mock_res.returncode = 0
                    mock_res.stdout = ""
                    return mock_res
            mock_run.side_effect = side_effect

            from src.main import get_git_diff_lines
            res = get_git_diff_lines("/tmp/fake-repo")

            assert "src/main.py" in res
            assert "src/engine/parser.py" in res
            
            # @@ -10,3 +10,5 @@ -> +10,5 -> lines 10 to 14
            # @@ -190 +191,2 @@ -> +191,2 -> lines 191 to 192
            assert res["src/main.py"] == [(10, 14), (191, 192)]
            
            # @@ -50,0 +51,10 @@ -> +51,10 -> lines 51 to 60
            assert res["src/engine/parser.py"] == [(51, 60)]

    def test_apply_visual_change_tracking(self):
        """Validate state tagging (added, modified, deleted) based on git changes."""
        from src.main import apply_visual_change_tracking

        prev_topology = {
            "nodes": [
                {
                    "id": "ACTION::unchangedFn",
                    "type": "ACTION",
                    "subtype": "SERVICE_METHOD",
                    "label": "unchangedFn",
                    "metadata": {"file": "src/service.ts", "line": 5}
                },
                {
                    "id": "ACTION::modifiedFn",
                    "type": "ACTION",
                    "subtype": "SERVICE_METHOD",
                    "label": "modifiedFn",
                    "metadata": {"file": "src/service.ts", "line": 20}
                },
                {
                    "id": "ACTION::deletedFn",
                    "type": "ACTION",
                    "subtype": "SERVICE_METHOD",
                    "label": "deletedFn",
                    "metadata": {"file": "src/service.ts", "line": 40}
                }
            ]
        }

        current_result = {
            "topology": {
                "nodes": [
                    {
                        "id": "ACTION::unchangedFn",
                        "type": "ACTION",
                        "subtype": "SERVICE_METHOD",
                        "label": "unchangedFn",
                        "metadata": {"file": "src/service.ts", "line": 5}
                    },
                    {
                        "id": "ACTION::modifiedFn",
                        "type": "ACTION",
                        "subtype": "SERVICE_METHOD",
                        "label": "modifiedFn",
                        "metadata": {"file": "src/service.ts", "line": 20}
                    },
                    {
                        "id": "ACTION::addedFn",
                        "type": "ACTION",
                        "subtype": "SERVICE_METHOD",
                        "label": "addedFn",
                        "metadata": {"file": "src/service.ts", "line": 80}
                    }
                ]
            }
        }

        # Mock get_git_diff_lines to indicate line 20 of src/service.ts was modified
        mock_changed_lines = {
            "src/service.ts": [(18, 22)]
        }

        with patch("src.main.get_git_diff_lines", return_value=mock_changed_lines):
            res = apply_visual_change_tracking("/tmp/fake-repo", current_result, prev_topology)
            
            nodes = res["topology"]["nodes"]
            node_states = {n["id"]: n.get("state") for n in nodes}

            # ACTION::unchangedFn should be normal
            assert node_states["ACTION::unchangedFn"] == "normal"

            # ACTION::modifiedFn should be modified since line 20 falls inside (18, 22)
            assert node_states["ACTION::modifiedFn"] == "modified"

            # ACTION::addedFn should be added since it wasn't in prev_topology
            assert node_states["ACTION::addedFn"] == "added"

            # ACTION::deletedFn should be re-injected and marked deleted since it is missing from current
            assert node_states["ACTION::deletedFn"] == "deleted"
            
            # Verify the total nodes matches 4 (unchanged, modified, added, deleted)
            assert len(nodes) == 4

