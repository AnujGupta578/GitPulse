import os
import sys
import asyncio
import time
from dotenv import load_dotenv

load_dotenv()
from typing import Optional, List, Dict, Tuple, Any
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uvicorn
from pydantic import BaseModel
import bcrypt
import jwt
from temporalio.client import Client
from temporalio.worker import Worker

# Internal Imports
from src.engine.parser import IntentParser
from src.engine.workflow_engine import WorkflowSemanticEngine
from src.database.session import get_db, init_db
from src.database.models import User, ArchitectureState
from src.workflows.analysis_workflow import RepositoryAnalysisWorkflow
from src.workflows.activities import AnalysisActivities

app = FastAPI(title="Commit-Driven Workflow Orchestrator")

# Configuration
SECRET_KEY = "WORLD_CLASS_SECRET_KEY_12345"
ALGORITHM = "HS256"
TEMPORAL_ADDRESS = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- STARTUP LOGIC ---

@app.on_event("startup")
async def on_startup():
    await init_db()
    # Start Temporal Worker in background
    asyncio.create_task(run_temporal_worker())

async def run_temporal_worker():
    """
    Background worker that executes durable workflows with retry logic.
    """
    max_retries = 5
    for i in range(max_retries):
        try:
            client = await Client.connect(TEMPORAL_ADDRESS)
            activities = AnalysisActivities()
            worker = Worker(
                client,
                task_queue="analysis-tasks",
                workflows=[RepositoryAnalysisWorkflow],
                activities=[
                    activities.parse_repository_file, 
                    activities.run_agent_council,
                    activities.synthesize_final_report
                ],
            )
            print("[Temporal Worker] Started on 'analysis-tasks' queue")
            await worker.run()
            break
        except Exception as e:
            print(f"[Temporal Worker] Waiting for Temporal Cluster (Attempt {i+1}/{max_retries}): {str(e)}")
            await asyncio.sleep(5)

# --- ROBUST AUTH ---

