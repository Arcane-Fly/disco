FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
# Use `npm install` instead of `npm ci` because this project does not use a
# package-lock.json. `npm ci` requires a lockfile and will fail when one is not
# present. See `packageManager` in package.json which specifies yarn.
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size.
#
# Use `npm install --omit=dev` to install only production dependencies.
RUN npm install --omit=dev && npm cache clean --force

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

# Set ownership for app directory  
RUN chown -R appuser:appuser /app
USER appuser

# Expose the port (Railway will override with $PORT at runtime)
ARG PORT=3000
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]