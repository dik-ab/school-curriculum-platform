---
title: "NestJS版: プロジェクトセットアップ"
parent: SNS開発（最終プロジェクト）
nav_order: 30
---

# プロジェクトセットアップ

[セクションの入口](/sns/)で全体像を確認しました。このページからいよいよ手を動かします。作るのは、以降のすべてのページの土台となる「プロジェクトの骨格」です。具体的には、Gitリポジトリの作成、開発用PostgreSQLの起動、NestJSバックエンドの雛形（ValidationPipe・CORS・Prisma・ヘルスチェックAPIつき）、Vite + Reactフロントエンドの雛形までを作ります。

このページに新しい概念は1つも登場しません。[Git/GitHub基礎](/git/)、[Docker基礎](/docker/)、[バックエンド基礎（NestJS）](/backend/)、[データベースとPrisma](/database/)、[React基礎](/react/)でやったことを、1つのプロジェクトとして組み立て直す回です。手順の意味を思い出せない箇所があれば、その場で該当章に戻って確認してください。

## 学習目標

- モノレポ構成の `sns-app` リポジトリを作成し、GitHubにpushできる
- Docker Composeで開発用PostgreSQL 16を起動し、psqlで接続を確認できる
- NestJSの雛形にValidationPipe・CORS・PrismaService/PrismaModuleを組み込める
- ヘルスチェックAPI（`GET /health`）を実装し、curlで動作確認できる
- Vite + React + TypeScriptの雛形を作成し、環境変数（`VITE_API_URL`）を設定できる

## リポジトリの作成

### モノレポ構成にする理由

このプロジェクトでは、フロントエンド・バックエンド・インフラのコードを `sns-app` という**1つのリポジトリ**にまとめます。複数の構成要素を単一リポジトリで管理する方式を**モノレポ（monorepo、モノレポ）**と呼びます。最終的なディレクトリ構成は次の形です。

```
sns-app/
├── compose.yaml          # 開発用DB（PostgreSQL 16）の定義（このページで作成）
├── backend/              # NestJS 10 + Prisma 5（このページで作成）
├── frontend/             # Vite 5 + React 18 + TypeScript（このページで作成）
├── infra/                # AWS CDK（deploy のページで作成）
└── .github/workflows/    # CI/CD（ci.yml はCI/CDの章で作成済みのものを流用、デプロイ用は deploy のページで作成）
```

CIのワークフロー（`ci.yml`）は、[CIパイプラインを作る](/cicd/ci_pipeline/)の手順で作成済みのものをこのリポジトリでもそのまま使います（まだ作っていない場合は、同ページの手順でいつでも追加できます）。デプロイ用のワークフローは[AWSへの全体デプロイ](/sns/deploy/)で作成します。

リポジトリを分ける方式（フロント用・バック用で別リポジトリ）もありますが、今回モノレポを選ぶ理由は次の通りです。

- **変更がひとまとまりになる**: 「APIに項目を足し、画面にも表示する」という変更が1つのコミット・1つのPull Requestで完結し、履歴を追いやすくなります（→ [Pull Requestの流れ](/git/github_and_pr/)）
- **セットアップが1回で済む**: `git clone` 1回でプロジェクト全体が手に入ります
- **CI/CDの置き場所が1つになる**: GitHub Actionsのワークフローを1か所で管理できます（→ [CI/CD](/cicd/)）

チームや製品が大きくなるとリポジトリ分割が選ばれることもありますが、個人開発と学習にはモノレポの分かりやすさが勝ります。

### ディレクトリ作成とgit init

作業ディレクトリを作り、Gitの管理下に置きます（→ [Gitの基本コマンド](/git/basic_commands/)）。

```bash
mkdir sns-app
cd sns-app
git init
git branch -M main
```

実行結果の例（`git init` 時）：

```
Initialized empty Git repository in /Users/you/sns-app/.git/
```

`git branch -M main` は、環境によって初期ブランチ名が `master` になる場合に備えて、ブランチ名を `main` に揃えるためのコマンドです。

