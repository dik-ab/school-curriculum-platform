---
title: プロジェクトのセットアップ
parent: Todo NestJS + Prisma版
nav_order: 3
section_key: todo-nestjs
section_title: Todo NestJS + Prisma版
---

# プロジェクトのセットアップ

このページでは、Todoアプリの開発を始めるための土台を作ります。具体的には、パッケージマネージャ**pnpm**の復習、リポジトリ構成の作成、Docker ComposeによるPostgreSQLの起動、NestJSプロジェクトとReactプロジェクトの作成、Prismaの初期化までを行います。

ここで作る構成は[セクションの概要](/fullstack-todo/)で説明した**開発環境の標準形**（DBはコンテナ、アプリはローカルで `pnpm run dev`）です。1つ1つの手順は過去の章で学んだことの組み合わせなので、迷ったら参照リンク先に戻って確認してください。

## 学習目標

- pnpmとは何か、npmと何が違うかを説明できる
- `corepack enable pnpm` でpnpmを導入できる
- frontend / backend / compose.yaml からなるリポジトリ構成を作れる
- Docker ComposeでPostgreSQL 16を起動し、Prismaのマイグレーションを実行できる
- バックエンドとフロントエンドの開発サーバーをそれぞれ起動できる

## pnpmとは

パッケージマネージャ**pnpm（ピーエヌピーエム）**は、[React基礎のセットアップ](/react/setup/)で導入済みです。このセクションでも全面的に使うので、ここで簡単に復習しておきましょう。

pnpmは、npmと同じく「`package.json` に書かれた依存パッケージをインストール・管理するツール」です。コマンドの使い方もnpmとほぼ同じですが、内部の仕組みが改良されており、主に2つの利点があります。

1. **ディスク効率が良い** — npmはプロジェクトごとに `node_modules/` へパッケージの実体をコピーします。10個のプロジェクトでReactを使えば、同じファイルが10回コピーされます。pnpmはパッケージの実体をPC内の1か所（グローバルストア）にだけ保存し、各プロジェクトの `node_modules/` からは**リンク（参照）**を張ります。同じパッケージを何度もコピーしないため、ディスク使用量が大幅に減ります
2. **インストールが速い** — 一度ダウンロードしたパッケージはストアから再利用されるため、2回目以降のインストールが高速です。今回のようにfrontendとbackendの2つのプロジェクトを持つ構成では、共通パッケージが多いほど効果があります

コマンドの対応関係は次のとおりです。この表だけ覚えれば、npmの知識はそのまま活かせます。

| やりたいこと | npm | pnpm |
|---|---|---|
| 依存パッケージを一括インストール | `npm install` | `pnpm install` |
| パッケージを追加 | `npm install <pkg>` | `pnpm add <pkg>` |
| 開発用パッケージを追加 | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| スクリプトを実行 | `npm run dev` | `pnpm run dev` |
| パッケージを一時的に実行（npx相当） | `npx <pkg>` | `pnpm dlx <pkg>` |

### pnpmが未導入の場合

別のPCで作業を始めるなど、pnpmが未導入の環境では、[Node.js](/environment/node/)（20系）に同梱されている**Corepack（コアパック）**という機能で導入します。Corepackは「Node.jsに付属する、パッケージマネージャの管理ツール」で、これを有効化するだけでpnpmが使えるようになります。別途インストーラをダウンロードする必要はありません。

```bash
corepack enable pnpm
```

このコマンドは初回に1度だけ実行すれば、以降どのプロジェクトでもpnpmが使えます。確認のためバージョンを表示してみましょう。

```bash
pnpm -v
```

実行結果の例:

```
9.12.0
```

バージョン番号が表示されれば導入完了です（番号自体は多少違っていても問題ありません）。初回実行時に「Do you want to continue?」のような確認が出た場合は `y` で続行してください。

## リポジトリ構成を作る

今回のプロジェクトは、1つのリポジトリの中にフロントエンドとバックエンドを並べる構成にします。

```
fullstack-todo/
├── compose.yaml      # PostgreSQLを起動するComposeファイル
├── backend/          # NestJS（API）
└── frontend/         # React（画面）
```

