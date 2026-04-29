# Commit-Driven Workflow Orchestrator

A world-class platform that transforms git commits into active architectural intelligence, live documentation, and autonomous validation workflows.

## 🚀 Quick Start

### 0. Configuration
Before running, copy the environment template and add your API keys:
```bash
cp .env.example .env
```
*Note: An **OPENAI_API_KEY** or **ANTHROPIC_API_KEY** is required for the Council of Agents to perform semantic analysis.*

### 1. Backend: AI Orchestration Engine
The backend uses **Python 3.12**, **FastAPI**, and **LangGraph** to coordinate the Council of Agents.

```bash
# Setup & Activate Environment
source venv/bin/activate
pip install .

# Start the Orchestrator API
python3 src/main.py

# Trigger Manual CLI Analysis
npm run analyze
```

### 2. Frontend: World-Class Dashboard
The dashboard is built with **Next.js 15+** and **Vanilla CSS** for a premium visualization experience.

```bash
cd dashboard
npm install
npm run dev
```
### 3. Docker Orchestration (Easiest)
Run the entire world-class platform with a single command:

```bash
docker-compose up --build
```
*   **Dashboard**: [http://localhost:3000](http://localhost:3000)
*   **Orchestrator API**: [http://localhost:8000](http://localhost:8000)

Navigate to [http://localhost:3000](http://localhost:3000) to view the live architectural map.

---

## 🛠 Features

- **Council of Agents**: Multi-agent reasoning (Architect, Security, Logic) for every commit.
- **Visual Diffing**: Real-time Mermaid C4 diagram synthesis with highlighting of new components.
- **Agentic Seeding**: Autonomous generation of instruction sets for walkthrough agents.
- **Local-First Privacy**: AST parsing happens locally using Tree-sitter.

---

## 📖 Documentation

- **[SPEC.md](SPEC.md)**: Project Constitution and Tech Stack.
- **[implementation_plan.md](implementation_plan.md)**: Architectural blueprint.
- **[walkthrough.md](walkthrough.md)**: End-to-end product journey.
- **[task.md](task.md)**: Progress tracking and tickets.

---

**Built with world-class excellence for the next generation of software engineering.**