### ルートの.gitignore

コミットしてはいけないファイルを最初に決めておきます。**後から慌てて除外するより、最初に網を張る**のが安全です。リポジトリのルートに `.gitignore` を作ります。

**`sns-app/.gitignore`**

```
node_modules/
dist/
.env
*.log
.DS_Store
```

**コード解説**

- `node_modules/` — インストールされたパッケージの実体です。`package.json` があれば `pnpm install` で復元できるためコミットしません（→ [Gitの基本コマンド](/git/basic_commands/)で学んだ通りです）
- `dist/` — ビルドの成果物です。ソースコードから再生成できるものはコミットしません
- `.env` — **環境変数ファイル。データベースのパスワードなどの秘密情報を含むため、絶対にコミットしてはいけません**。スラッシュなしのパターンはどの階層にもマッチするので、後で作る `backend/.env` や `frontend/.env` もこの1行で除外されます
- `*.log` / `.DS_Store` — ログファイルと、macOSが自動生成する管理ファイルです。プロジェクトと無関係なので除外します

なお、この後 `nest new` や `create vite` が生成する雛形にもそれぞれ `.gitignore` が含まれていますが、それらはそのまま残して構いません。ルートの `.gitignore` は「リポジトリ全体の安全網」という位置づけです。

最初のコミットをしておきましょう。

```bash
git add .gitignore
git commit -m "chore: リポジトリを初期化"
```

実行結果の例：

```
[main (root-commit) a1b2c3d] chore: リポジトリを初期化
 1 file changed, 5 insertions(+)
```

### GitHubへpush

[リモートリポジトリとpush](/git/github_and_pr/)で学んだ手順で、GitHub上に空のリポジトリ `sns-app` を作成し（READMEや.gitignoreは追加しない「空」の状態で作ります）、リモートとして登録してpushします。

```bash
git remote add origin https://github.com/<あなたのアカウント名>/sns-app.git
git push -u origin main
```

実行結果の例（抜粋）：

```
To https://github.com/your-name/sns-app.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

これで、このプロジェクトのすべての歴史がGitHubに記録されていきます。以降、各ページの最後でコミットとpushを行います。

## 開発用データベース

次に、開発用のPostgreSQLを用意します。[セクションの入口](/sns/)で確認した通り、開発環境ではデータベースだけをDockerコンテナで動かします（→ [開発環境をcomposeで組む](/docker/dev_environment/)で確立した標準形です）。

リポジトリのルートに `compose.yaml` を作成します。

**`sns-app/compose.yaml`**

```yaml
services:
  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sns
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

**コード解説**（→ [Docker Compose](/docker/docker_compose/)の復習です）

- `services:` — 起動するコンテナの一覧です。今回は `db` の1つだけです
- `image: postgres:16` — PostgreSQLの公式イメージ、バージョン16を使います。カリキュラム全体でバージョンを固定しているのは、環境差によるトラブルを防ぐためです
- `ports: - "5432:5432"` — ホスト（自分のPC）の5432番ポートをコンテナの5432番につなぎます。これにより、ローカルで動くNestJSから `localhost:5432` で接続できます
- `environment:` — コンテナに渡す環境変数です。`POSTGRES_USER` / `POSTGRES_PASSWORD` で接続ユーザーを、`POSTGRES_DB` で初回起動時に作られるデータベース名（`sns`）を指定します。開発専用なので簡単なパスワードで構いません（本番のRDSでは[Secrets Manager](/aws/rds/)で厳重に管理します）
- `volumes: - db-data:/var/lib/postgresql/data` — データの実体を名前付きボリューム `db-data` に保存します。これがないと、コンテナを作り直すたびに登録ユーザーや投稿が全部消えてしまいます
- 末尾の `volumes:` — 使用する名前付きボリュームの宣言です

起動して確認します。

```bash
docker compose up -d
```

実行結果の例：

```
[+] Running 2/2
 - Volume "sns-app_db-data"  Created
 - Container sns-app-db-1    Started
```

