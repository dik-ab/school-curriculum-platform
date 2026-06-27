---
title: CIパイプラインを作る
parent: CI/CD
nav_order: 3
---

# CIパイプラインを作る

前のページでワークフローの書き方を学びました。このページではそれを実戦投入します。題材は、この後の[SNS開発（最終プロジェクト）](/sns/)と同じ構成——**NestJSのバックエンドとReactのフロントエンドを1つのリポジトリで管理する構成**です。ここに lint + test + build を自動実行するCIパイプラインを組み込み、Pull Requestでチェックが緑になるところまでを通しで実践します。

**パイプライン（pipeline）** とは、複数のチェックや処理を決まった順序・組み合わせで流す一連の流れのことです。「lintを通し、テストを通し、ビルドを通す」という処理の流れを、工場のパイプラインになぞらえてこう呼びます。

## 学習目標

- CIで実行すべき3つのチェック（lint / test / build）の役割を説明できる
- frontend / backend が同居するリポジトリに、ジョブを分けたCIを構築できる
- `working-directory` を使ってサブディレクトリのプロジェクトをCIで扱える
- Pull Requestを作成し、CIのチェック結果（緑のチェック）を確認できる
- CIが失敗したときに、原因を特定して修正できる

## 題材リポジトリの構成

次のような構成のリポジトリを想定します。SNS開発で使う構成の縮小版です。

```
sns-app/
├── backend/              # NestJS（API）
│   ├── src/
│   ├── test/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── ...
├── frontend/             # React + Vite
│   ├── src/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── ...
└── .github/
    └── workflows/
        └── ci.yml        # ← これから作る
```

ポイントは、backendとfrontendが**それぞれ独立したpnpmプロジェクト**（それぞれにpackage.jsonがある）だということです。NestJSプロジェクトの作り方は[NestJSのセットアップ](/backend/setup/)、Reactプロジェクトの作り方は[Reactのセットアップ](/react/setup/)で学んだとおりです。手元に両方そろったリポジトリがない場合は、それぞれのセットアップ手順で `backend/`・`frontend/` を作成してから進めてください。

## CIで回す3つのチェック

このCIパイプラインでは、次の3つを自動実行します。それぞれ役割が違うため、3つそろって初めて安心できます。

```mermaid
flowchart LR
    A[push / PR] --> B[lint<br>書き方の検査]
    A --> C[test<br>動作の検査]
    A --> D[build<br>成果物が作れるかの検査]
    B --> E{すべて成功?}
    C --> E
    D --> E
    E -->|Yes| F[緑のチェック ✓<br>マージしてよい]
    E -->|No| G[赤いバツ ✗<br>修正が必要]

    style A fill:#e3f2fd,stroke:#1565c0
    style F fill:#e8f5e9,stroke:#2e7d32
    style G fill:#fff3e0,stroke:#ef6c00
```

| チェック | コマンド | 何を保証するか | 学んだ場所 |
|---|---|---|---|
| lint | `pnpm run lint` | コードスタイルの統一、典型的なバグパターンの検出 | [ESLint](/tooling/eslint/) |
| test | `pnpm test` | コードが仕様どおりに動くこと | [単体テスト](/testing/unit_test/) |
| build | `pnpm run build` | TypeScriptの型エラーがなく、実行可能な成果物が作れること | [コンパイルとは](/typescript/compile/) |

「テストが通ればビルドも通るのでは？」と思うかもしれませんが、別物です。Jestはテスト実行時に型チェックを完全には行わない設定が一般的なため、**テストは通るのに `tsc` の型チェックで落ちる**コードはよくあります。逆に、ビルドが通っても（型は正しくても）ロジックが間違っていることもあります。だから両方を回します。

## 事前確認 — pnpm scriptsを手元で通す

CIに組み込むコマンドは、**まず手元で成功することを確認しておく**のが鉄則です。手元で失敗するコマンドはCIでも必ず失敗します。

backendディレクトリで確認します。NestJSプロジェクトには、[コード品質と開発ツール](/tooling/)で整備した次のscriptsがあるはずです。