フロントとバックを別リポジトリにする流儀もありますが、1人で開発する学習プロジェクトでは1リポジトリにまとめるほうが見通しが良く、[Git](/git/)の管理も1回で済みます。[SNS開発](/sns/)でも同じ構成を使います。

作業ディレクトリを作成し、[Git](/git/basic_commands/)で管理を開始します。

```bash
mkdir fullstack-todo
cd fullstack-todo
git init
```

実行結果の例:

```
Initialized empty Git repository in /Users/yourname/dev/fullstack-todo/.git/
```

## PostgreSQLをDocker Composeで起動する

データベースから準備します。[開発環境をcomposeで組む](/docker/dev_environment/)・[PostgreSQLを起動して触ってみる](/database/postgresql_setup/)で学んだ構成とほぼ同じです。

`fullstack-todo/` 直下に `compose.yaml` を作成します。

**`compose.yaml`**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todoapp
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d todoapp"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  db-data:
```

**コード解説**

- `image: postgres:16` — PostgreSQL 16の公式イメージを使います。バージョンを固定して環境を再現可能にします（→ [Dockerfileの書き方](/docker/dockerfile/)）
- `POSTGRES_USER` / `POSTGRES_PASSWORD` — 接続用のユーザー名とパスワードです。ローカル開発専用なので簡単な値で構いません
- `POSTGRES_DB: todoapp` — 起動時に `todoapp` という名前のデータベースを自動作成します
- `ports: "5432:5432"` — コンテナの5432番ポートを手元のPCに公開します。後でPrismaが `localhost:5432` に接続します
- `volumes: db-data:...` — [ボリューム](/docker/docker_compose/)でデータを永続化し、コンテナを作り直してもTodoのデータが消えないようにします
- `healthcheck:` — PostgreSQLが接続を受け付けられる状態かを `pg_isready` で確認します（→ [開発環境をcomposeで組む](/docker/dev_environment/)）

起動します。

```bash
docker compose up -d
```

実行結果の例:

```
[+] Running 2/2
 ✔ Network fullstack-todo_default  Created
 ✔ Container fullstack-todo-db-1   Started
```

状態を確認します。

```bash
docker compose ps
```

実行結果の例:

```
NAME                    IMAGE         COMMAND                  SERVICE   CREATED          STATUS          PORTS
fullstack-todo-db-1     postgres:16   "docker-entrypoint.s…"   db        15 seconds ago   Up 14 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

`STATUS` が `Up`（しばらく待つと `(healthy)` 付き）になっていれば成功です。これでデータベースの準備は完了です。**今後、開発を始めるときは最初にこの `docker compose up -d` を実行する**、と覚えてください。

なお、[データベースとPrismaの章](/database/postgresql_setup/)などで別のPostgreSQLコンテナを起動したままの場合、5432番ポートが衝突して起動に失敗します。`docker ps` で確認し、不要なコンテナは `docker compose down`（そのプロジェクトのディレクトリで実行）で停止してください（→ [Dockerの基本操作](/docker/install_and_basics/)）。

## バックエンド（NestJS）プロジェクトを作る

`fullstack-todo/` 直下で、[Nest CLI](/backend/setup/)を使ってプロジェクトを作成します。Nest CLIは `pnpm dlx`（npxに相当する、パッケージの一時実行コマンド）で呼び出します。

```bash
pnpm dlx @nestjs/cli@10 new backend --package-manager pnpm --skip-git
```

**コマンド解説**

- `pnpm dlx @nestjs/cli@10` — Nest CLIのバージョン10系を、インストールせずその場で実行します
- `new backend` — `backend` という名前のディレクトリにプロジェクトを作成します
- `--package-manager pnpm` — 依存パッケージのインストールにpnpmを使うよう指定します。これを付けないと対話形式で質問されるので、その場合は `pnpm` を選んでください
- `--skip-git` — `backend/` の中に新しいGitリポジトリを作らないようにします。すでに `fullstack-todo/` 全体をGit管理しているためです

実行結果の例（抜粋）:

