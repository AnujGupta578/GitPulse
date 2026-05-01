import json
import os
from typing import List, Dict, Any, Set
from src.engine.models import IntentObject, StructuralChange, C4Level

class ArchitectureSynthesizer:
    """
    World-class synthesis engine for generating Mermaid C4 diagrams
    and visual architectural diffs.
    """
    
    def __init__(self, state_path: str = "docs/architecture_state.json"):
        self.state_path = state_path
        self.previous_state = self._load_state()

    def _load_state(self) -> Dict[str, Any]:
        if os.path.exists(self.state_path):
            try:
                with open(self.state_path, "r") as f:
                    data = json.load(f)
                    # Migration: Convert list of components to dict {name: data}
                    if isinstance(data.get("components"), list):
                        comp_dict = {c["name"]: c for c in data["components"]}
                        return {"components": comp_dict}
                    return data
            except Exception:
                return {"components": {}}
        return {"components": {}}

    def _save_state(self, components: Dict[str, Dict[str, Any]]):
        os.makedirs(os.path.dirname(self.state_path), exist_ok=True)
        with open(self.state_path, "w") as f:
            json.dump({"components": components}, f, indent=2)

    def generate_mermaid(self, intent: IntentObject) -> str:
        """
        Synthesizes Mermaid C4 syntax with visual diffing and semantic grouping.
        """
        lines = ["C4Context", "    title Architecture Overview"]
        
        # Current components from intent
        current_components = {c.name: c.model_dump() for c in intent.changes}
        prev_components = self.previous_state.get("components", {})
        
        # Merge previous state for persistent components not in this commit
        all_components = {**prev_components, **current_components}
        
        # Group components by parent
        parents = [name for name, data in all_components.items() if data.get("parent") is None]
        
        for p_name in parents:
            p_data = all_components[p_name]
            p_type = p_data.get("type", "Component")
            c4_level = p_data.get("c4_level", C4Level.CODE)
            
            # Determine Color based on Diff status
            status = "persistent"
            if p_name in current_components:
                # In this commit
                status = "added" if p_name not in prev_components else "modified"
            
            # Choose Mermaid element based on C4 Level
            element_type = "System"
            if c4_level == C4Level.CONTAINER:
                element_type = "Container"
            elif c4_level == C4Level.COMPONENT:
                element_type = "Component"

            # Add Boundary if it has children
            p_children = [name for name, data in all_components.items() if data.get("parent") == p_name]
            
            if p_children:
                lines.append(f'    Boundary(b_{p_name}, "{p_name}", "{p_type}") {{')
                lines.append(f'        {element_type}({p_name}, "{p_name}", "{p_type}")')
                for c_name in p_children:
                    c_data = all_components[c_name]
                    c_status = "persistent"
                    if c_name in current_components:
                         c_status = "added" if c_name not in prev_components else "modified"
                    
                    c_type = c_data.get("type", "Code")
                    lines.append(f'        System({c_name}, "{c_name}", "{c_type}")')
                    self._apply_style(lines, c_name, c_status)
                
                lines.append("    }")
            else:
                lines.append(f'    {element_type}({p_name}, "{p_name}", "{p_type}")')

            self._apply_style(lines, p_name, status)

        # Update state with all active components
        self._save_state(all_components)
        
        return "\n".join(lines)

    def _apply_style(self, lines: List[str], name: str, status: str):
        """
        Applies visual diff styling based on component status.
        """
        colors = {
            "added": ("#d4edda", "#28a745"),    # Green
            "modified": ("#fff3cd", "#ffc107"), # Yellow
            "persistent": ("#e7f3ff", "#007bff") # Neutral Blue
        }
        bg, border = colors.get(status, colors["persistent"])
        lines.append(f'    UpdateElementStyle({name}, $bgColor="{bg}", $borderColor="{border}")')

    def update_documentation(self, mermaid_code: str, intent: IntentObject):
        """
        Updates the docs/architecture.md file with rich markdown and visual legend.
        """
        doc_path = "docs/architecture.md"
        os.makedirs(os.path.dirname(doc_path), exist_ok=True)
        
        content = f"""# System Architecture (Automated)
        
> [!NOTE]
> This document is automatically generated from commit intent. **Zero manual updates required.**

### **Visual Legend**
- <span style="color:#28a745">■</span> **Added**: New architectural component in this commit.
- <span style="color:#ffc107">■</span> **Modified**: Existing component with logic/structural changes.
- <span style="color:#007bff">■</span> **Persistent**: Unchanged component from previous baseline.

---

## Visual Overview

```mermaid
{mermaid_code}
```

## Semantic Changelog

> **Commit**: `{intent.commit_sha}`
> **Rationale**: {intent.rationale}

### Changes in this Commit
"""
        # Group changelog by C4 level for better readability
        for level in C4Level:
            level_changes = [c for c in intent.changes if c.c4_level == level]
            if level_changes:
                content += f"\n#### {level} Layer\n"
                for change in level_changes:
                    tag_str = " ".join([f"`{t}`" for t in change.tags])
                    content += f"- **{change.name}** ({change.type}) {tag_str}: {change.rationale}\n"

        if intent.security_risks:
            content += "\n## 🛡️ Security Insights\n"
            for risk in intent.security_risks:
                content += f"- **[{risk.severity}]**: {risk.description}  \n  *Recommendation*: {risk.recommendation}\n"

        with open(doc_path, "w") as f:
            f.write(content)
        
        print(f"✅ Documentation updated: {doc_path}")

if __name__ == "__main__":
    from src.engine.models import StructuralChange, SecurityRisk, C4Level, IntentObject
    
    # Mock transition test
    synth = ArchitectureSynthesizer()
    
    test_intent = IntentObject(
        commit_sha="feat-payment-engine",
        rationale="Implementing a robust Payment Engine with C4 mapping.",
        changes=[
            StructuralChange(
                type="class", 
                name="PaymentEngine", 
                action="added", 
                c4_level=C4Level.COMPONENT,
                tags=["#service"],
                rationale="New core service for transaction orchestration."
            ),
            StructuralChange(
                type="class", 
                name="StripeAdapter", 
                parent="PaymentEngine",
                action="added", 
                c4_level=C4Level.CODE,
                rationale="Third-party payment gateway integration."
            )
        ],
        security_risks=[
            SecurityRisk(severity="High", description="Hardcoded test key in StripeAdapter", recommendation="Use env variables.")
        ]
    )
    
    mermaid = synth.generate_mermaid(test_intent)
    synth.update_documentation(mermaid, test_intent)
