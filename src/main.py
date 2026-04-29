import os
import sys
from typing import Optional, List
from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

# Internal Imports
from src.engine.parser import IntentParser
from src.agents.council import create_council_graph
from src.engine.synthesis import ArchitectureSynthesizer

app = FastAPI(title="Commit-Driven Workflow Orchestrator")

class AnalysisRequest(BaseModel):
    commit_sha: str
    diff: Optional[str] = None

@app.post("/analyze")
async def analyze_commit(request: AnalysisRequest):
    return perform_analysis(request.commit_sha)

def perform_analysis(commit_sha: str):
    print(f"🚀 Starting World-Class Analysis for: {commit_sha}")
    
    # 1. Parse current codebase state (Simulation: parsing src directory)
    parser = IntentParser()
    all_components = []
    for root, _, files in os.walk("src"):
        for file in files:
            if file.endswith(".py"):
                with open(os.path.join(root, file), "r") as f:
                    tree = parser.parse_content(f.read(), "python")
                    all_components.extend(parser.extract_structure(tree))
    
    # 2. Run Council of Agents
    council = create_council_graph()
    initial_state = {
        "commit_sha": commit_sha,
        "raw_diff": "Extracted from src/ changes.",
        "extracted_structure": all_components,
        "architect_analysis": [],
        "security_analysis": [],
        "final_intent": None
    }
    result = council.invoke(initial_state)
    intent = result["final_intent"]
    
    # 3. Synthesize Visualization & Docs
    synth = ArchitectureSynthesizer()
    mermaid = synth.generate_mermaid(intent)
    synth.update_documentation(mermaid, intent)
    
    return intent

def cli_trigger():
    commit_sha = os.getenv("COMMIT_SHA", "HEAD")
    perform_analysis(commit_sha)
    print(f"✅ Workflow Synthesis Complete for {commit_sha}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        cli_trigger()
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)
