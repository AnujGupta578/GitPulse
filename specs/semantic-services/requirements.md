# Requirements: Business Process & Semantic Summarization

## Context
The platform must interpret git diffs, abstract code into business process models, and semantically summarize the changes. This bridges the gap between raw code events and high-level business understanding.

## Epic 3: User Stories
* **US 3.1:** As a Business Analyst, I need to define business processes using a standard model. (P2)
* **US 3.2:** As a Data Scientist, I need an NLP service integrated into an agent for semantic summarization. (P2)
* **US 3.3:** As a Business User, I need a data visualization dashboard. (P3)

## Requirements (Tasks 3.1.1 & 3.2.1)
1. Define a strict TypeScript representation of a business process (e.g., ID, steps, domain, actors).
2. Build an agent that accepts raw text/code, invokes a mockable NLP service, and returns a structured summary.
3. Conform strictly to unit testing boundaries before implementation.