```bash
docker compose ps
```

実行結果の例：

```
NAME           IMAGE         COMMAND                  SERVICE   CREATED          STATUS          PORTS
sns-app-db-1   postgres:16   "docker-entrypoint.s…"   db        15 seconds ago   Up 14 seconds   0.0.0.0:5432->5432/tcp
```

`STATUS` が `Up` になっていれば起動成功です。[psqlでの接続確認](/database/postgresql_setup/)もしておきましょう。

```bash
docker compose exec db psql -U postgres -d sns
```

実行結果の例：

```
psql (16.4 (Debian 16.4-1.pgdg120+1))
Type "help" for help.

sns=#
```

`sns=#` というプロンプトが出れば、`sns` データベースに接続できています。`\dt` を打つと `Did not find any relations.` と表示され、まだテーブルが1つもないことが分かります。確認できたら `\q` で抜けます。

## バックエンドの雛形

### nest newでプロジェクト作成

[NestJSのプロジェクト作成](/backend/setup/)で学んだNest CLIを使います。リポジトリのルート（`sns-app/`）で実行してください。

```bash
nest new backend --skip-git --package-manager pnpm
```

オプションを2つ付けています。`--skip-git` は、`nest new` が作成ディレクトリ内で新しいGitリポジトリを初期化するのを止めるものです（すでに `sns-app` 全体をGit管理しているため、入れ子のリポジトリを作らせません）。`--package-manager pnpm` は、パッケージマネージャの選択プロンプトを省略してpnpmを指定します（→ [NestJSのプロジェクト作成](/backend/setup/)ではプロンプトでpnpmを選びました）。

実行結果の例（抜粋）：

```
CREATE backend/package.json (1943 bytes)
CREATE backend/src/app.controller.ts (274 bytes)
CREATE backend/src/app.module.ts (249 bytes)
CREATE backend/src/app.service.ts (142 bytes)
CREATE backend/src/main.ts (208 bytes)
...
Successfully created project backend
```

ファイル構成は[NestJSのプロジェクト作成](/backend/setup/)で見たものと同じです。雛形のサンプル実装のうち、サンプルのテストファイルと、`Hello World!` を返すだけのAppServiceは使わないので削除します（テストは[SNSのテストを書く](/sns/testing/)で改めて書きます）。

```bash
cd backend
rm src/app.controller.spec.ts src/app.service.ts
```

この時点では `app.controller.ts` が削除したAppServiceを参照したままなので、サーバーは起動できません。後述のヘルスチェックAPIの実装で書き換えて解消するため、いまは気にせず進めます。

### .envと環境変数の方針

接続先やURLのような「環境によって変わる値」は、コードに直書きせず**環境変数**で渡します。[Prisma導入](/database/prisma_setup/)で学んだ `.env` ファイルを、このプロジェクトではアプリ本体でも使います。ただし、NestJS自体は `.env` を自動では読み込まないため、**dotenv（ドットエンブ）**というパッケージを使います。dotenvは「`.env` の内容を `process.env` に読み込む」だけの小さな道具で、実はPrismaも内部でこの仕組みを使っています。NestJSには設定管理のための公式モジュール（`@nestjs/config`）もありますが、新しい仕組みを増やさないため、本プロジェクトでは**Prismaと同じ `.env` をdotenvで読む簡素な方針**で統一します。

```bash
pnpm add dotenv
```

`backend/.env` を作成します。

