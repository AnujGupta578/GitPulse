import json
import os
from typing import List, Dict, Any
from src.engine.models import IntentObject, StructuralChange

class ArchitectureSynthesizer:
    """
    World-class synthesis engine for generating Mermaid C4 diagrams
    and visual architectural diffs.
    """
    
    def __init__(self, state_path: str = "docs/architecture_state.json"):
        self.state_path = state_path
        self.current_state = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        if os.path.exists(self.state_path):
            with open(self.state_path, "r") as f:
                return json.load(f)
        return {"components": []}

    def _save_state(self, state: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.state_path), exist_ok=True)
        with open(self.state_path, "w") as f:
            json.dump(state, f, indent=2)

    def generate_mermaid(self, intent: IntentObject) -> str:
        """
        Synthesizes Mermaid C4 syntax with visual diffing and semantic grouping.
        """
        lines = ["C4Context", "    title Architecture Overview"]
        
        # Track components for the state
        new_components = []
        
        # Group components by parent
        parents = [c for c in intent.changes if c.parent is None]
        children = [c for c in intent.changes if c.parent is not None]
        
        for parent in parents:
            lines.append(f'    Boundary(b_{parent.name}, "{parent.name}", "{parent.type}") {{')
            lines.append(f'        System({parent.name}, "{parent.name}", "{parent.type}")')
            
            # Add children inside the boundary
            for child in [c for c in children if c.parent == parent.name]:
                lines.append(f'        System({child.name}, "{child.name}", "{child.type}")')
            
            lines.append("    }")
            
            # Styling
            lines.append(f"    UpdateElementStyle({parent.name}, $bgColor=\"#d4edda\", $borderColor=\"#28a745\")")
            new_components.append(parent.model_dump())

        # Update state
        self._save_state({"components": new_components})
        
        return "\n".join(lines)

    def update_documentation(self, mermaid_code: str, intent: IntentObject):
        """
        Updates the docs/architecture.md file with rich markdown.
        """
        doc_path = "docs/architecture.md"
        os.makedirs(os.path.dirname(doc_path), exist_ok=True)
        
        content = f"""# System Architecture (Automated)

> **Last Updated**: {intent.commit_sha}
> **Rationale**: {intent.rationale}

## Visual Overview

```mermaid
{mermaid_code}
```

## Semantic Changelog

### Changes in this Commit
"""
        for change in intent.changes:
            content += f"- **{change.name}** ({change.type}): {change.rationale}\n"

        if intent.security_risks:
            content += "\n## Security Insights\n"
            for risk in intent.security_risks:
                content += f"- **[{risk.severity}]**: {risk.description} (Recommendation: {risk.recommendation})\n"

        with open(doc_path, "w") as f:
            f.write(content)
        
        print(f"✅ Documentation updated: {doc_path}")

if __name__ == "__main__":
    # Test Synthesis
    from src.engine.models import StructuralChange, SecurityRisk
    
    test_intent = IntentObject(
        commit_sha="abc123d",
        rationale="Implemented PaymentService and optimized checkout flow.",
        changes=[
            StructuralChange(type="class", name="PaymentService", action="added", rationale="Core service for processing payments.")
        ],
        security_risks=[
            SecurityRisk(severity="Low", description="Implicit trust of payment token.", recommendation="Verify token signature.")
        ]
    )
    
    synth = ArchitectureSynthesizer()
    mermaid = synth.generate_mermaid(test_intent)
    synth.update_documentation(mermaid, test_intent)