**`backend/package.json`**（scripts部分の例）

```json
{
  "scripts": {
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest"
  }
}
```

```bash
cd backend
pnpm run lint
pnpm test
pnpm run build
```

3つとも成功すること（エラーなく終了すること）を確認してください。`pnpm run build` が成功すると `dist/` ディレクトリが生成されます。これが「ビルドの成果物」ですが、詳しくは[次のページ](/cicd/build_and_deploy_flow/)で扱います。

frontendディレクトリでも同様に確認します。

**`frontend/package.json`**（scripts部分の例）

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

```bash
cd frontend
pnpm run lint
pnpm test
pnpm run build
```

Viteプロジェクトの `build` は `tsc && vite build` となっており、**型チェック（tsc）とバンドル（vite build）の両方**を行います。つまりfrontendでは、buildを回すだけで型の検査も兼ねられます。ただし、型が正しくてもAPIクライアントのURL、Cookie付き通信、エラー処理が壊れることはあります。そのため、React共通フロントエンドではVitestで軽い単体テストも回し、frontendも lint + test + build の3つをCIに含めます。

## ワークフローを書く

それでは本題のワークフローです。backendとfrontendは独立したプロジェクトなので、**ジョブも分けます**。ジョブは並列に実行されるため、片方を待たずにもう片方のチェックが進み、結果も「backendが失敗」「frontendは成功」と切り分けて表示されます。

**`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: backend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm run build

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm run build
```

**コード解説**

- `name: CI` — ワークフロー名です。PR画面のチェック欄には「backend」「frontend」というジョブ名で表示されます
- `on:` — mainへのpushと、すべてのPRで起動します。前ページで学んだCIの定番構成です
- `jobs:` — `backend` と `frontend` の2つのジョブを定義します。**2つは別々のランナーで並列に実行されます**
- `defaults.run.working-directory: backend` — このジョブ内のすべての `run` コマンドを `backend/` ディレクトリで実行する、という指定です。これがないと、リポジトリのルート（package.jsonがない場所）で `pnpm install --frozen-lockfile` が実行されて失敗します。各ステップに `working-directory:` を個別に書くこともできますが、`defaults` でまとめる方が簡潔です
- `uses: actions/checkout@v4` — リポジトリ全体（backendもfrontendも）をランナーに取得します。`working-directory` は `run` にだけ効く設定なので、checkoutはルートに対して行われます
- `uses: pnpm/action-setup@v4` — ランナーにpnpm（バージョン10）をインストールします。次の `cache: 'pnpm'` がpnpmを必要とするため、`setup-node` より前に置きます
- `uses: actions/setup-node@v4` — Node.js 20を準備します
- `cache-dependency-path: backend/pnpm-lock.yaml` — pnpmキャッシュの鍵となるlockファイルの場所を指定します。lockファイルがルートにないリポジトリ構成では、この指定が必要です。これを忘れると「Dependencies lock file is not found」というエラーになります
- `run: pnpm install --frozen-lockfile` — `backend/pnpm-lock.yaml` どおりに依存をインストールします
- `run: pnpm run lint` → `run: pnpm test` → `run: pnpm run build` — 3つのチェックを順に実行します。**どれか1つでも失敗すると、その時点でジョブは失敗**になります。軽い（速く終わる）チェックを先に置くと、失敗時のフィードバックが早くなります
- `frontend` ジョブ — 構成はbackendと同じで、`working-directory` と `cache-dependency-path` が `frontend` を指します。React側では、APIクライアントやフォーム補助関数のような純粋なロジックをVitestでテストします

### 1ジョブにまとめてはだめなのか

backendとfrontendを1つのジョブで順に実行することもできます。しかしジョブを分けると、

- **並列実行**で全体の所要時間が短くなる
- PR画面で「どちらが失敗したか」が一目で分かる
- 将来、backendだけ変更されたときにfrontendのジョブをスキップする、といった最適化がしやすい

という利点があるため、独立したプロジェクトはジョブを分けるのが定石です。