**`backend/.env`**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sns?schema=public"
JWT_SECRET="dev-secret-change-me"
FRONTEND_URL="http://localhost:5173"
```

**コード解説**

- `DATABASE_URL` — Prismaが使うデータベース接続文字列です。`ユーザー名:パスワード@ホスト:ポート/データベース名` という形式は[Prisma導入](/database/prisma_setup/)で学びました。値はすべて先ほどの `compose.yaml` に合わせています（ユーザー `postgres`、パスワード `postgres`、DB名 `sns`）
- `JWT_SECRET` — 次のページ[ユーザー登録とログイン（JWT認証）](/sns/auth/)で使う、認証用の秘密の文字列です。今は仮の値で構いません（本番では推測不可能な長い値にし、[Secrets Manager](/aws/rds/)で管理します）
- `FRONTEND_URL` — フロントエンド（Vite開発サーバー）のURLです。この後のCORS設定で使います

`.env` はルートの `.gitignore` ですでに除外済みなので、コミットされる心配はありません。`git status` で `backend/.env` が表示されないことを確認しておくと確実です。

## ValidationPipeとCORS

`main.ts` に、アプリ全体に効く2つの設定を入れます。まず、バリデーションに必要なパッケージを入れます（→ [DTOとバリデーション](/backend/dto_and_validation/)で使ったものと同じです）。

```bash
pnpm add class-validator class-transformer
```

**`backend/src/main.ts`**

```typescript
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: process.env.FRONTEND_URL });
  await app.listen(3000);
}
bootstrap();
```

**コード解説**

- `import 'dotenv/config';` — dotenvに `.env` を読み込ませ、`process.env` に反映します。**必ずファイルの先頭**に書きます。他のコードより先に環境変数を確定させるためです
- `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))` — [DTOとバリデーション](/backend/dto_and_validation/)で学んだValidationPipeを、アプリ全体のすべてのエンドポイントに適用します。コントローラごとに書く手間が省け、適用漏れも防げます
- `whitelist: true` — DTOに定義されていないプロパティを、受信したボディから自動で取り除くオプションです。たとえば `{ "email": "...", "isAdmin": true }` のような余計な項目を混ぜて送られても、DTOにない `isAdmin` は捨てられます。**クライアントから送られるデータを信用しない**、というバックエンドの基本姿勢の表れです
- `app.enableCors({ origin: process.env.FRONTEND_URL })` — `http://localhost:5173`（フロントエンド）からのAPI呼び出しを許可します（次項で説明します）
- `await app.listen(3000)` — ポート3000で起動します

### CORSの復習

**CORS（Cross-Origin Resource Sharing、コルス）**について簡単に復習しておきます（→ [HTTPとREST](/backend/http_and_rest/)、エラーに遭遇した経験は → [つなぎ込みで起きること](/fullstack-todo/integration/)）。ブラウザには**同一オリジンポリシー**という安全装置があり、Webページは原則として「自分と同じオリジン（スキーム＋ホスト＋ポートの組）」のAPIしか利用できません。フロントエンドは `http://localhost:5173`、APIは `http://localhost:3000` で**ポートが違うので別オリジン**となり、そのままではブラウザが応答の利用をブロックします。

`enableCors({ origin: ... })` を設定すると、APIが応答に「このオリジンからの利用は許可済み」というヘッダ（`Access-Control-Allow-Origin`）を付け、ブラウザがブロックを解除します。許可先を `*`（全部）にせず `FRONTEND_URL` に限定するのは、見知らぬサイトからAPIを呼ばれないようにするためです。本番では、この環境変数をCloudFrontのURLに差し替えるだけで対応できます（→ [AWSへの全体デプロイ](/sns/deploy/)）。

## Prismaの導入

データベースを操作するPrismaを導入します。手順は[Prisma導入](/database/prisma_setup/)で学んだ通りです。

```bash
pnpm add -D prisma@5
pnpm add @prisma/client@5
pnpm exec prisma init
```

実行結果の例（抜粋）：

```
Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your favorite editor.

warn You already have a .gitignore file. Don't forget to add `.env` in it to not commit any private information.
```

`prisma init` が生成した `prisma/schema.prisma` は次の内容です。

