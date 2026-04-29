FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Tree-sitter and git
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY src/ ./src/
COPY docs/ ./docs/

# Install dependencies
RUN pip install --no-cache-dir .

# Expose FastAPI port
EXPOSE 8000

# Start the orchestrator
CMD ["python", "src/main.py"]
