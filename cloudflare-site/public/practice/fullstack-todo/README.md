# フルスタックTodoアプリ（回答コード）

カリキュラム「[実践: フルスタックTodoアプリ](/fullstack-todo/)」の回答コードです。
React（Vite）+ NestJS + Prisma + PostgreSQL の3層構成で、TodoのCRUD（一覧・1件取得・作成・部分更新・削除）を実装しています。

- [プロジェクトのセットアップ](/fullstack-todo/nestjs/setup/) — `compose.yaml` / `backend/` / `frontend/` の構成、Prisma初期化
- [バックエンド: Todo APIの実装](/fullstack-todo/nestjs/backend/) — `backend/src/` のCRUD API
- [フロントエンド: 画面の実装](/fullstack-todo/nestjs/frontend/) — `frontend/src/` の画面
- [つなぎ込み: CORSとエラーハンドリング](/fullstack-todo/nestjs/integration/) — `backend/src/main.ts` の `enableCors`

## 構成

```
fullstack-todo/
├── compose.yaml      # PostgreSQL 16（Docker）
├── backend/          # NestJS + Prisma（localhost:3000）
└── frontend/         # React + Vite（localhost:5173）
```

## 起動手順

```bash
# ① データベースを起動（このディレクトリで）
docker compose up -d

# ② バックエンド（別ターミナル）
cd backend
pnpm install
# 初回のみ: .env を作成して DATABASE_URL を設定し、マイグレーションを実行
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todoapp?schema=public"
pnpm exec prisma migrate dev
pnpm run dev

# ③ フロントエンド（さらに別ターミナル）
cd frontend
pnpm install
pnpm run dev
```

ブラウザで http://localhost:5173/ を開くと、Todoの一覧・追加・完了切替・削除ができます。

## 補足

- `backend/.env` はGit管理外です。上記の `DATABASE_URL` 1行を自分で作成してください
- Prismaは教材の記述に合わせて **5系**（`prisma@5` / `@prisma/client@5`）に固定しています。6系以降では `prisma init` の生成物（`prisma.config.ts`、generator）が教材と異なる場合があります