**`backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

内容は[Prisma導入](/database/prisma_setup/)で学んだ通り、「`prisma generate` で型つきのPrisma Clientを生成する」「接続先はPostgreSQLで、接続文字列は環境変数 `DATABASE_URL` から読む」という2つの宣言です。表示された `warn` は「`.gitignore` に `.env` を足し忘れるな」という注意ですが、ルートの `.gitignore` で対応済みです。`DATABASE_URL` もすでに `backend/.env` に正しい値を書いてあるので、追加の作業はありません。

**ここではまだモデル（テーブル定義）を書きません。** 最初のモデル `User` は、次のページ[ユーザー登録とログイン（JWT認証）](/sns/auth/)で追加し、最初のマイグレーションを実行します。今はPrisma Clientを一度生成しておきます（モデルが空でも生成は成功し、後でNestJSからimportできるようになります）。

```bash
pnpm exec prisma generate
```

実行結果の例：

```
Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 48ms
```

### PrismaServiceとPrismaModule

NestJSからPrismaを使うための窓口を作ります。[PrismaのNestJSへの組み込み](/database/crud_with_prisma/)で書いたものとほぼ同じです。

**`backend/src/prisma/prisma.service.ts`**（新規作成）

```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**コード解説**

- `extends PrismaClient` — PrismaClientを継承し、Prismaの全機能をDI可能なServiceとして使えるようにします（→ [PrismaのNestJSへの組み込み](/database/crud_with_prisma/)の復習です）
- `onModuleInit` / `onModuleDestroy` — アプリの起動時に明示的に接続し、終了時に切断します。起動時接続により、接続情報の間違いを最初のリクエストを待たずに検出できます

**`backend/src/prisma/prisma.module.ts`**（新規作成）

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**コード解説**

- `providers` / `exports` — PrismaServiceを登録し、モジュールの外からも注入できるように公開します（→ [PrismaのNestJSへの組み込み](/database/crud_with_prisma/)）
- `@Global()` — このモジュールを**グローバルモジュール**にするデコレータです。これまではPrismaServiceを使うモジュールごとに `imports: [PrismaModule]` と書きましたが、このSNSでは**ほぼすべてのモジュールがデータベースを使う**ため、`@Global()` を付けて「AppModuleで一度importすれば、どのモジュールからも `imports` なしで注入できる」ようにします。何でもグローバルにすると依存関係が見えにくくなるので、全員が使う土台に限って使うのが原則です

AppModuleに登録します。先ほどAppServiceを削除したので、`providers` からも取り除いた形にします。

**`backend/src/app.module.ts`**（全体を書き換え）

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
})
export class AppModule {}
```

**コード解説**

- `imports: [PrismaModule]` — `@Global()` 付きモジュールも、**どこか1か所（通常はAppModule）でのimportは必要**です。この1回で、以降のすべてのモジュールからPrismaServiceが注入可能になります
- 雛形にあった `providers: [AppService]` は、AppServiceの削除に合わせて取り除きました

## ヘルスチェックAPI

最初のAPIとして、`GET /health` に `{ "status": "ok" }` を返す**ヘルスチェック（health check、稼働確認）**を実装します。「サーバーは生きていますか？」に答えるだけの最小のAPIですが、2つの大事な役割があります。

1. **今**: セットアップが正しく完了したことを確認する手段になる
2. **後**: 本番環境でALB（ロードバランサー）が「このコンテナにリクエストを送ってよいか」を定期的に確認するために使う（→ [ECR + ECS Fargate](/aws/ecr_ecs/)で学んだALBのヘルスチェックです。設定は[AWSへの全体デプロイ](/sns/deploy/)で行います）

AppControllerを書き換えます。これで、雛形整理のときから保留にしていたコンパイルエラー（削除済みAppServiceへの参照）も解消します。

**`backend/src/app.controller.ts`**（全体を書き換え）

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
```

**コード解説**

- `@Controller()` — 引数なしなので、ルート直下のパスを受け持ちます（→ [ルーティング](/backend/controller/)）
- `@Get('health')` — `GET /health` をこのメソッドに割り当てます
- `return { status: 'ok' }` — オブジェクトを返すと、NestJSが自動でJSONに変換して返します

起動して確認します。`compose.yaml` のデータベースが起動していることを確認してから実行してください（PrismaServiceが起動時に接続するためです）。

