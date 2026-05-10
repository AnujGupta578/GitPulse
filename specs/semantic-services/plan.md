# Blueprint: Business Process & Semantic Summarization

## Architecture
- Use C4 Model terminology where applicable (System, Container, Component).
- Isolate the NLP summarization logic inside a dedicated `SemanticSummarizationAgent` inheriting from `BaseAgent`.

## File-Level Implementation Plan (Epic 3)
1. `src/core/semantic/BusinessProcess.ts`: TypeScript interfaces defining `IBusinessProcess`, `IProcessStep`, and `ISemanticSummary`.
2. `src/core/semantic/SemanticSummarizationAgent.test.ts`: Unit test for the agent, mocking the NLP inference to verify state transitions and output structure.
3. `src/core/semantic/SemanticSummarizationAgent.ts`: The agent logic handling `SUMMARIZE_PROCESS` message types and invoking the NLP abstraction.

## Fault Tolerance & Boundaries
- The summarizer agent must catch any NLP generation errors and safely report them via the `ERROR` state.
- Strictly type the agent context and payload to avoid runtime mismatch.
