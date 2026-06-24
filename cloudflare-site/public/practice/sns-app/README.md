# SNSアプリ（回答コード）

カリキュラム「[SNS開発（最終プロジェクト）](/sns/)」の回答コードです。
React（Vite）+ NestJS + Prisma + PostgreSQL（+ Socket.IO / AWS SDK）で、認証つきのSNS（投稿・いいね・フォロー・DMチャット・プロフィール編集・画像アップロード）を実装しています。

対応する章:

- [プロジェクトセットアップ](/sns/project_setup/) — `compose.yaml` / `backend/` / `frontend/` の骨格、ValidationPipe・CORS・PrismaModule・`GET /health`
- [ユーザー登録とログイン（JWT認証）](/sns/auth/) — `backend/src/auth/`、`frontend/src/lib/apiClient.ts`、`useHashRoute`
- [メールアドレス確認（SES）](/sns/email_verification/) — `backend/src/mail/`、`EmailVerificationToken`、`#/verify-email`
- [投稿機能とタイムライン](/sns/posts/) — `backend/src/posts/`、`TimelinePage` / `PostCard` / `Layout`
- [いいね機能](/sns/likes/) — `backend/src/likes/`（P2002→409 / P2025→404）
- [フォローとフォロー中タイムライン](/sns/follow/) — `backend/src/users/`、`GET /posts/timeline`、`UserPage`
- [DMチャット（リアルタイム）](/sns/chat/) — `backend/src/chat/`（REST + ChatGateway）、`ChatPage`
- [プロフィール編集と画像アップロード](/sns/profile_and_images/) — `PATCH /users/me`、presigned URL発行、`SettingsPage`
- [SNSのテストを書く](/sns/testing/) — `posts.service.spec.ts`（単体）、`test/follow.e2e-spec.ts`（E2E）
- [AWSへの全体デプロイ](/sns/deploy/) — `backend/Dockerfile`、`infra/`（CDK）、`.github/workflows/`

## 構成

```
sns-app/
├── compose.yaml          # 開発用PostgreSQL 16（Docker）
├── backend/              # NestJS 10 + Prisma 5（localhost:3000）
├── frontend/             # Vite 5 + React 18 + TypeScript（localhost:5173）
├── infra/                # AWS CDK（SnsAppStack。デプロイ用、ローカルでは synth まで確認済み）
└── .github/workflows/    # ci.yml（lint + test + E2E）/ deploy.yml（AWSへの自動デプロイ）
```

## 起動手順

```bash
# ① データベースを起動（このディレクトリで）
docker compose up -d

# ② バックエンド（別ターミナル）
cd backend
pnpm install
cp .env.example .env        # 初回のみ
pnpm exec prisma migrate dev
pnpm run start:dev

# ③ フロントエンド（さらに別ターミナル）
cd frontend
pnpm install
cp .env.example .env        # 初回のみ
pnpm run dev
```

ブラウザで http://localhost:5173/ を開くと、登録 → メール確認 → ログイン → 投稿/いいね/フォロー/チャット/設定 が一通り使えます。

### メール確認の開発時の挙動

`MAIL_TRANSPORT="console"`（デフォルト）の間は実際にメールは送られず、**バックエンドのコンソールログに確認URLが出力**されます。登録後、ログに表示された `http://localhost:5173/#/verify-email?token=...` をブラウザで開くと確認が完了し、ログインできるようになります。

## テストの実行

```bash
cd backend

# 単体テスト（DB不要）
pnpm run test

# E2Eテスト（テスト用DB sns_test を使用。初回のみDB作成とマイグレーションが必要）
docker compose exec db psql -U postgres -c 'CREATE DATABASE sns_test;'   # リポジトリのルートで
cp .env.test.example .env.test                                           # 初回のみ
pnpm exec dotenv -e .env.test -- prisma migrate deploy
pnpm run test:e2e
```

## AWS依存部分の注意（SES / S3 / デプロイ）

このリポジトリのコードはカリキュラム通りに実装していますが、**ローカルでは実際のAWS呼び出しは検証していません**。

- **SES（確認メールの実送信）** — `MAIL_TRANSPORT="ses"` に切り替えると `@aws-sdk/client-ses` で実送信しますが、送信元アドレスの検証などSES側の設定（[SESの章](/aws/ses/)）が必要です。ローカル検証は `console` 輸送のみ実施しています。
- **S3（アバター画像アップロード）** — `POST /users/me/avatar-upload-url` のpresigned URL生成はAWS認証情報があれば動作します（署名計算はローカルで完結するため、ダミー認証情報でURL生成までは確認済み）。**実際のS3へのPUT・公開配信は、`profile_and_images` の章の手順でバケット（バケットポリシー + CORS）を作成し、`backend/.env` の `AVATAR_BUCKET` を自分のバケット名に変更した上で確認してください**。AWS認証情報が未設定の環境では、このエンドポイントだけ500になります（他の機能には影響しません）。
- **デプロイ（`infra/` と `deploy.yml`）** — CDKスタックは `pnpm exec cdk synth` が通ることまで確認済みで、**実際のデプロイ（`cdk deploy`）は行っていません**。デプロイ手順・料金の注意は [deployの章](/sns/deploy/) を参照してください（RDS / ALB / NAT Gateway は時間課金です。練習後は必ず `cdk destroy`）。

## 補足

- `backend/.env` / `backend/.env.test` / `frontend/.env` はGit管理外です。それぞれ `.env.example` / `.env.test.example` をコピーして作成してください
- Prismaは教材の記述に合わせて **5系**（`prisma@5` / `@prisma/client@5`）に固定しています
- pnpm 10 を使う場合、`bcrypt` のネイティブビルドを許可するため `backend/package.json` に `pnpm.onlyBuiltDependencies` を設定しています（pnpm 9 以前では不要ですが、あっても害はありません）
- `backend/Dockerfile` は教材のものに2点だけ手を加えています。(1) `corepack prepare pnpm@10.33.2 --activate` でpnpmのバージョンを固定（最新のpnpm 11はNode 20非対応のため）、(2) `backend/.dockerignore` を追加（ローカルの `node_modules` が `COPY . .` でイメージに混入してネイティブモジュールが壊れるのを防ぐため）。ローカルで `docker build` → `docker run` → `/health` 応答まで確認済みです
