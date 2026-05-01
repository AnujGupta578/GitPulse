from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from pydantic import BaseModel
from src.engine.models import IntentObject, StructuralChange, SecurityRisk, C4Level

class AgentState(TypedDict):
    """
    World-class state management for the Council of Agents.
    """
    commit_sha: str
    raw_diff: str
    extracted_structure: List[Dict[str, Any]]
    architect_analysis: List[StructuralChange]
    security_analysis: List[SecurityRisk]
    final_intent: Optional[IntentObject]

def architect_agent(state: AgentState):
    """
    Analyzes structural changes and identifies architectural patterns (C4 Model).
    """
    print("🏛️  Architect Agent analyzing...")
    changes = []
    
    for comp in state["extracted_structure"]:
        # Map AST types to C4 levels
        c4_level = C4Level.CODE
        tags = []
        
        if comp["type"] == "class":
            c4_level = C4Level.COMPONENT
            if "service" in comp["name"].lower():
                tags.append("#service")
            elif "controller" in comp["name"].lower() or "route" in comp["name"].lower():
                tags.append("#api")
                c4_level = C4Level.CONTAINER
            elif "repository" in comp["name"].lower() or "db" in comp["name"].lower():
                tags.append("#db")
        
        elif comp["type"] == "interface":
            c4_level = C4Level.COMPONENT
            tags.append("#contract")

        changes.append(StructuralChange(
            type=comp["type"],
            name=comp["name"],
            parent=comp.get("parent"),
            action="added", # In a real system, this would be derived from git diff
            rationale=f"System evolution detected: {comp['name']} ({comp['type']}) added to the {c4_level} layer.",
            c4_level=c4_level,
            tags=tags,
            metadata={"node_type": comp.get("node_type")}
        ))
        
    return {"architect_analysis": changes}

def security_agent(state: AgentState):
    """
    Scans for security risks and policy violations.
    """
    print("🛡️  Security Agent scanning...")
    risks = []
    # Check raw diff for sensitive patterns
    if "api_key" in state["raw_diff"].lower() or "secret" in state["raw_diff"].lower():
        risks.append(SecurityRisk(
            severity="Critical",
            description="Potential hardcoded credential detected in commit diff.",
            recommendation="Use environment variables or a secure vault for secrets."
        ))
    
    # Check structural changes for risky patterns (e.g., exposing internal DB)
    for change in state["architect_analysis"]:
        if "#db" in change.tags and change.c4_level == C4Level.CONTAINER:
            risks.append(SecurityRisk(
                severity="High",
                description=f"Database layer '{change.name}' potentially exposed at Container level.",
                recommendation="Ensure database access is encapsulated within a Service component."
            ))

    return {"security_analysis": risks}

def synthesis_agent(state: AgentState):
    """
    Aggregates all analysis into a world-class Intent Object.
    """
    print("🧬 Synthesis Agent consolidating intent...")
    
    # Generate high-level rationale
    summary = f"Architectural evolution across {len(state['architect_analysis'])} components."
    if state["security_analysis"]:
        summary += f" WARNING: {len(state['security_analysis'])} security risks identified."

    intent = IntentObject(
        commit_sha=state["commit_sha"],
        rationale=summary,
        changes=state["architect_analysis"],
        security_risks=state["security_analysis"],
        roi_impact="High - Automated synthesis maintains architectural integrity and security posture."
    )
    return {"final_intent": intent}

def create_council_graph():
    """
    Orchestrates the Council of Agents using LangGraph.
    """
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("architect", architect_agent)
    workflow.add_node("security", security_agent)
    workflow.add_node("synthesis", synthesis_agent)
    
    # Define Edges
    workflow.set_entry_point("architect")
    workflow.add_edge("architect", "security")
    workflow.add_edge("security", "synthesis")
    workflow.add_edge("synthesis", END)
    
    return workflow.compile()

if __name__ == "__main__":
    council = create_council_graph()
    initial_state = {
        "commit_sha": "abc123d",
        "raw_diff": "Added a class PaymentService with api_key = 'test'",
        "extracted_structure": [
            {"type": "class", "name": "PaymentService", "node_type": "class_definition"},
            {"type": "class", "name": "UserController", "node_type": "class_definition"}
        ],
        "architect_analysis": [],
        "security_analysis": [],
        "final_intent": None
    }
    result = council.invoke(initial_state)
    print("\n--- Final Intent Synthesis ---")
    print(result["final_intent"].model_dump_json(indent=2))