## 動かしてみる — ブランチを切ってPRを出す

CIの真価はPull Requestで発揮されます。[GitHubとPull Request](/git/github_and_pr/)で学んだ流れに、CIがどう加わるかを体験しましょう。

### 1. ブランチを作ってワークフローをpushする

```bash
git switch -c add-ci
git add .github/workflows/ci.yml
git commit -m "Add CI workflow (lint + test + build)"
git push origin add-ci
```

### 2. Pull Requestを作成する

GitHubのリポジトリページを開くと「Compare & pull request」ボタンが表示されるので、PRを作成します。

PRを作成すると、ページ下部の「チェック欄」に注目してください。次のように表示が変化していきます。

1. **実行中**: 「Some checks haven't completed yet」と表示され、`backend` と `frontend` の横に黄色い丸（実行中マーク）が回る
2. **成功**: 「All checks have passed」に変わり、それぞれに**緑のチェックマーク ✓** が付く

```
✓ backend     — 1m 12s
✓ frontend    — 58s

All checks have passed
```

この緑のチェックが「lint・テスト・ビルドのすべてが、クリーンな環境で成功した」という機械によるお墨付きです。レビュアーはこれを前提に、コードの中身のレビューに集中できます。確認できたらPRをマージしましょう。マージによるmainへのpushでも、同じCIがもう一度実行されます。

### 3. わざと失敗させてみる

CIが本当に守ってくれるのか、わざと壊して確かめましょう。これは理解のためにとても有効な練習です。新しいブランチで、backendの適当なテストを失敗するように書き換えます。

```bash
git switch main
git pull origin main
git switch -c break-test
```

たとえば[単体テスト](/testing/unit_test/)で書いたテストの期待値を、わざと間違った値に変更してcommit & pushし、PRを作成します。すると、PRのチェック欄は次のようになります。

```
✗ backend     — 1m 05s
✓ frontend    — 57s

Some checks were not successful
```

`backend` の **Details** リンクをクリックすると、失敗したステップ（Test）のログが開き、手元でJestを実行したときと同じエラー出力が確認できます。

```
FAIL  src/posts/posts.service.spec.ts
  ● PostsService › findAll › should return all posts

    expect(received).toHaveLength(expected)

    Expected length: 3
    Received length: 2
```

このPRをこのままマージしてはいけないことが、レビューを待つまでもなく一目で分かります。期待値を元に戻してpushすれば、CIが自動で再実行され、緑に戻ります。確認できたらこの練習用PRはクローズして、ブランチを削除して構いません。

### 4. マージを機械的に防ぐ — ブランチ保護

ここまでの仕組みでも、実は「赤いバツのままマージする」操作自体は可能です。これを禁止したい場合は、GitHubの **ブランチ保護ルール（branch protection rule）** を設定します。

リポジトリの **Settings → Branches → Add branch ruleset**（または Add rule）で、mainブランチに対して「Require status checks to pass」（ステータスチェックの成功を必須にする）を有効にし、`backend` と `frontend` を必須チェックに指定します。これで、**CIが緑にならない限りマージボタンが押せなくなり**、壊れたコードがmainに入る経路が完全に塞がれます。チーム開発では必ず設定する項目です。

## CIが失敗したときの対処フロー

CIの失敗は日常的に起きるもので、悪いことではありません（マージ前に見つかったのだから、むしろCIが仕事をした証拠です）。対処は次の手順で行います。

1. PRまたはActionsタブから失敗したジョブを開き、**どのステップで失敗したか**を確認する（Lint / Test / Build のどれか）
2. エラーログを読む。ログは手元で同じコマンドを実行したときの出力と同じ
3. **手元で同じコマンドを実行して再現させる**（例: `cd backend && pnpm test`）
4. 修正してコミットし、同じブランチにpushする — CIは自動で再実行される

よくある失敗と原因も挙げておきます。

