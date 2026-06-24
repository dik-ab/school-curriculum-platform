# School Curriculum Platform 実装方針

## 目的

既存のプログラミング学習カリキュラムを、Cloudflare Pagesで配信するスクール向け教材サイトとして再構成する。

既存教材の本文、コード例、図、練習問題、回答コードは失わない。移行の主目的は、内容の削減ではなく、受講者が迷わず学習できる導線、コース単位の見通し、読みやすい教材UIを作ることである。

## 基本方針

- 既存教材の内容は1ミリも削らない
- Markdown本文は原則として保持し、最終的にHTMLへ静的ビルドする
- 手作業のHTML量産は避け、コース情報と教材本文からテンプレートでHTMLを生成する
- Cloudflare Pagesで配信できる静的サイトとして作る
- Basic認証はCloudflare Pages FunctionsまたはCloudflare Workerで実装する
- 月次パスワード更新、LINE通知、AI教材質問サポートは後続フェーズで追加できる設計にする

## 推奨技術構成

### 教材サイト

- Astro
- Markdown / MDX
- TypeScript
- Cloudflare Pages
- Cloudflare Pages Functions

Astroを使う理由は、Markdown教材サイトと静的HTML出力に向いており、Cloudflare Pagesとの相性がよいためである。Reactを全面的に使わなくても、軽量な教材サイトを作れる。

### 認証

- Cloudflare Pages Functions middleware
- Cloudflare環境変数またはKV

最初は共有ID/共有パスワードのBasic認証で始める。

想定する環境変数:

```text
BASIC_USER
BASIC_PASSWORD
```

月次更新を自動化する場合は、Cloudflare KVに現在のパスワードハッシュを保存し、スケジュール処理からCloudflare APIを叩いて更新する。

### LINE通知

- LINE Messaging API
- 有料会員のLINE userIdをDBで管理
- 月次パスワード更新時に有料会員へ通知

LINE側が有料会員を自動判定するのではなく、こちらの会員DBで支払い状態とLINE userIdを紐づける。

### AI教材質問サポート

- LINE Webhook
- Cloudflare Worker
- Supabase PostgreSQL + pgvector
- Claude APIまたはOpenAI API

受講者がLINEで `[教材質問]` から始まるメッセージを送った場合のみAI回答する。

処理の流れ:

```text
LINEメッセージ
-> LINE Webhook
-> Cloudflare Worker
-> LINE署名検証
-> 有料会員判定
-> 入力制限/回数制限
-> 教材RAG検索
-> Claude API
-> LINE reply
```

Claude CodeやCodexのサブスク枠を第三者向けLINE botの裏側に使うことは避ける。規約、安定性、セキュリティの観点から、受講者向けAI返信はAPIで実装する。

## コース構成

販売単位は「全教材見放題」とする。商品を細かく分けず、サイト内の見せ方だけコース単位に整理する。

### 01 入門

- 環境構築
- HTML/CSS
- JavaScript
- TypeScript

### 02 フロントエンド

- React
- フォームと一覧
- API通信

### 03 バックエンド言語基礎

- TypeScript基礎
- Java基礎
- Python基礎
- PHP基礎
- Go基礎
- Ruby基礎

### 04 データベースとローカル開発

- データベースの考え方
- PostgreSQLを触る
- Docker基礎
- ローカルDB環境

このフェーズは言語非依存にする。RDB、SQL、PostgreSQL、Docker ComposeでローカルDBを立てる流れまでを扱い、Prisma、JPA、SQLAlchemy、Eloquent、Active RecordなどのORMは入れない。

ORMとMigrationはフレームワークごとに選択肢が変わるため、次の「フレームワーク実践」で扱う。

### 05 フレームワーク実践

- NestJS + Prisma
- Spring Boot + JPA / Flyway
- FastAPI + SQLAlchemy / Alembic
- Laravel + Eloquent / Laravel Migrations
- Gin + sqlc / GORM
- Rails + Active Record

各フレームワーク内でAPI、ORM、Migration、軽いテストまで扱う。たとえばPrismaはTypeScript/NestJSの文脈で扱い、共通のデータベース基礎としては扱わない。

### 06 実践開発

- フルスタックTodo
- SNS開発

TodoとSNSは、最終的に主要言語スタックごとに回答コードを用意する。

### 07 運用とAI

- CI/CD
- AWS
- Realtime
- RAGチャット
- AI開発
- アーキテクチャ基礎

## 画面設計

### ホーム

ホームには全コースを一覧表示する。受講者が現在のレベルに合う入口を選べるように、コースをカテゴリ別に並べる。

表示する情報:

- コース名
- 難易度
- 学習目安
- このコースのゴール
- 身につくこと
- 最初に読むページへのリンク

### コーストップ

各コースのトップページでは、教材本文に入る前に学習の見通しを示す。

表示する情報:

- コース名
- このコースのゴール
- 身につくこと
- 前提知識
- 作るもの
- レッスン一覧
- 関連するpracticeコードへのリンク

### 教材本文ページ

教材本文ページは、学習中に迷わないことを優先する。

構成:

- 左サイドバー: コース内レッスン一覧
- 中央: 本文
- 下部: 前へ / 次へ
- コードブロック: ファイル名、言語、コピー操作
- 注意・補足・理解度チェックを視覚的に分ける

## 移行手順

1. 既存リポジトリのMarkdown一覧を取得する
2. コース定義ファイルを作る
3. 既存Markdownを新しい`content/`へコピーする
4. frontmatterを新サイト用に補完する
5. practice配下の回答コードを丸ごと移行する
6. Markdown内リンクを新URL構造へ変換する
7. Mermaid、details、チェックリスト、コードブロックの表示を確認する
8. ページ数、見出し数、コードブロック数を移行前後で比較する
9. リンク切れチェックを行う
10. Cloudflare Pagesでビルド確認する

## 内容を失わないための検証

移行後に以下を比較する。

- Markdownページ数
- 見出し数
- コードブロック数
- Mermaidブロック数
- detailsブロック数
- practice配下のファイル数
- 内部リンク数

差分が出た場合は、移行ミスとして確認する。

## デモ段階で確認すること

まずは静的HTMLデモで以下を確認する。

- ホームからコースへ遷移しやすいか
- コーストップでゴールが伝わるか
- 教材本文が読みやすいか
- サイドバーの目次が邪魔にならないか
- コード例が埋もれないか
- スマホでも学習できるか

デザイン確認後、Astro実装へ進む。
