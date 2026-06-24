# ---- ステージ1: 依存関係のインストール ----
FROM node:20-slim AS deps
RUN corepack enable pnpm && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- ステージ2: ビルド ----
FROM node:20-slim AS build
RUN corepack enable pnpm && corepack prepare pnpm@10.33.2 --activate
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ---- ステージ3: 実行 ----
FROM node:20-slim AS runner
RUN corepack enable pnpm && corepack prepare pnpm@10.33.2 --activate
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./
EXPOSE 3000
CMD ["sh", "./docker-entrypoint.sh"]
