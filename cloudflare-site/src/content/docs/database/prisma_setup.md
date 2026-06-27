---
title: Prismaの導入
parent: NestJS + Prisma
section_key: nestjs-prisma
section_title: NestJS + Prisma
nav_order: 3
---

# Prismaの導入

[前のページ](/database/postgresql_setup/)では、psqlから生のSQLでPostgreSQLを操作しました。このページでは、TypeScriptのコードからデータベースを操作するためのツール **Prisma（プリズマ）** を導入します。インストールから設定ファイルの読み解きまで、開発の土台を固めるページです。

## 学習目標

- ORMとは何か、なぜ生のSQLを直接書かずにORMを使うのかを説明できる
- Prismaを構成する3つの要素（schema.prisma / CLI / Prisma Client）の役割を説明できる
- NestJSプロジェクトにPrismaを導入し、初期設定を完了できる
- schema.prismaと.envの各行の意味を説明できる

## ORMとは何か

**ORM（Object-Relational Mapping、オーアールエム）**とは、データベースのテーブル（Relational）とプログラムのオブジェクト（Object）を対応づけ（Mapping）、**SQLを直接書かずにプログラミング言語の文法でデータベースを操作できるようにする**ツールです。

たとえば「idが1のユーザーを取得する」操作を比べてみましょう。

```sql
-- 生のSQL
SELECT * FROM users WHERE id = 1;
```

```typescript
// Prisma（TypeScript）
const user = await prisma.user.findUnique({ where: { id: 1 } });
```

どちらも結果は同じです。それでもORMを使うのには明確な理由があります。

ORMが「プログラムのオブジェクト」と「データベースのテーブル」をどう橋渡しするのか、イメージを図で押さえましょう。

```mermaid
flowchart LR
    subgraph APP["プログラムの世界（Object）"]
        O["user オブジェクト<br>user.id / user.name"]
    end
    subgraph DBW["データベースの世界（Relational）"]
        T["users テーブル<br>id 列 / name 列"]
    end
    O <-->|"ORMが対応づけ（Mapping）"| T
    style O fill:#e8f5e9,stroke:#2e7d32
    style T fill:#fff3e0,stroke:#ef6c00
```

**図の読み方**: 左がTypeScriptのオブジェクト、右がデータベースのテーブルです。ORMは両者を行き来する「翻訳係」で、私たちがオブジェクトを操作すると、ORMが対応するテーブルへのSQLに変換してくれます。この対応づけ（Mapping）こそがORMの名前の由来です。

### なぜORMを使うのか

1. **型安全** — Prismaは、テーブル定義からTypeScriptの型を自動生成します。`user.naem` のようなタイプミスや、存在しない列へのアクセスを**コンパイル時に**検出できます。生のSQLを文字列で書くと、間違いは実行するまで分かりません
2. **SQLインジェクションを防げる** — ユーザーの入力を文字列連結でSQLに埋め込むと、悪意ある入力でデータベースを攻撃される**SQLインジェクション**という脆弱性が生まれます。ORMは値の埋め込みを安全に処理してくれます
3. **エディタの補完が効く** — テーブル名・列名がすべて補完されるため、開発速度が上がります

ただし、前のページで生のSQLを学んだことは無駄ではありません。ORMは最終的にSQLを生成してデータベースに送るので、**「このコードはどんなSQLになるのか」を想像できる人**がORMを正しく使えます。

### Prismaとは

PrismaはNode.js/TypeScript向けのORMで、次の3つの要素から構成されます。本カリキュラムでは**Prisma 5系**を使います。

| 要素 | 役割 |
|---|---|
| **Prisma schema（schema.prisma）** | テーブル構造を定義する設計図ファイル |
| **Prisma CLI** | マイグレーションやコード生成を行うコマンドラインツール（`pnpm exec prisma ...`） |
| **Prisma Client** | スキーマから自動生成される、型安全なデータベース操作ライブラリ |

3つの関係を図で確認しましょう。

```mermaid
flowchart TB
    S["schema.prisma<br>（テーブルの設計図）"]
    S -->|"pnpm exec prisma migrate dev"| D[("PostgreSQL<br>テーブルを作成・変更")]
    S -->|"pnpm exec prisma generate"| C["Prisma Client<br>（型つきの操作ライブラリ）"]
    A["NestJSアプリ<br>（TypeScript）"] -->|"prisma.user.findMany() など"| C
    C -->|"SQL"| D
    style S fill:#e3f2fd,stroke:#1565c0
    style C fill:#e8f5e9,stroke:#2e7d32
    style D fill:#fff3e0,stroke:#ef6c00
```

