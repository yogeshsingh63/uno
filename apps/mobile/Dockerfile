FROM node:20-alpine
WORKDIR /app

# Copy root files if any and shared package required by tsconfig/metro paths
COPY package.json yarn.lock* ./
COPY packages/shared/ ./packages/shared/

COPY apps/mobile/package*.json ./apps/mobile/
RUN cd apps/mobile && npm install --legacy-peer-deps

COPY apps/mobile/ ./apps/mobile/

EXPOSE 3002

ENV PORT=3002
ENV HOST=0.0.0.0

# Run Expo dev server on port 3002
CMD ["sh", "-c", "cd apps/mobile && npx expo start --web --port 3002"]
