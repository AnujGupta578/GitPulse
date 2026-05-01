from datetime import timedelta
from temporalio import workflow
from typing import List

# Import activities (only types for workflow)
with workflow.unsafe.imports_passed_through():
    from src.workflows.activities import AnalysisActivities

@workflow.defn
class RepositoryAnalysisWorkflow:
    @workflow.run
    async def run(self, files: List[str]) -> str:
        """
        Durable workflow that orchestrates the multi-phase analysis of a repository.
        """
        commit_sha = "HEAD" # In production, this would be passed as an argument
        
        # Phase 1: Parallel Parsing
        results = []
        for file in files:
            result = await workflow.execute_activity(
                AnalysisActivities.parse_repository_file,
                file,
                start_to_close_timeout=timedelta(seconds=60)
            )
            results.append(result)
            
        # Phase 2: Agentic Synthesis (Council of Agents)
        intent_dict = await workflow.execute_activity(
            AnalysisActivities.run_agent_council,
            [results, commit_sha], # Arguments passed as a list for activity
            start_to_close_timeout=timedelta(seconds=120)
        )
        
        # Phase 3: Visual Synthesis & Documentation update
        report = await workflow.execute_activity(
            AnalysisActivities.synthesize_final_report,
            intent_dict,
            start_to_close_timeout=timedelta(seconds=60)
        )
        
        return report