ポイントは、**schema.prismaがすべての起点**になることです。設計図を1つ書けば、そこから「実際のテーブル」と「TypeScriptの型つきクライアント」の両方が生成されるため、データベースとコードの食い違いが起きません。

このうち、次のページで使う `prisma migrate dev` を実行したとき、裏側で何が順番に起きるのかを時系列で見ておきましょう。

```mermaid
sequenceDiagram
    participant Dev as "開発者"
    participant CLI as "Prisma CLI"
    participant File as "schema.prisma"
    participant DB as "PostgreSQL"
    participant Gen as "Prisma Client"
    Dev->>CLI: "prisma migrate dev を実行"
    CLI->>File: "設計図を読み込む"
    CLI->>DB: "テーブルを作成・変更（SQL）"
    DB-->>CLI: "完了"
    CLI->>Gen: "型つきクライアントを再生成"
    Gen-->>Dev: "コードから使える状態になる"
```

**図の読み方**: 上から下へ時間が流れます。1回の `migrate dev` で「DBのテーブル更新」と「Prisma Clientの再生成」が続けて行われるのがポイントです。だからスキーマを直すたびにこのコマンドを打てば、テーブルとコードの型が常に一致します。

## プロジェクトの準備

このセクションでは、[バックエンド基礎で作ったメモAPI](/backend/crud_practice/)のプロジェクトにPrismaを導入し、[CRUDのページ](/database/crud_with_prisma/)でメモをデータベースに永続化します。メモAPIのプロジェクト（`memo-api`）をVS Codeで開いてください。

また、[前のページ](/database/postgresql_setup/)の手順でPostgreSQLが起動していることを確認します。

```bash
docker compose ps
```

実行結果の例:

```
NAME         IMAGE         COMMAND                  SERVICE   CREATED        STATUS        PORTS
myapp-db-1   postgres:16   "docker-entrypoint.s…"   db        2 hours ago    Up 2 hours    0.0.0.0:5432->5432/tcp
```

`Up` でなければ `docker compose up -d` で起動しておきましょう。

## Prismaのインストール

メモAPIプロジェクトのルート（`package.json` のあるディレクトリ）で、pnpmを使って2つのパッケージをインストールします（pnpmの導入は[React基礎のセットアップ](/react/setup/)を参照）。

```bash
pnpm add -D prisma@5
pnpm add @prisma/client@5
```

実行結果の例:

```
dependencies:
+ @prisma/client 5.22.0

devDependencies:
+ prisma 5.22.0

Done in 8s
```

**コード解説**

- `prisma`（`-D`） — Prisma CLI本体です。マイグレーションやコード生成など**開発時にだけ**使うので、開発依存（devDependencies）に入れます
- `@prisma/client` — アプリの実行時にデータベースへ接続するライブラリです。**本番でも**使うので通常の依存（dependencies）に入れます
- `@5` — バージョンを5系に固定する指定です。Prismaはメジャーバージョンが変わると生成されるファイルや手順が変わってしまうため、本カリキュラムが前提とする5系を明示してインストールします

バージョンを確認しておきます。`pnpm exec` は、プロジェクトにインストール済みのコマンド（ここではPrisma CLI）を実行するための書き方です。

```bash
pnpm exec prisma --version
```

実行結果の例:

```
prisma                  : 5.22.0
@prisma/client          : 5.22.0
Computed binaryTarget   : darwin-arm64
...
```

`5.x` 系であれば問題ありません。

## prisma init — 初期設定ファイルの生成

次のコマンドで、Prismaの設定ファイル一式を生成します。

```bash
pnpm exec prisma init
```

実行結果の例:

```
✔ Your Prisma schema was created at prisma/schema.prisma
  You can now open it in your preferred editor.

Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database.
...
```

実行後、プロジェクトに次の2つが追加されます。

```
memo-api/
├── prisma/
│   └── schema.prisma   ← 新規: テーブルの設計図
├── .env                ← 新規: 接続情報などの環境変数
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   └── memos/          ← バックエンド章で作ったメモAPI
├── package.json
└── ...
```

生成された2つのファイルを順に読み解きましょう。

### schema.prisma を読み解く