| 症状 | よくある原因 |
|---|---|
| `pnpm install --frozen-lockfile` で「lock file is not found」 | `cache-dependency-path` の指定漏れ、またはlockファイルをコミットし忘れている |
| 手元では通るのにCIでlintが落ちる | 手元でlintを実行し忘れたままpushした（CIの存在意義そのもの） |
| 手元では通るのにCIでbuildが落ちる | 手元のnode_modulesに古い型定義が残っている／Node.jsのバージョン違い。`node-version` と手元のバージョンを揃える |
| YAMLのsyntaxエラーでワークフロー自体が動かない | インデントのずれ。Actionsタブにパースエラーが表示されるので位置を確認する |

## 発展 — E2EテストとテストDB

[E2Eテスト](/testing/e2e_test/)で書いたsupertestによるテストは、PostgreSQLのテストDBに接続して動くものでした。これをCIで回すには、ランナー上にPostgreSQLを用意する必要があります。GitHub Actionsには、そのための **サービスコンテナ（service container）** という仕組みがあります。ジョブの実行中だけ、指定したDockerイメージのコンテナを起動して使える機能です（コンテナとイメージについては[Docker基礎](/docker/)を参照してください）。

backendジョブにE2Eテストを追加する場合は、次のように書きます。

**`.github/workflows/ci.yml`**（backendジョブに追記する部分）

```yaml
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U testuser"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 10
    defaults:
      run:
        working-directory: backend
    steps:
      # （checkout 〜 build までは同じ）

      - name: Migrate test DB
        run: pnpm exec prisma migrate deploy
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb

      - name: E2E test
        run: pnpm exec jest --config ./test/jest-e2e.json
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
```

**コード解説**

- `services:` — このジョブの実行中に起動しておくコンテナを定義します。ジョブが終わると自動で破棄されます
- `postgres:` — サービスの名前です（自由に付けられます）
- `image: postgres:16` — 起動するDockerイメージです。[PostgreSQLのセットアップ](/database/postgresql_setup/)でcomposeに書いたものと同じイメージ指定です
- `env:` — コンテナに渡す環境変数で、ユーザー名・パスワード・DB名を決めています。CI専用の使い捨てDBなので、値は何でも構いません
- `ports: - 5432:5432` — ランナー本体の5432番ポートをコンテナの5432番につなぎます。これでステップ内から `localhost:5432` で接続できます
- `options: --health-cmd ...` — **ヘルスチェック**の設定です。PostgreSQLは起動完了まで数秒かかるため、`pg_isready` で「接続を受け付けられる状態」になるまでGitHub Actionsが待ってからステップを開始します。これがないと「DBがまだ起動していないのにテストが始まって失敗する」事故が起きます
- `pnpm exec prisma migrate deploy` — E2Eの前に、まっさらなテストDBへマイグレーションを適用してテーブルを作ります。これがないと「テーブルが存在しない」エラーでテストが失敗します
- `pnpm exec jest --config ./test/jest-e2e.json` — ここでは `DATABASE_URL` をstepの `env` で直接渡すため、`dotenv -e .env.test` を通さずにjestを起動しています。CIのランナー上には `.env.test` が存在しないので、環境変数を直接渡す場合はこの形が分かりやすいです
- `env: DATABASE_URL: ...` — [Prismaのセットアップ](/database/prisma_setup/)で `.env` に書いていた接続文字列を、CIではstepの `env` で渡す対応関係です。別案として、CI上で一時的な `.env.test` を作ってから `pnpm run test:e2e` を実行する方法もあります。現在の[SNS開発のテスト](/sns/nestjs/testing/)では、ローカルと同じスクリプトを使うためにこの `.env.test` 生成方式を採用しています

CI上のDBは毎回まっさらに作られて捨てられるため、「前回のテストデータが残っていて結果が変わる」ことがありません。これもCIの再現性の一部です。

## 発展 — 変更があった側だけCIを動かす

リポジトリが大きくなると、「READMEを1行直しただけなのにbackendとfrontendの両方のCIが走る」のが無駄に感じられてきます。トリガーに **`paths`（パスフィルタ）** を付けると、指定したファイルが変更されたときだけワークフローを起動できます。

