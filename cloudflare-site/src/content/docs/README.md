# プログラミング学習カリキュラム

このリポジトリは、プログラミング未経験から半年でフルスタックのSNSアプリケーションを開発・デプロイできるようになるための学習カリキュラムです。入門編（環境構築〜TypeScript）とマスターコース（Git/React/NestJS/Prisma/Docker/テスト/CI/CD/AWS/リアルタイム通信/AI開発）に加え、最終プロジェクトとしてマルチスタックSNS（NestJS / Spring Boot / FastAPI / Laravel / Gin / Rails）とTodoアプリ（NestJS / Spring Boot）を扱います。

サイトはAstroでビルドし、Cloudflare Pagesで配信しています。

## ローカルでプレビューする方法

`cloudflare-site/` ディレクトリで実行します。

### 初回セットアップ

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

Astroの開発サーバーが起動します。表示されたURL（既定では http://localhost:4321 ）にアクセスしてください。

### ビルドと本番相当のプレビュー

```bash
npm run build
npx wrangler pages dev dist
```

ビルド成果物を http://localhost:8787 でCloudflare Pages相当の環境として確認できます。

## ファイル構成

- `astro.config.mjs` - Astro設定
- `src/content/docs/` - 教材のMarkdown本体
- `src/pages/` `src/styles/` - サイトのページとスタイル

### 入門編

- `environment/` - 環境構築ガイド（VS Code、ターミナル、Node.js）
- `frontend/` - HTML/CSS/JavaScript基礎と練習問題
- `typescript/` - TypeScript基礎と練習問題
- `final_project.md` - 入門編最終問題
- `practice/` - 練習問題の回答コード

### マスターコース（中級編）

- `git/` `react/` `backend/` `docker/` `database/` - 開発スキルの基礎
- `fullstack-todo/` - 実践: フルスタックTodoアプリ（NestJS / Spring Boot）
- `tooling/` `testing/` `cicd/` `aws/` `realtime/` - 品質・インフラ・運用
- `ai/` `ai-chat/` - AI開発入門とRAGチャット開発
- `sns/` - SNS開発（最終プロジェクト。NestJS / Spring Boot / FastAPI / Laravel / Gin / Rails）

### その他

- `.authoring/` - 教材執筆規約とTOC（サイトには公開されない）