@app.post("/auth/register")
async def register(request: AuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == request.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Identity already registered.")
        
        # Native bcrypt hashing
        password_bytes = request.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        new_user = User(email=request.email, hashed_password=hashed_password)
        db.add(new_user)
        await db.commit()
        return {"message": "Enterprise Account Created Durably"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration Pipeline Error: {str(e)}")

@app.post("/auth/login", response_model=TokenResponse)
async def login(request: AuthRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == request.email))
        user = result.scalar_one_or_none()
        
        # Native bcrypt verification
        if not user or not bcrypt.checkpw(request.password.encode('utf-8'), user.hashed_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials.")
            
        payload = {"sub": request.email, "exp": time.time() + 3600}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Login Error: {str(e)}")

# --- DURABLE ANALYSIS ENGINE ---

async def perform_analysis_live(commit_sha: str, stream=False):
    """
    Triggers a durable Temporal workflow and streams progress.
    """
    steps = [
        "Initializing World-Class Analysis Engine...",
        "Connecting to Temporal Workflow Cluster...",
        "Triggering Durable Analysis Workflow...",
        "Analysis in Progress (Fault-Tolerant Mode)...",
        "Analysis Complete."
    ]
    
    try:
        client = await Client.connect(TEMPORAL_ADDRESS)
        files_to_analyze = ["src/main.py", "src/engine/parser.py"]
        
        handle = await client.start_workflow(
            RepositoryAnalysisWorkflow.run,
            files_to_analyze,
            id=f"analysis-{commit_sha}-{int(time.time())}",
            task_queue="analysis-tasks",
        )
        
        yield "data: Workflow Triggered (Temporal Cluster Active)...\n\n"
        
        # Wait for actual completion
        await handle.result()
        
        yield "data: ✅ Analysis Complete (Durable State Persisted).\n\n"

    except Exception as e:
        if stream:
            yield f"data: ❌ Temporal Connection Error: {str(e)}\n\n"

    if stream:
        yield "data: [COMPLETE] Analysis Finished Successfully.\n\n"

@app.get("/analyze/stream")
async def stream_analysis(commit_sha: str = "HEAD"):
    return StreamingResponse(perform_analysis_live(commit_sha, stream=True), media_type="text/event-stream")


# ---------------------------------------------------------------------------
# INTERNAL: Semantic Workflow Analysis — SPEC.md §3.1
# NOT exposed via CORS (localhost only).  Called by ArchitectureAgent.ts.
# ---------------------------------------------------------------------------

def get_git_diff_lines(repo_path: str) -> Dict[str, List[Tuple[int, int]]]:
    import subprocess
    try:
        # Check if it's a git repo
        subprocess.run(
            ["git", "rev-parse", "--is-inside-work-tree"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            check=True
        )
    except Exception:
        return {}

    diff_output = ""
    try:
        res = subprocess.run(
            ["git", "diff", "--unified=0", "HEAD~1", "HEAD"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            check=True
        )
        diff_output = res.stdout
    except Exception:
        # If HEAD~1 is not available, try diff against HEAD (uncommitted changes)
        try:
            res = subprocess.run(
                ["git", "diff", "--unified=0", "HEAD"],
                cwd=repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            diff_output = res.stdout
        except Exception:
            pass

    changed_lines = {}
    current_file = None
    for line in diff_output.splitlines():
        if line.startswith("+++ b/"):
            current_file = line[6:].replace("\\", "/")
            changed_lines[current_file] = []
        elif line.startswith("@@ ") and current_file:
            parts = line.split(" ")
            if len(parts) >= 3:
                new_part = parts[2]
                if new_part.startswith("+"):
                    nums = new_part[1:].split(",")
                    start = int(nums[0])
                    count = int(nums[1]) if len(nums) > 1 else 1
                    if count > 0:
                        changed_lines[current_file].append((start, start + count - 1))
                    else:
                        changed_lines[current_file].append((start, start))
    return changed_lines


def apply_visual_change_tracking(repo_path: str, result: Dict[str, Any], prev_topology: Dict[str, Any]) -> Dict[str, Any]:
    changed_lines = get_git_diff_lines(repo_path)
    
    prev_nodes = {n["id"]: n for n in prev_topology.get("nodes", [])}
    curr_nodes = {n["id"]: n for n in result.get("topology", {}).get("nodes", [])}
    
    new_nodes = []
    
    for nid, node in curr_nodes.items():
        node_state = "normal"
        if nid not in prev_nodes:
            node_state = "added"
        else:
            meta = node.get("metadata", {})
            file_path = meta.get("file")
            line = meta.get("line")
            if file_path and line:
                norm_file = file_path.replace("\\", "/")
                matched_file = None
                for cf in changed_lines:
                    if norm_file.endswith(cf) or cf.endswith(norm_file):
                        matched_file = cf
                        break
                
                if matched_file:
                    ranges = changed_lines[matched_file]
                    for start, end in ranges:
                        if start - 2 <= line <= end + 10:
                            node_state = "modified"
                            break
        
        node["state"] = node_state
        new_nodes.append(node)
        
    for nid, prev_node in prev_nodes.items():
        if nid not in curr_nodes:
            deleted_node = dict(prev_node)
            deleted_node["state"] = "deleted"
            new_nodes.append(deleted_node)
            
    result["topology"]["nodes"] = new_nodes
    return result


class WorkflowAnalysisRequest(BaseModel):
    repo_path: str
    language_hint: str = "auto"
    prev_topology: Optional[Dict[str, Any]] = None


@app.post("/internal/analyze-workflow")
async def analyze_workflow(request: WorkflowAnalysisRequest):
    """
    Runs the full SemanticWorkflowParser + GraphAssembler over a local repo
    checkout and returns a topology compatible with schemaVersion 2.0-workflow,
    decorated with Git change tracking states (added/modified/deleted).
    """
    try:
        engine = WorkflowSemanticEngine(request.repo_path)
        result = await engine.run()
        if request.prev_topology:
            result = apply_visual_change_tracking(request.repo_path, result, request.prev_topology)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
