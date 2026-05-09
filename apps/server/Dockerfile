FROM node:20-alpine
WORKDIR /app

# Copy root files
COPY package.json yarn.lock* ./
COPY packages/shared/ ./packages/shared/

# Install server dependencies
COPY apps/server/package*.json ./apps/server/
RUN cd apps/server && npm install

# Copy source code
COPY apps/server/ ./apps/server/

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=development

# Run in dev mode using tsx watch
CMD ["sh", "-c", "cd apps/server && npm run dev"]
