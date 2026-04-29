from typing import Annotated, TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from pydantic import BaseModel
from src.engine.models import IntentObject, StructuralChange, SecurityRisk

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
    Analyzes structural changes and identifies architectural patterns.
    """
    print("🏛️  Architect Agent analyzing...")
    # Simulation: Map extracted structure to StructuralChange objects
    changes = []
    for comp in state["extracted_structure"]:
        changes.append(StructuralChange(
            type=comp["type"],
            name=comp["name"],
            parent=comp.get("parent"),
            action="added", # Mock action
            rationale=f"New {comp['type']} implementation detected."
        ))
    return {"architect_analysis": changes}

def security_agent(state: AgentState):
    """
    Scans for security risks and policy violations.
    """
    print("🛡️  Security Agent scanning...")
    # Simulation: Check for hardcoded secrets or risky patterns
    risks = []
    if "api_key" in state["raw_diff"].lower():
        risks.append(SecurityRisk(
            severity="Critical",
            description="Potential hardcoded API key detected in diff.",
            recommendation="Move credentials to environment variables or a secret manager."
        ))
    return {"security_analysis": risks}

def synthesis_agent(state: AgentState):
    """
    Aggregates all analysis into a world-class Intent Object.
    """
    print("🧬 Synthesis Agent consolidating intent...")
    intent = IntentObject(
        commit_sha=state["commit_sha"],
        rationale="Automated synthesis of system evolution based on commit intent.",
        changes=state["architect_analysis"],
        security_risks=state["security_analysis"],
        roi_impact="High - Automated documentation ensures architectural integrity."
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
        "extracted_structure": [{"type": "class_definition", "name": "PaymentService"}],
        "architect_analysis": [],
        "security_analysis": [],
        "final_intent": None
    }
    result = council.invoke(initial_state)
    print("\n--- Final Intent Synthesis ---")
    print(result["final_intent"].model_dump_json(indent=2))