```bash
pnpm run start:dev
```

実行結果の例（抜粋）：

```
[Nest] 21148  - 2026/06/12 10:00:00     LOG [InstanceLoader] PrismaModule dependencies initialized
[Nest] 21148  - 2026/06/12 10:00:00     LOG [RouterExplorer] Mapped {/health, GET} route
[Nest] 21148  - 2026/06/12 10:00:00     LOG [NestApplication] Nest application successfully started
```

`PrismaModule dependencies initialized` が出ていれば、データベース接続にも成功しています。別のターミナルからcurlで叩いてみます。

```bash
curl http://localhost:3000/health
```

実行結果の例：

```
{"status":"ok"}
```

バックエンドの土台が完成しました。サーバーは起動したままにしておきます。

## フロントエンドの雛形

### create viteでプロジェクト作成

[Viteでプロジェクト作成](/react/setup/)で学んだ手順です。**リポジトリのルート（`sns-app/`）**で実行してください。

```bash
pnpm create vite@5 frontend --template react-ts
```

実行結果の例：

```
Scaffolding project in /Users/you/sns-app/frontend...

Done. Now run:
  cd frontend
  pnpm install
  pnpm run dev
```

案内の通り、依存パッケージをインストールします。

```bash
cd frontend
pnpm install
```

雛形のうち、サンプル画面用のファイルは使わないので削除します。

```bash
rm src/App.css src/assets/react.svg
```

### 環境変数（VITE_API_URL）

APIの接続先URLを環境変数にします。バックエンドの `FRONTEND_URL` と対になる設定です。

**`frontend/.env`**

```
VITE_API_URL="http://localhost:3000"
```

Viteは `frontend/.env` を自動で読み込み、**`VITE_` で始まる変数だけ**をフロントエンドのコードに公開します（コード側からは `import.meta.env.VITE_API_URL` で参照できます）。接頭辞が必須なのは、サーバー用の秘密情報をうっかりブラウザに公開してしまう事故を防ぐためです。フロントエンドのコードは利用者のブラウザに丸ごと配られるので、**ここに秘密情報を書いてはいけません**。実際にこの値を使うのは、次のページでAPI呼び出しの共通処理を作るときです。なお、このファイルもルートの `.gitignore` の `.env` に該当するためコミットされません（本番用の値は[デプロイ](/sns/deploy/)のビルド時に注入します）。

### 最小のスタイルとApp.tsx

`index.css` を最小限のスタイルに置き換えます。デザインは追わず、読みやすさの土台だけ整えます（CSSの詳細は → [HTML/CSS](/frontend/html_css/)）。

**`frontend/src/index.css`**（全体を書き換え）

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN",
    "Yu Gothic", sans-serif;
  background-color: #f5f5f5;
  color: #333;
}
```

**コード解説**

- `box-sizing: border-box` — 幅の計算にパディングと枠線を含める指定です。レイアウト計算が直感的になるため、最初に全要素へ適用するのが定番です
- `body` — 余白のリセット、読みやすいフォント、薄いグレーの背景と文字色だけを指定しています

`App.tsx` は一旦、表示確認用の最小構成にします。

**`frontend/src/App.tsx`**（全体を書き換え）

```tsx
function App() {
  return <h1>Hello SNS</h1>;
}

export default App;
```

**コード解説**

- 見出しを1つ返すだけの関数コンポーネントです（→ [JSXとコンポーネント](/react/jsx_and_components/)）。雛形の `App.tsx` が importしていた `App.css` ごと書き換えたので、先ほどのファイル削除と整合しています
- この仮実装は、[ユーザー登録とログイン（JWT認証)](/sns/auth/)で「URLのハッシュを見てページを出し分ける」本実装に置き換わります

`main.tsx` は雛形のままで変更不要です（`index.css` のimportと `<App />` の描画だけが書かれています）。

開発サーバーを起動します。

```bash
pnpm run dev
```

実行結果の例：

```
  VITE v5.4.8  ready in 312 ms

  Local:   http://localhost:5173/
  Network: use --host to expose