この場合は、ワークフローを `backend-ci.yml` と `frontend-ci.yml` の2ファイルに分割し、それぞれにpathsを付けるのが素直な構成です。

**`.github/workflows/backend-ci.yml`**（トリガー部分）

```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
```

**コード解説**

- `paths:` — 変更されたファイルがこのパターンに一致するときだけワークフローを起動します。`backend/**` は「backendディレクトリ以下のすべて」という意味です
- `.github/workflows/backend-ci.yml` 自身も含めているのは、**ワークフローファイルを修正したときにもCIを動かして、修正が正しいか確認するため**です。これを忘れると、ワークフローを書き換えても動作確認の機会がないままmainに入ってしまいます

ただし注意点があります。ブランチ保護ルールで `backend` ジョブを必須チェックにしている場合、frontendだけ変更したPRでは `backend` ジョブがそもそも起動せず、「必須チェックが終わらないのでマージできない」状態になり得ます。回避策（起動しなかったチェックの扱いの設定など）はやや高度なので、**学習中のリポジトリでは無理にpathsを使わず、全部回す構成で問題ありません**。CIの実行時間が気になり始めたときの選択肢として覚えておいてください。

## 発展 — READMEにステータスバッジを付ける

リポジトリのREADMEに、CIの状態を示す**バッジ（badge）**を貼ることができます。よく見る「passing」と書かれた緑のラベルがそれです。

**`README.md`**（先頭付近に追記）

```markdown
![CI](https://github.com/<ユーザー名>/<リポジトリ名>/actions/workflows/ci.yml/badge.svg)
```

**コード解説**

- `![CI](/cicd/.../)` — Markdownの画像記法です。URLの画像（バッジ）を表示します
- URLの末尾 `/actions/workflows/ci.yml/badge.svg` — ワークフローファイル名を指すと、GitHubが**最新の実行結果に応じた画像**（成功なら緑のpassing、失敗なら赤のfailing）を返してくれます
- `<ユーザー名>/<リポジトリ名>` — 自分のリポジトリに合わせて置き換えてください

バッジはActionsタブの各ワークフローページ右上の「…」メニュー →「Create status badge」からもコピーできます。リポジトリを開いた人に「このプロジェクトはCIで品質が守られている」とひと目で伝わるので、付けておく価値があります。

## 完成したパイプラインの全体像

このページで作った仕組みを図で振り返ります。

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant GH as GitHub
    participant B as ランナー1<br>(backendジョブ)
    participant F as ランナー2<br>(frontendジョブ)

    Dev->>GH: ブランチをpush / PR作成
    GH->>B: backendジョブ起動
    GH->>F: frontendジョブ起動（並列）
    B->>B: checkout → pnpm/Node.js準備 → pnpm install
    F->>F: checkout → pnpm/Node.js準備 → pnpm install
    B->>B: lint → test → build
    F->>F: lint → test → build
    B-->>GH: ✓ 成功
    F-->>GH: ✓ 成功
    GH-->>Dev: PRに「All checks have passed」
    Dev->>GH: 安心してマージ