```
▹▹▹▹▸ Installation in progress... ☕

🚀  Successfully created project backend
👉  Get started with the following commands:

$ cd backend
$ pnpm run start
```

起動確認をします。NestJSの開発時は、ファイルの変更を監視して自動で再起動する**watchモード**（`start:dev`）を使います（→ [NestJSのセットアップ](/backend/setup/)）。

```bash
cd backend
pnpm run start:dev
```

実行結果の例（抜粋）:

```
[Nest] 12345  - 2026/06/12 10:00:00     LOG [NestApplication] Nest application successfully started +2ms
```

別のターミナルから動作を確認します。

```bash
curl http://localhost:3000
```

実行結果:

```
Hello World!
```

確認できたら、いったん `Ctrl + C` でサーバーを止めて構いません。

### `pnpm run dev` で起動できるようにする

本カリキュラムでは「開発サーバーの起動は `pnpm run dev`」に統一します。Viteは最初から `dev` スクリプトを持っていますが、NestJSのスクリプト名は `start:dev` なので、エイリアス（別名）を追加して揃えます。

**`backend/package.json`**（`scripts` の中に1行追加）

```json
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
```

**コード解説**

- `"dev": "nest start --watch"` — `start:dev` と同じ内容（watchモードでの起動）を `dev` という名前でも実行できるようにします。既存の行は変更せず、`scripts` オブジェクトの先頭にこの1行を足すだけです

これで、フロントもバックも `pnpm run dev` で起動できるようになりました。「どっちのコマンドだったか」を思い出す必要がなくなります。

## Prismaを初期化する

次に、NestJSからPostgreSQLへ接続するためのPrismaをセットアップします。手順は[Prismaの導入](/database/prisma_setup/)で学んだとおりです。

`backend/` ディレクトリで実行します。

```bash
pnpm add -D prisma@5
pnpm add @prisma/client@5
pnpm exec prisma init
```

**コマンド解説**

- `pnpm add -D prisma@5` — Prisma CLI（マイグレーションなどの開発用ツール）を開発依存として追加します。`@5` はバージョンを5系に固定する指定で、Prismaはメジャーバージョンが変わると生成物や手順が変わるため、教材と同じ5系を明示します
- `pnpm add @prisma/client@5` — アプリの実行時にDBへアクセスするためのライブラリを追加します
- `pnpm exec prisma init` — `prisma/schema.prisma` と `.env` の雛形を生成します。直前に `pnpm add` でインストール済みのPrisma CLIを `pnpm exec` で実行しています

実行結果の例（抜粋）:

```
✔ Your Prisma schema was created at prisma/schema.prisma

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database.
```

### 接続情報（.env）を設定する

生成された `backend/.env` の `DATABASE_URL` を、先ほどcompose.yamlで起動したPostgreSQLに合わせて書き換えます。

**`backend/.env`**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todoapp?schema=public"
```

**コード解説**

- `postgres:postgres` — compose.yamlの `POSTGRES_USER` と `POSTGRES_PASSWORD` です
- `localhost:5432` — コンテナの5432番ポートをホストに公開しているので、アプリからは `localhost` で接続できます
- `todoapp` — compose.yamlの `POSTGRES_DB` で作成したデータベース名です

`.env` にはパスワードなどの秘密情報が入るため、**Gitにコミットしてはいけません**（→ [Prismaの導入](/database/prisma_setup/)）。`fullstack-todo/` 直下に `.gitignore` を作成しておきます。

**`.gitignore`**

```
node_modules/
.env
dist/
```

**コード解説**

- `node_modules/` — 依存パッケージの実体。`pnpm install` で再生成できるためコミットしません
- `.env` — 接続情報などの秘密情報。環境ごとに値が違うものでもあります
- `dist/` — ビルド成果物。ソースコードから再生成できるためコミットしません

### Todoモデルを定義してマイグレーションする

[セクションの概要](/fullstack-todo/)のER図のとおり、Todoモデルを定義します。書き方は[モデル定義とマイグレーション](/database/schema_and_migration/)の復習です。

**`backend/prisma/schema.prisma`**（末尾に追加）

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(100)
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**コード解説**

- `id Int @id @default(autoincrement())` — 自動採番される整数の主キーです
- `title String @db.VarChar(100)` — Todoの内容。DB側では最大100文字の可変長文字列になります
- `completed Boolean @default(false)` — 完了フラグ。作成時は未完了（false）から始まります
- `createdAt DateTime @default(now())` — 行の作成時に現在時刻が自動で入ります
- `updatedAt DateTime @updatedAt` — 行が更新されるたびにPrismaが自動で現在時刻に書き換えます

マイグレーションを実行して、このモデルを実際のテーブルとしてDBに反映します（→ [マイグレーションとは](/database/schema_and_migration/)）。

```bash
pnpm exec prisma migrate dev --name init
```

実行結果の例（抜粋）:

```
Applying migration `20260612010000_init`

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