```

ブラウザで `http://localhost:5173` を開き、「Hello SNS」と表示されれば成功です。

## Prettier / ESLint

コード品質のための道具立ては、**雛形に含まれる設定をそのまま使います**。NestJSの雛形にはPrettierとESLintの設定（`.prettierrc` と ESLint設定ファイル）が、Viteの雛形にはESLintの設定が最初から含まれており、本カリキュラムの方針と同じ「Prettierで整形、ESLintで検査」の体制がすでに整っています（→ [Prettier](/tooling/prettier/)、[ESLint](/tooling/eslint/)）。

それぞれのディレクトリで次のコマンドが使えます。

```bash
# backend/ で
pnpm run format   # Prettierで整形
pnpm run lint     # ESLintで検査（自動修正つき）

# frontend/ で
pnpm run lint     # ESLintで検査
```

[VS Code連携](/tooling/editor_and_scripts/)で設定した「保存時フォーマット」が効いていれば、普段は意識する必要はありません。各ページの作業を終えてコミットする前に `lint` を一度流す、という習慣にしておくと安心です。

## 動作確認とコミット

このページのゴールに到達したか確認しましょう。今、手元では次の3つが動いているはずです。

```mermaid
flowchart LR
    B["ブラウザ"]
    subgraph local["自分のPC（ローカル実行）"]
        V["Vite開発サーバー<br>frontend / pnpm run dev<br>ポート5173"]
        N["NestJS<br>backend / pnpm run start:dev<br>ポート3000"]
    end
    subgraph docker["Docker"]
        P[("PostgreSQL 16<br>dbコンテナ<br>ポート5432")]
    end
    B -->|"http://localhost:5173<br>Hello SNS"| V
    B -->|"curl http://localhost:3000/health"| N
    N -->|"Prisma（起動時に接続）"| P
    style V fill:#e3f2fd,stroke:#1565c0
    style N fill:#e3f2fd,stroke:#1565c0
    style P fill:#e8f5e9,stroke:#2e7d32
```

図の通り、フロントエンドとバックエンドはローカルのプロセス、データベースだけがDockerコンテナです。まだフロントエンドからAPIへの矢印はありません（次のページでつながります）。チェックリストで最終確認します。

- [ ] `docker compose ps` で `db` が `Up` になっている
- [ ] `curl http://localhost:3000/health` が `{"status":"ok"}` を返す
- [ ] `http://localhost:5173` で「Hello SNS」が表示される

3つすべて確認できたら、この状態をコミットします（→ [Gitの基本コマンド](/git/basic_commands/)）。

```bash
cd ..   # sns-app のルートへ
git status
```

実行結果の例（抜粋）：

```
Untracked files:
        backend/
        compose.yaml
        frontend/
```

`backend/.env` と `frontend/.env` が一覧に**現れていない**ことも確認してください（`.gitignore` が効いている証拠です）。問題なければコミットしてpushします。

```bash
git add .
git commit -m "feat: プロジェクトの雛形を作成（DB・backend・frontend）"
git push
```

これで「動く状態のセーブポイント」が1つできました。以降のページでも、この「動作確認 → コミット → push」のリズムを守って進めます。

## 理解度チェック

**Q1. このプロジェクトでは、なぜデータベースだけをDockerコンテナで動かし、NestJSとReactはローカルで実行するのですか。**

<details markdown="1">
<summary>解答を見る</summary>

データベースは自分で書き換えるものではなく「決まったバージョンが動いていればよい」ソフトウェアなので、コンテナで起動するのが手軽で確実です（PCを汚さず、バージョンも固定できます）。一方、NestJSとReactは自分が編集し続けるコードなので、ローカル実行の方がホットリロードが速く開発しやすいためです。アプリのコンテナ化は本番デプロイのために行います（→ [開発環境をcomposeで組む](/docker/dev_environment/)、[AWSへの全体デプロイ](/sns/deploy/)）。

</details>