```

開発者の操作は普段どおり「push してPRを出す」だけです。その裏で2台のランナーが並列にチェックを走らせ、結果がPRに集約されます。このCIは一度作れば、以降のすべての開発で動き続けます。

## 理解度チェック

**Q1. CIで lint・test・build の3つをすべて実行するのはなぜですか。テストだけでは不十分な理由を含めて答えてください。**

<details markdown="1">
<summary>解答を見る</summary>

3つは検査する対象が異なるからです。lintはコードスタイルと典型的なバグパターン、testはロジックが仕様どおり動くこと、buildは型エラーがなく成果物が生成できることを検査します。Jestは実行時に型チェックを厳密に行わないことが多いため、「テストは通るが `tsc` で型エラーになる」コードが存在し得ます。逆に型が正しくてもロジックが誤っていることもあります。それぞれ守備範囲が違うため、3つそろえて初めて広くカバーできます。

</details>

**Q2. `defaults.run.working-directory: backend` は何のための設定ですか。これがないと何が起きますか。**

<details markdown="1">
<summary>解答を見る</summary>

そのジョブ内のすべての `run` コマンドを `backend/` ディレクトリで実行させる設定です。この題材はリポジトリのルートではなく `backend/`・`frontend/` の中にそれぞれpackage.jsonがある構成なので、これがないと `pnpm install --frozen-lockfile` などがルートディレクトリで実行され、「package.jsonが見つからない」というエラーで失敗します。なお、この設定は `run` にのみ効くため、`uses`（checkoutなど）には影響しません。

</details>

**Q3. backendとfrontendを別ジョブに分ける利点を2つ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

(1) ジョブは別々のランナーで並列実行されるため、全体の所要時間が短くなる。(2) PRのチェック欄に「backend ✗ / frontend ✓」のように結果が分かれて表示されるため、どちらに問題があるかが一目で分かる。ほかにも、片方だけ再実行できる、将来の最適化（変更があった側だけ実行）がしやすい、といった利点もあります。

</details>

**Q4. PRのチェックが赤いバツになりました。修正してCIを再実行させるには何をすればよいですか。**

<details markdown="1">
<summary>解答を見る</summary>

失敗したジョブのログで原因のステップとエラー内容を確認し、手元で同じコマンド（例: `cd backend && pnpm test`）を実行して再現・修正します。修正をコミットして**同じブランチにpushするだけ**で、PRに紐づくCIは自動的に再実行されます。手動で再実行ボタンを押す必要はありません（コードを変えずに再実行したい場合のみ、ActionsタブのRe-run jobsを使います）。

</details>

**Q5. 「CIが緑にならない限りPRをマージできない」状態にするには、どんな設定をしますか。**

<details markdown="1">
<summary>解答を見る</summary>

GitHubのブランチ保護ルール（branch protection rule / ruleset）をmainブランチに設定し、「Require status checks to pass」を有効にして、必須チェックとして `backend`・`frontend` のジョブを指定します。これにより、指定したチェックがすべて成功するまでマージボタンが無効になり、壊れたコードがmainへ入る経路を機械的に塞げます。

</details>

**Q6. E2EテストをCIで動かすとき、サービスコンテナの `options` にヘルスチェック（`pg_isready`）を設定するのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

PostgreSQLのコンテナは、起動してから実際に接続を受け付けられるようになるまで数秒かかるからです。ヘルスチェックを設定すると、GitHub Actionsは `pg_isready` が成功する（＝DBが接続可能になる）まで待ってからステップの実行を始めます。これがないと、DBの起動が完了する前にE2Eテストが走り出し、「接続できない」というエラーで不安定に失敗（成功したりしなかったり）する原因になります。

</details>

## セルフレビュー

- [ ] lint / test / build がそれぞれ何を保証するチェックなのかを説明できる
- [ ] CIに組み込む前に、手元でpnpm scriptsが通ることを確認する理由を説明できる
- [ ] `working-directory` と `cache-dependency-path` がなぜ必要かを説明できる
- [ ] frontend / backend 構成のリポジトリ向けCIワークフローを、写経せずに書ける
- [ ] PRのチェック欄で実行中・成功・失敗の状態を見分けられる
- [ ] CIが失敗したとき、ログから原因のステップを特定し、手元で再現して修正できる
- [ ] ブランチ保護ルールでマージを制御できることを知っている

## 次のステップ

lint + test + build のCIパイプラインが完成し、Pull Requestが「機械のチェック済み」の状態でレビューに回る開発フローが手に入りました。このワークフローは[SNS開発（最終プロジェクト）](/sns/)でもそのまま使います。

ところで、CIの最後で実行している `pnpm run build` は、いったい**何を**作っているのでしょうか。次の[ビルドとデプロイの流れ](/cicd/build_and_deploy_flow/)では、この「ビルドの成果物」の正体を確かめ、それをユーザーに届けるCD（デプロイ自動化）の全体像へ進みます。