`migrate dev` は「マイグレーションファイルの生成」「DBへの適用」「Prisma Clientの生成」を一度に行うのでした。本当にテーブルができたか、psqlで覗いて確認してみましょう（→ [psqlでの確認](/database/postgresql_setup/)）。

```bash
docker compose exec db psql -U postgres -d todoapp -c '\dt'
```

実行結果の例:

```
              List of relations
 Schema |        Name        | Type  |  Owner
--------+--------------------+-------+----------
 public | Todo               | table | postgres
 public | _prisma_migrations | table | postgres
(2 rows)
```

`Todo` テーブルが作成されていれば成功です（`_prisma_migrations` はPrismaが適用履歴を管理するためのテーブルです）。

## フロントエンド（React）プロジェクトを作る

最後にフロントエンドです。`fullstack-todo/` 直下に戻り、[Viteでのプロジェクト作成](/react/setup/)と同じ手順をpnpmで行います。

```bash
cd ..
pnpm create vite@5 frontend --template react-ts
```

**コマンド解説**

- `pnpm create vite@5` — Viteのプロジェクト作成ツール（create-vite）のバージョン5系を実行します。`npm create vite@5` のpnpm版です
- `frontend` — 作成するディレクトリ名です
- `--template react-ts` — React + TypeScriptのテンプレートを指定します。pnpmでは `--` の区切りは不要です

実行結果の例:

```
Scaffolding project in /Users/yourname/dev/fullstack-todo/frontend...

Done. Now run:

  cd frontend
  pnpm install
  pnpm run dev
```

表示されたとおりに実行します。

```bash
cd frontend
pnpm install
pnpm run dev
```

実行結果の例:

```
  VITE v5.4.8  ready in 285 ms

  ➜  Local:   http://localhost:5173/
```

ブラウザで `http://localhost:5173/` を開き、ViteとReactの初期画面が表示されれば成功です。確認できたら `Ctrl + C` で止めて構いません。

## 完成した構成と起動手順のまとめ

ここまでで、リポジトリは次の形になりました。

```
fullstack-todo/
├── .gitignore
├── compose.yaml          # PostgreSQL（Docker）
├── backend/              # NestJS + Prisma
│   ├── .env              # DB接続情報（Git管理外）
│   ├── prisma/
│   │   ├── schema.prisma # Todoモデル
│   │   └── migrations/   # マイグレーション履歴
│   ├── src/
│   └── package.json
└── frontend/             # React + Vite
    ├── src/
    └── package.json
```

開発時の起動手順は次の3つです。この形が**開発環境の標準形**であり、[SNS開発](/sns/nestjs/project_setup/)でもそのまま使います。

```bash
# ① データベースを起動（fullstack-todo/ で）
docker compose up -d

# ② APIを起動（別ターミナルで backend/ に移動して）
pnpm run dev

# ③ フロントを起動（さらに別ターミナルで frontend/ に移動して）
pnpm run dev
```

ターミナルを3つ（DBは起動したら閉じてよいので実質2つ）並べて使うことになります。VS Codeのターミナル分割機能（→ [ターミナルの使い方](/environment/terminal/)）を使うと便利です。

