import os
from datetime import timedelta
from temporalio import activity
from src.engine.parser import IntentParser
from src.engine.synthesis import ArchitectureSynthesizer
from src.agents.council import create_council_graph
from src.engine.models import IntentObject

class AnalysisActivities:
    @activity.defn
    async def parse_repository_file(self, file_path: str) -> dict:
        """
        Activity: Robustly parses a single file and extracts intent using Tree-sitter.
        """
        parser = IntentParser()
        try:
            if not os.path.exists(file_path):
                return {"file": file_path, "components": []}
                
            with open(file_path, "r") as f:
                content = f.read()
                # Determine language from extension
                lang = "python" if file_path.endswith(".py") else "typescript"
                tree = parser.parse_content(content, lang)
                structure = parser.extract_structure(tree, lang)
                return {"file": file_path, "components": structure}
        except Exception as e:
            raise Exception(f"Failed to parse {file_path}: {str(e)}")

    @activity.defn
    async def run_agent_council(self, extracted_data: list, commit_sha: str) -> dict:
        """
        Activity: Orchestrates the Council of Agents to synthesize intent.
        """
        council = create_council_graph()
        
        # Flatten components from all files
        all_components = []
        for item in extracted_data:
            all_components.extend(item["components"])
            
        initial_state = {
            "commit_sha": commit_sha,
            "raw_diff": "Multiple file analysis triggered.",
            "extracted_structure": all_components,
            "architect_analysis": [],
            "security_analysis": [],
            "final_intent": None
        }
        
        result = await council.ainvoke(initial_state)
        # Return the IntentObject as a dict for Temporal serialization
        return result["final_intent"].model_dump()

    @activity.defn
    async def synthesize_final_report(self, intent_dict: dict) -> str:
        """
        Activity: Consolidates all findings into a Mermaid C4 report and updates docs.
        """
        intent = IntentObject(**intent_dict)
        synth = ArchitectureSynthesizer()
        mermaid = synth.generate_mermaid(intent)
        synth.update_documentation(mermaid, intent)
        return f"Successfully updated architecture documentation for commit {intent.commit_sha}."
