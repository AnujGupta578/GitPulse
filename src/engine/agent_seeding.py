from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from src.engine.models import IntentObject

class BrowserAction(BaseModel):
    action: str # click, type, navigate, wait
    target: str # selector or text
    value: Optional[str] = None
    rationale: str

class WalkthroughSeed(BaseModel):
    title: str
    steps: List[BrowserAction]
    expected_outcome: str

class WalkthroughSeeder:
    """
    World-class engine that transforms architectural intent into 
    autonomous agent instructions.
    """
    
    def generate_seed(self, intent: IntentObject) -> WalkthroughSeed:
        """
        Heuristic-based generation of walkthrough steps based on the commit intent.
        """
        steps = []
        
        # Example logic: If a "PaymentService" was added, generate a payment walkthrough
        if any("payment" in c.name.lower() for c in intent.changes):
            steps = [
                BrowserAction(
                    action="navigate", 
                    target="/checkout", 
                    rationale="Navigating to the checkout page to verify payment integration."
                ),
                BrowserAction(
                    action="click", 
                    target="button#pay-now", 
                    rationale="Triggering the payment process."
                ),
                BrowserAction(
                    action="wait", 
                    target=".success-message", 
                    rationale="Waiting for payment confirmation."
                )
            ]
            title = "Validate Payment Flow"
            expected_outcome = "Success message is displayed after payment trigger."
        else:
            steps = [
                BrowserAction(
                    action="navigate", 
                    target="/", 
                    rationale="Basic sanity check of the application root."
                )
            ]
            title = "General Sanity Walkthrough"
            expected_outcome = "Application loads without errors."

        return WalkthroughSeed(
            title=title,
            steps=steps,
            expected_outcome=expected_outcome
        )

if __name__ == "__main__":
    from src.engine.models import StructuralChange
    
    test_intent = IntentObject(
        commit_sha="abc123d",
        rationale="Implemented PaymentService.",
        changes=[
            StructuralChange(type="class", name="PaymentService", action="added", rationale="Core payment logic.")
        ]
    )
    
    seeder = WalkthroughSeeder()
    seed = seeder.generate_seed(test_intent)
    print(f"🚀 Generated Walkthrough Seed: {seed.title}")
    for i, step in enumerate(seed.steps):
        print(f"  {i+1}. {step.action.upper()} on '{step.target}' -> {step.rationale}")