最後に、ここまでの成果をコミットしておきましょう（→ [基本コマンド](/git/basic_commands/)）。

```bash
cd ..
git add .
git commit -m "プロジェクトの初期セットアップ"
```

## 理解度チェック

**Q1. pnpmがnpmよりディスク効率が良い理由を説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

npmはプロジェクトごとに `node_modules/` へパッケージの実体をコピーするのに対し、pnpmはパッケージの実体をPC内の1か所（グローバルストア）にだけ保存し、各プロジェクトからはリンク（参照）を張るためです。

複数のプロジェクトで同じパッケージを使っても実体は1つで済むため、ディスク使用量が減り、2回目以降のインストールも高速になります。

</details>

**Q2. `npx prisma init` に相当するpnpmのコマンドを書いてください。**

<details markdown="1">
<summary>解答を見る</summary>

`pnpm dlx prisma init` です。

`pnpm dlx` は「パッケージをインストールせず、その場で一時的に実行する」コマンドで、npmの `npx` に相当します。なお、本文の手順のように、すでにプロジェクトの依存に入っているパッケージのコマンドを実行する場合は `pnpm exec prisma ...` を使います。

</details>

**Q3. `.env` をGitにコミットしてはいけない理由を2つ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

1. **秘密情報が漏れるため** — DBのパスワードなどが含まれており、リポジトリを見られると認証情報が流出します
2. **環境ごとに値が異なるため** — 開発環境・本番環境で接続先は変わります。コミットしてしまうと全員・全環境が同じ値を共有することになり、環境ごとの切り替えができなくなります

代わりに `.gitignore` に `.env` を追加し、必要な変数名の一覧は `README` や `.env.example` のような雛形ファイルで共有するのが一般的です。

</details>

**Q4. `pnpm exec prisma migrate dev --name init` は何を行うコマンドですか。3つ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

1. `schema.prisma` の内容（モデル定義）から、SQLのマイグレーションファイルを生成する
2. そのマイグレーションをデータベースに適用し、テーブルを作成・変更する
3. モデル定義に対応したPrisma Client（型付きのDBアクセスコード）を生成する

詳細は[モデル定義とマイグレーション](/database/schema_and_migration/)を参照してください。

</details>

**Q5. このプロジェクトの開発を再開するとき、最初に実行すべきコマンドは何ですか。また、それを忘れてAPIを起動するとどうなると考えられますか。**

<details markdown="1">
<summary>解答を見る</summary>

`docker compose up -d` でPostgreSQLを起動することです。

これを忘れると、APIがDBに接続できず、Prismaが「Can't reach database server at `localhost:5432`」のような接続エラーを出します。フルスタック開発では「エラーがどの層で起きているか」の切り分けが重要で、このエラーは「DB層が動いていない」ことを示しています。

</details>

## セルフレビュー

- [ ] pnpmとnpmの違い（ディスク効率・速度）を自分の言葉で説明できる
- [ ] `corepack enable pnpm` が何をするコマンドか説明できる
- [ ] `pnpm add` / `pnpm add -D` / `pnpm dlx` の使い分けができる
- [ ] compose.yamlの各行の意味を説明できる
- [ ] `DATABASE_URL` の各部分（ユーザー名・ホスト・ポート・DB名）がcompose.yamlのどの設定に対応するか説明できる
- [ ] Todoモデルの各フィールドと属性（`@id` / `@default` / `@updatedAt`）の意味を説明できる
- [ ] 「DB起動 → API起動 → フロント起動」の3ステップを何も見ずに実行できる

## 次のステップ

土台が完成しました。次の[バックエンド: Todo APIの実装](/fullstack-todo/nestjs/backend/)では、NestJSとPrismaを使って[セクションの概要](/fullstack-todo/)で設計した5つのエンドポイントを実装し、curlで動作確認します。

なお、このページで確立した「リポジトリ構成 + DB起動 + Prisma初期化」の手順は、[SNS開発のプロジェクトセットアップ](/sns/nestjs/project_setup/)でもほぼ同じ流れで繰り返します。手順の意味を理解しながら進めておくと、その時に迷わず進められます。