**Q2. `ValidationPipe` の `whitelist: true` は何をしてくれますか。これがないとどんな危険がありますか。**

<details markdown="1">
<summary>解答を見る</summary>

DTOに定義されていないプロパティを、受信したリクエストボディから自動で取り除きます。これがないと、クライアントがボディに余計な項目（例: `isAdmin: true`）を混ぜて送ってきたとき、それがそのままServiceまで渡ってしまい、意図しない値の書き込みにつながる恐れがあります。「クライアントの入力を信用せず、受け取る項目を明示的に決める」ための設定です（→ [DTOとバリデーション](/backend/dto_and_validation/)）。

</details>

**Q3. `app.enableCors({ origin: process.env.FRONTEND_URL })` を書かないと、フロントエンドからのAPI呼び出しはどうなりますか。理由も説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

ブラウザの同一オリジンポリシーによってブロックされ、開発者ツールにCORSエラーが表示されます。フロントエンドは `http://localhost:5173`、APIは `http://localhost:3000` で**ポートが違う＝別オリジン**だからです。`enableCors` を設定すると、APIが応答に `Access-Control-Allow-Origin` ヘッダを付け、指定したオリジンからの利用をブラウザに許可させられます（→ [HTTPとREST](/backend/http_and_rest/)、[つなぎ込みで起きること](/fullstack-todo/integration/)）。

</details>

**Q4. PrismaModuleに付けた `@Global()` の効果と、グローバルモジュールを乱用すべきでない理由を説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

`@Global()` を付けたモジュールは、AppModuleなどで一度importするだけで、**他のすべてのモジュールから `imports` に書かずに**そのexport（PrismaService）を注入できるようになります。ほぼ全モジュールがデータベースを使うこのプロジェクトでは記述の重複を減らせます。一方で、何でもグローバルにすると「このServiceはどこから来たのか」という依存関係がコードから読み取りにくくなるため、全員が使う土台的なものに限って使うのが原則です。

</details>

**Q5. `GET /health` はこのページの時点では何の役に立ち、後でどこで使われますか。**

<details markdown="1">
<summary>解答を見る</summary>

今は「NestJSが起動し、リクエストに応答できる状態か」をcurl一発で確認する手段です。後の[AWSへの全体デプロイ](/sns/deploy/)では、ALB（ロードバランサー）がこのエンドポイントを定期的に呼び、応答しないコンテナをリクエストの振り分け先から外す**ヘルスチェック**として使います（→ [ECR + ECS Fargate](/aws/ecr_ecs/)）。

</details>

## セルフレビュー

- [ ] モノレポ構成を選んだ理由を自分の言葉で説明できる
- [ ] `compose.yaml` の各行（image / ports / environment / volumes）の意味を説明できる
- [ ] `.env` をコミットしてはいけない理由と、`.gitignore` での除外のしかたを説明できる
- [ ] `main.ts` のValidationPipeとCORSの設定を、雛形から自力で書ける
- [ ] PrismaService / PrismaModuleの役割と `@Global()` の意味を説明できる
- [ ] ヘルスチェックAPIを実装し、curlで確認する手順を写経せずに実行できる
- [ ] `VITE_API_URL` のような環境変数に `VITE_` 接頭辞が必要な理由を説明できる
- [ ] DB・backend・frontendの3つを起動し、動作確認してコミットするまでを一人で再現できる

## 次のステップ

プロジェクトの骨格が完成しました。[セクションの入口](/sns/)で見た開発の進行図の、最初の1歩が終わったことになります。

次のページは[ユーザー登録とログイン（JWT認証）](/sns/auth/)です。最初のモデル `User` をPrismaスキーマに追加してマイグレーションを実行し、ユーザー登録・ログインのAPIと画面を作ります。このセクションで唯一の新しい概念である**JWT・bcrypt・Guard**が登場する、山場の1つです。このページで整えたValidationPipe（DTOの検証）、CORS、PrismaService、`JWT_SECRET` は、すべてそこで早速使われます。
