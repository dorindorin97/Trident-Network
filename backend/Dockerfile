FROM node:18-alpine
WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application code
COPY . .

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 4000
CMD ["npm", "start"]

