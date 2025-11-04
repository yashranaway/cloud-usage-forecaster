# Multi-stage: build minimal image with Python + Bun server
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y curl ca-certificates --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash \
  && mv /root/.bun /usr/local/bun \
  && ln -s /usr/local/bun/bin/bun /usr/local/bin/bun

# Copy project files
COPY requirements.txt package.json tsconfig.json index.ts /app/
COPY src /app/src
COPY models /app/models
COPY output /app/output

# Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Node deps
RUN bun install --no-progress

EXPOSE 3000

CMD ["bun", "run", "index.ts"]

