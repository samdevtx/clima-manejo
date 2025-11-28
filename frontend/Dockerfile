FROM node:20-bookworm-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Install runtime dependencies and apply security upgrades
RUN apt-get update && apt-get -y upgrade && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user (Debian)
RUN groupadd -g 1001 nodejs
RUN useradd -m -u 1001 -g nodejs nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