**`prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**コード解説**

- `generator client { ... }` — 「スキーマから何を生成するか」の設定です。`prisma-client-js` は、TypeScript/JavaScript用のPrisma Clientを生成するという意味です
- `datasource db { ... }` — 「どのデータベースに接続するか」の設定です
- `provider = "postgresql"` — データベースの種類です。MySQLなら `"mysql"`、SQLiteなら `"sqlite"` と書きますが、本カリキュラムはPostgreSQLです
- `url = env("DATABASE_URL")` — 接続先のURLを、**環境変数 `DATABASE_URL` から読み込む**という指定です。接続情報をコードに直接書かない理由は後述します

この時点ではまだテーブルの定義（モデル）がありません。モデルは[次のページ](/database/schema_and_migration/)で書きます。

### .env を読み解く

**`.env`**

```
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

`.env` は**環境変数（environment variables、かんきょうへんすう）**を定義するファイルです。`prisma init` が生成した値はサンプルなので、自分の環境（[前のページ](/database/postgresql_setup/)のcompose.yaml）に合わせて書き換えます。

**`.env`**（書き換え後）

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/memo?schema=public"
```

接続URLの構造は次のとおりです。

```
postgresql://ユーザー名:パスワード@ホスト:ポート/データベース名?schema=public
              postgres   postgres  localhost 5432  memo
```

1本のURLに見えますが、実は5つの情報が決まった順番で並んでいます。各部分が何を指すのかを図で分解してみましょう。

```mermaid
flowchart TB
    URL["DATABASE_URL の中身"]
    URL --> U["postgres<br>（ユーザー名）"]
    URL --> P["postgres<br>（パスワード）"]
    URL --> H["localhost:5432<br>（ホスト:ポート）"]
    URL --> D["memo<br>（データベース名）"]
    URL --> S["schema=public<br>（名前空間）"]
    style URL fill:#e3f2fd,stroke:#1565c0
    style D fill:#e8f5e9,stroke:#2e7d32
    style H fill:#fff3e0,stroke:#ef6c00
```

**図の読み方**: いちばん上のURLが、下の5つの部品に分かれます。「誰が（ユーザー名・パスワード）」「どこに（ホスト:ポート）」「どのDBへ（データベース名）」つなぐか、という情報の集まりだと分かれば、接続エラーが出たときにどこを直せばよいか見当がつきます。

**コード解説**

- `postgres:postgres` — compose.yamlの `POSTGRES_USER` と `POSTGRES_PASSWORD` に対応します
- `localhost:5432` — composeで `ports: "5432:5432"` と公開したため、手元のPCからは `localhost:5432` で接続できます
- `memo` — `POSTGRES_DB` で作成したデータベース名です
- `?schema=public` — PostgreSQL内の名前空間の指定です。既定の `public` のままで構いません

### なぜ接続情報を.envに分けるのか

接続情報をコードに直接書かず環境変数にするのは、次の2つの理由からです。

1. **秘密情報をGitに含めないため** — 本番データベースのパスワードがGitHubに公開されたら大事故です。`.env` を [.gitignore](/git/basic_commands/) に入れておけば、リポジトリに混入しません
2. **環境ごとに接続先を切り替えるため** — 開発中はlocalhost、本番では[RDS](/aws/rds/)、と接続先が変わります。コードを変えずに `.env` だけ差し替えれば対応できます

`prisma init` は `.gitignore` に `.env` を自動追加してくれますが、必ず自分の目で確認してください。

**`.gitignore`**（一部）

```
# Prisma initが追記した行
.env
```

もし無ければ手で追記します。「秘密情報はコミットしない」はチーム開発の鉄則です。

### 接続確認

設定が正しいか、データベースに接続して確かめましょう。Prisma CLIの `db pull` は「データベースの現状を読み取ってスキーマに反映する」コマンドですが、ここでは接続確認として使えます。

```bash
pnpm exec prisma db pull
```

[前のページ](/database/postgresql_setup/)で作った `users` / `posts` テーブルが残っていれば、次のように表示されます。

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "memo", schema "public" at "localhost:5432"

✔ Introspected 2 models and wrote them into prisma/schema.prisma in 234ms
```

テーブルを削除済みの場合は次のような表示になりますが、これも「接続自体は成功している」ことを意味します。

```
The introspected database was empty
```

一方、接続情報が間違っていると `Authentication failed` や `Can't reach database server at localhost:5432` のようなエラーになります。その場合は `.env` の内容と、PostgreSQLコンテナが起動しているかを確認してください。

なお、`db pull` で `schema.prisma` にモデルが書き込まれた場合は、次のページで一から書き直すため、`generator` と `datasource` だけ残してモデル部分は削除しておいて構いません。

