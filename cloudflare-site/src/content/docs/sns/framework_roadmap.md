---
title: SNS開発ロードマップ（言語別）
parent: SNS開発（最終プロジェクト）
nav_order: 2
section_key: sns-common
section_title: SNS 共通仕様
---

# SNS開発ロードマップ（言語別）

このページでは、[共通要件定義・仕様書](/sns/requirements/)をどのバックエンドスタックで実装するかを選びます。フロントエンドは全スタック共通で React + Vite + TypeScript です。違うのはバックエンド、ORM、Migration、テスト、デプロイの書き方です。

> 迷ったら、まずは自分が学習中の言語スタックを選びます。比較学習をしたい場合は、同じ機能を2スタックで実装すると、Controller、Service、Repository、ORMの考え方がかなり見えます。

## スタックを選ぶ

<div class="course-grid wide">
  <a class="course-card project" data-accent="ink" href="/sns/nestjs/">
    <span>TypeScript</span>
    <h3>NestJS + Prisma</h3>
    <p>既存チュートリアルを土台に、HttpOnly Cookie仕様へ寄せる標準ルート。</p>
  </a>
  <a class="course-card project" data-accent="amber" href="/sns/spring_boot/">
    <span>Java</span>
    <h3>Spring Boot + JPA</h3>
    <p>Controller、Service、Repository、Security、JUnitまで実務寄りに学ぶ。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="/sns/fastapi/">
    <span>Python</span>
    <h3>FastAPI + SQLAlchemy</h3>
    <p>Pydantic、依存性注入、SQLAlchemy、Alembic、pytestでAPIを作る。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="/sns/laravel/">
    <span>PHP</span>
    <h3>Laravel + Eloquent</h3>
    <p>Laravelの認証、Form Request、Eloquent、Migration、Pestを使う。</p>
  </a>
  <a class="course-card project" data-accent="ink" href="/sns/gin_gorm/">
    <span>Go</span>
    <h3>Gin + GORM</h3>
    <p>薄いフレームワークで、ルーティング、middleware、DB、テストを自分で組む。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="/sns/rails/">
    <span>Ruby</span>
    <h3>Rails + Active Record</h3>
    <p>Rails API、Active Record、Cookieセッション、Action Cableを使う。</p>
  </a>
</div>

## 共通の章立て

各スタックの教材は、同じ順番で進めます。これにより、言語が違っても「今どの機能を作っているか」が揃います。

### 第1段階: 最低限SNS

| # | 章 | 作るもの | 共通知識 |
|---|---|---|---|
| 1 | セットアップ | API、DB、React、CORS、Cookie設定 | [Docker Compose](/docker/docker_compose/)、[React基礎](/react/) |
| 2 | 認証 | 登録、ログイン、ログアウト、HttpOnly Cookie | [HTTPとREST](/backend/http_and_rest/)、[DTOとバリデーション](/backend/dto_and_validation/) |
| 3 | 投稿 | 投稿作成、一覧、削除 | [CRUD](/database/crud_with_prisma/)、[fetchでAPI通信](/react/api_fetch/) |
| 4 | いいね | いいね、解除、件数表示 | [多対多リレーション](/database/relations/) |
| 5 | フォロー | フォロー、解除、フォロー中タイムライン | [リレーション](/database/relations/) |
| 6 | プロフィール | 表示名、自己紹介の更新 | [フォーム](/react/forms_and_lists/) |
| 7 | テスト | サービス単体またはE2E | [バックエンドテスト](/testing/) |

### 第2段階: 応用SNS

| # | 章 | 作るもの | 共通知識 |
|---|---|---|---|
| 8 | メール確認 | 確認トークン、メール送信 | [SES](/aws/ses/) |
| 9 | DMチャット | WebSocket、1対1 room、メッセージ保存 | [リアルタイム通信](/realtime/) |
| 10 | 画像アップロード | presigned URL、S3、プロフィール画像 | [S3](/aws/core_services/) |
| 11 | ページネーション | タイムラインの分割取得 | [SQL応用](/database/sql_applied/) |
| 12 | CI/CD | テスト、ビルド、自動化 | [CI/CD](/cicd/) |
| 13 | デプロイ | API、DB、フロントエンド公開 | [AWS](/aws/)、[Docker](/docker/) |

## 難易度と注意点

| スタック | 難易度 | 注意点 |
|---|---:|---|
| NestJS + Prisma | 低〜中 | 既存教材があるが、Cookieセッション仕様へ寄せる差分が必要 |
| Laravel + Eloquent | 低〜中 | 認証とCSRFの仕組みが強い。API + React分離の設定を丁寧に扱う |
| Rails + Active Record | 中 | Rails標準はサーバーレンダリング寄り。API専用 + React分離の説明が必要 |
| FastAPI + SQLAlchemy | 中 | 型と依存性注入は分かりやすいが、セッションやMigrationの責務分離を説明する |
| Spring Boot + JPA | 中〜高 | Security、DTO、例外処理、テストのコード量が多い |
| Gin + GORM | 高 | フレームワーク補助が少なく、middleware、validation、エラー整形を自分で設計する |

## 解答コードの扱い

解答コードはスタックごとに別リポジトリを推奨します。理由は、受講者が自分の学習スタックだけをcloneしやすく、CIやDockerfileもシンプルに保てるからです。

現在公開している解答コードは次の通りです。フロントエンドはReact共通、バックエンドはスタックごとに分けています。

| 役割 | リポジトリ |
|---|---|
| React共通フロントエンド | [curriculum-react-projects-answer](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns) |
| NestJS + Prisma バックエンド | [curriculum-sns-nestjs-answer](https://github.com/dik-ab/curriculum-sns-nestjs-answer) |
| Spring Boot + JPA バックエンド | [curriculum-sns-spring-answer](https://github.com/dik-ab/curriculum-sns-spring-answer) |

FastAPI、Laravel、Gin + GORM、Rails版はページ内に「作成予定」と明記し、完成後にリンクを追加します。

## 次のステップ

自分のスタックを選び、対応ページへ進んでください。初回は [共通要件定義・仕様書](/sns/requirements/) を手元のプロジェクトにも保存してから始めると、AIエージェントやレビュー時に仕様のぶれを防げます。
