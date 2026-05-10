# Blueprint: Durable Workflow Integration

## Architecture
- Use Temporal as the underlying durable workflow engine.
- Create a `WorkflowWrapper` or `ActivityWrapper` in TypeScript that encapsulates `BaseAgent` executions.

## File-Level Implementation Plan (Epic 2)
1. `src/core/workflow/DurableExecution.ts`: An abstract execution wrapper that provides retry mechanisms and exponential backoff, mimicking Temporal's behavior (or wrapping it directly).
2. `src/core/workflow/DurableExecution.test.ts`: Unit tests to verify retry logic without actual Temporal server dependencies.
3. `src/core/workflow/CircuitBreaker.ts`: Circuit breaker pattern implementation for external service calls.
4. `src/core/workflow/CircuitBreaker.test.ts`: Unit tests for the circuit breaker state machine.

## Dependencies & Boundaries
- **ASK FIRST BOUNDARY:** Integrating `@temporalio/client` and `@temporalio/worker` requires adding third-party dependencies.
- Before installing, we will build the abstract retry and circuit breaker logic (Task 2.2.1 and Task 2.3.1) in native TypeScript to strictly adhere to "Write unit tests first" without blocking progress.
