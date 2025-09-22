FROM node:18-alpine AS base
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --filter @wg-split/api... --frozen-lockfile=false
COPY apps/api ./apps/api
RUN pnpm --filter @wg-split/api build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api/dist ./dist
COPY apps/api/package.json ./package.json
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
