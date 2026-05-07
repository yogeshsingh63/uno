FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/ ./packages/shared/
COPY package.json ./
RUN cd apps/server && npm install
COPY apps/server/ ./apps/server/
RUN cd apps/server && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/packages/shared ./packages/shared
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
