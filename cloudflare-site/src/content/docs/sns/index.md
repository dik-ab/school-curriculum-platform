---
title: SNS開発（最終プロジェクト）
nav_order: 19
has_children: true
permalink: /sns/
section_key: sns-common
section_title: SNS 共通仕様
---

# SNS開発（最終プロジェクト）

このセクションは、Reactフロントエンドを共通にし、バックエンドだけを言語・フレームワークごとに差し替えて同じSNSを作る実践プロジェクトです。

このページには、全フレームワークの手順を混ぜません。共通仕様と各バックエンド版へのカードだけを置き、具体的な実装手順、使用ライブラリ、解答リポジトリ、動作確認手順は、選んだバックエンド版のページに分けます。

## 言語別SNS開発の進め方

まず [共通要件定義・仕様書](/sns/requirements/) で、画面、API、データモデル、認証方式、エラー形式を固定します。その後、作りたいバックエンド版のページを選びます。

<div class="course-grid wide">
  <a class="course-card project" data-accent="green" href="/sns/requirements/">
    <span>Common</span>
    <h3>共通要件定義・仕様書</h3>
    <p>全スタックで変えない仕様。HttpOnly Cookie認証、API、DB、完成条件を定義します。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="/sns/nestjs/">
    <span>TypeScript</span>
    <h3>SNS NestJS + Prisma版</h3>
    <p>詳細チュートリアルがある標準ルート。投稿、認証、リアルタイムDMまで実装します。</p>
  </a>
  <a class="course-card project" data-accent="amber" href="/sns/spring_boot/">
    <span>Java</span>
    <h3>SNS Spring Boot + JPA版</h3>
    <p>Spring MVC、JPA、AuthService、netty-socketioで同じSNS仕様をJavaで実装します。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="/sns/fastapi/">
    <span>Python</span>
    <h3>SNS FastAPI + SQLAlchemy版</h3>
    <p>Pydantic、SQLAlchemy、python-socketioで同じAPIとデータモデルを実装します。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="/sns/laravel/">
    <span>PHP</span>
    <h3>SNS Laravel + Eloquent版</h3>
    <p>Eloquent、HttpOnly Cookie、Workerman WebSocketで同じSNS仕様をPHPで実装します。</p>
  </a>
  <a class="course-card project" data-accent="ink" href="/sns/gin_gorm/">
    <span>Go</span>
    <h3>SNS Gin + GORM版</h3>
    <p>薄いフレームワークで、HTTP、DB、認証、WebSocketの責務を明確に分けます。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="/sns/rails/">
    <span>Ruby</span>
    <h3>SNS Rails + Active Record版</h3>
    <p>Rails API、Active Record、HttpOnly Cookie、WebSocket middlewareで同じSNS仕様を実装します。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="/ai/">
    <span>AI</span>
    <h3>AI開発入門</h3>
    <p>巨大な仕様をAIに渡し、実装やレビューの補助に使う方法を学びます。</p>
  </a>
</div>

## 共通仕様で固定するもの

| 項目 | 固定する内容 |
|---|---|
| フロントエンド | React + Vite + TypeScriptを共通フロントエンドとして使う |
| 認証 | `sns_session` のHttpOnly Cookieを標準にする |
| 基本機能 | 登録、ログイン、投稿、いいね、フォロー、プロフィール編集 |
| 応用機能 | メール確認、DMチャット、テスト、CI/CD。画像アップロードとデプロイは発展課題 |
| API | URL、HTTPメソッド、JSON形式、エラー形式 |
| DB | users、posts、likes、follows、conversations、messagesなどの役割 |

仕様が共通だからこそ、バックエンドを差し替えても同じReact画面で動作確認できます。

## サイドバーの分け方

各バックエンド版は、カードから個別ページとして開きます。サイドバーも版ごとに分けているため、NestJS版を開いたときにSpring Boot版や他言語版の手順が混ざる構成にはしません。

迷ったら、仕様は [共通要件定義・仕様書](/sns/requirements/) へ、実装は選んだスタックの個別ページへ戻ります。巨大な仕様をAIに渡して開発補助に使う場合は [AI開発入門](/ai/) も参照してください。
