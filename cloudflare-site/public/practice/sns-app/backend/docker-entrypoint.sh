#!/bin/sh
set -e

# DATABASE_URL が未設定なら、個別の環境変数から組み立てる（本番用）
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
fi

pnpm exec prisma migrate deploy
exec node dist/main.js
