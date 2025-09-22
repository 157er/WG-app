FROM node:18-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --filter @wg-split/web... --frozen-lockfile=false
COPY apps/web ./apps/web
RUN pnpm --filter @wg-split/web build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm@8.15.4
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/apps/web/dist ./dist
COPY apps/web/package.json ./package.json
ENV PORT=4173
EXPOSE 4173
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "4173"]
