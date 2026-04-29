from pydantic import BaseModel, Field
from typing import List, Optional

class StructuralChange(BaseModel):
    type: str = Field(..., description="The type of component (class, function, etc.)")
    name: str = Field(..., description="The name of the component")
    parent: Optional[str] = Field(None, description="The name of the parent component")
    action: str = Field(..., description="The action performed (added, modified, deleted)")
    rationale: Optional[str] = Field(None, description="The architectural reasoning behind this change")

class SecurityRisk(BaseModel):
    severity: str = Field(..., description="Severity level (Low, Medium, High, Critical)")
    description: str = Field(..., description="Description of the risk")
    recommendation: str = Field(..., description="How to fix the risk")

class IntentObject(BaseModel):
    commit_sha: str
    rationale: str = Field(..., description="High-level summary of the commit intent")
    changes: List[StructuralChange]
    security_risks: List[SecurityRisk] = []
    roi_impact: Optional[str] = Field(None, description="Estimated business impact or ROI")
