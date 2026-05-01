FROM python:3.12-slim

WORKDIR /app

# Set PYTHONPATH to ensure 'src' is discoverable as a module
ENV PYTHONPATH=/app

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
# Upgrade pip and install dependencies with increased timeout/retries
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --default-timeout=100 --retries 5 .

# Expose FastAPI port
EXPOSE 8000

# Start the orchestrator
CMD ["python", "src/main.py"]
