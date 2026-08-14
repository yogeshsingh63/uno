FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY apps/server/package*.json ./apps/server/
COPY package.json ./
RUN cd packages/shared && npm install --no-audit --no-fund && npm run build
RUN cd apps/server && npm install --no-audit --no-fund
COPY apps/server/ ./apps/server/
RUN cd apps/server && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/server/package.json ./
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
