FROM node:20-slim

# Install OpenSSL for Prisma Query Engine compatibility
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 8000

# Start the TS orchestrator server
CMD ["sh", "-c", "npx prisma db push && npx tsx src/server.ts"]