## VS Code拡張機能

Prismaの公式拡張機能「**Prisma**」（発行元: Prisma）をVS Codeにインストールしておきましょう。`schema.prisma` のシンタックスハイライト、補完、フォーマットが効くようになり、次ページ以降のモデル定義が格段に書きやすくなります。拡張機能ビューで「Prisma」と検索してインストールするだけです。

## 理解度チェック

**Q1. ORMを使う利点を、生のSQLを文字列で書く場合と比較して2つ以上挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

1. **型安全** — テーブル定義からTypeScriptの型が自動生成され、列名のタイプミスや型の間違いをコンパイル時に検出できる。生SQLの文字列は実行するまで間違いに気づけない
2. **SQLインジェクション対策** — ユーザー入力を文字列連結でSQLに埋め込む危険がなく、値が安全に処理される
3. **開発効率** — エディタでテーブル名・列名の補完が効く

一方で、ORMが裏でSQLを生成している以上、SQLの知識は引き続き必要です。

</details>

**Q2. `prisma` パッケージと `@prisma/client` パッケージの役割の違いを説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

- `prisma` — Prisma CLI。マイグレーション（`migrate dev`）やクライアント生成（`generate`）など、**開発作業のためのコマンド**を提供します。実行時には不要なのでdevDependenciesに入れます
- `@prisma/client` — アプリの**実行時に**データベースへ接続・操作するためのライブラリです。本番でも必要なのでdependenciesに入れます

</details>

**Q3. 次の接続URLの各部分は、compose.yamlのどの設定に対応していますか。**

```
postgresql://postgres:postgres@localhost:5432/memo?schema=public
```

<details markdown="1">
<summary>解答を見る</summary>

- 最初の `postgres`（ユーザー名） — `POSTGRES_USER: postgres`
- 2つ目の `postgres`（パスワード） — `POSTGRES_PASSWORD: postgres`
- `localhost:5432` — `ports: "5432:5432"` でホストに公開されたポート
- `memo` — `POSTGRES_DB: memo` で自動作成されたデータベース名
- `?schema=public` — PostgreSQLの既定の名前空間（composeとは無関係の固定値）

</details>

**Q4. データベースの接続URLを `.env` に書き、`.gitignore` に `.env` を追加するのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

接続URLにはデータベースのパスワードが含まれるためです。これをコードに直接書いてGitにコミットすると、リポジトリを見られる人すべてにパスワードが漏れます（公開リポジトリなら全世界に漏れます）。

`.env` に分離して `.gitignore` で除外すれば、秘密情報はリポジトリに含まれません。さらに、開発環境と本番環境で `.env` の中身を差し替えるだけで接続先を切り替えられるという利点もあります。

</details>

**Q5. schema.prismaの `datasource` ブロックと `generator` ブロックは、それぞれ何を設定するものですか。**

<details markdown="1">
<summary>解答を見る</summary>

- `datasource` — **どのデータベースに接続するか**の設定。データベースの種類（`provider = "postgresql"`）と接続URL（`url = env("DATABASE_URL")`）を指定します
- `generator` — **スキーマから何を生成するか**の設定。`provider = "prisma-client-js"` により、TypeScript用のPrisma Clientが生成されます

</details>

## セルフレビュー

- [ ] ORMとは何かを「Object」「Relational」「Mapping」の意味とあわせて説明できる
- [ ] Prismaの3要素（schema / CLI / Client）の役割と関係を図に描ける
- [ ] `pnpm add` から `prisma init` までの導入手順を写経せずに実行できる
- [ ] schema.prismaの `generator` と `datasource` の意味を1行ずつ説明できる
- [ ] DATABASE_URLの各部分が何を表すか説明できる
- [ ] `.env` を `.gitignore` に入れる理由を説明できる
- [ ] 接続エラーが出たとき、確認すべき箇所（.envの値、コンテナの起動状態）を言える

## 次のステップ

Prismaの土台ができました。次は、いよいよ `schema.prisma` にモデル（テーブルの設計図）を書き、マイグレーションで実際のテーブルを作成します。

- 前のページ: [PostgreSQLを起動して触ってみる](/database/postgresql_setup/)
- 次のページ: [スキーマ定義とマイグレーション](/database/schema_and_migration/)
- ここで設定した `.env` による接続情報の管理は、[AWSデプロイ](/aws/rds/)で本番データベースに接続するときにも同じ考え方で登場します
