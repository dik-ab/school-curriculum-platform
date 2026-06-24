---
title: ホーム
nav_order: 1
description: "プログラミング学習カリキュラム"
permalink: /
---

# プログラミング学習カリキュラム

プログラミング未経験から、半年でフルスタックのWebアプリケーション（SNS）を自分の手で設計・実装・テスト・デプロイできるようになるための学習カリキュラムです。

カリキュラムは2部構成です。

## 入門編

### 1. 環境構築

まずは開発環境を整えましょう。VS Codeのインストールから拡張機能の設定まで、丁寧に解説しています。

### 2. フロントエンド基礎

Webの基礎となるHTML/CSS/JavaScriptを学びます。視覚的なフィードバックを得られるので、プログラミングの楽しさを実感しながら学習できます。

### 3. TypeScript基礎

JavaScriptに型を追加したTypeScriptを学びます。入門編最後の大きな山です。TypeScriptを理解できれば、どんなプログラミング言語にもスムーズに移ることができます。

入門編の総仕上げとして[入門編最終問題](/final_project/)に取り組み、合格したらマスターコースに進みます。

## マスターコース（中級編）

入門編で身につけた基礎の上に、モダンなWebアプリケーション開発の技術を一つずつ積み上げ、最終的にSNSアプリケーションを構築します。

| 章 | 内容 |
|---|---|
| [Git/GitHub基礎](/git//) | バージョン管理、ブランチ、Pull Request |
| [React基礎](/react//) | コンポーネント、状態管理、API通信 |
| [バックエンド基礎（NestJS）](/backend//) | HTTP/REST、Controller/Service/DI、バリデーション |
| [Docker基礎](/docker//) | コンテナ、Dockerfile、docker-compose |
| [データベースとPrisma](/database//) | SQL、PostgreSQL、スキーマ設計、マイグレーション |
| [実践: フルスタックTodoアプリ](/fullstack-todo//) | フロント+API+DBを初めて通しで構築 |
| [コード品質と開発ツール](/tooling//) | Prettier、ESLint、エディタ連携 |
| [バックエンドテスト](/testing//) | Jestによる単体テスト、E2Eテスト |
| [CI/CD](/cicd//) | GitHub Actions、自動テスト・自動デプロイ |
| [AWSデプロイ](/aws//) | S3/CloudFront、ECS、RDS、SES、CDK（IaC） |
| [リアルタイム通信](/realtime//) | WebSocket、NestJS Gateway |
| [AI開発入門](/ai//) | LLMの基礎、Claude Code、CLAUDE.md、skills |
| [AIチャット開発（RAG）](/ai-chat//) | embeddings、pgvector、Claude APIでQ&Aボット構築 |
| [SNS開発（最終プロジェクト）](/sns//) | 認証・投稿・いいね・フォロー・チャット・デプロイまで全部 |

## 練習問題と回答コードについて

このカリキュラムには、各セクションごとに練習問題を用意しています。回答コードは、GitHubリポジトリの `practice/` ディレクトリに格納されています。

**注意：** GitHubはコード管理用のツールです。このカリキュラムでは回答コードの参照のために使用していますが、GitHubの使い方や仕組みについては中級編にて扱います。まずは回答コードを見て、理解することに集中してください。

リポジトリをクローンすることで、ローカル環境で回答コードを実行・確認できますが、今は「そういうものがあるんだな」という程度の理解で大丈夫です。

## コンテンツ

左側のサイドバーから各ページにアクセスできます。

**環境構築** - 開発を始めるための準備
- Mac版 VS Code セットアップガイド
- Windows版 VS Code セットアップガイド
- 拡張機能のセットアップ
- 初期設定（タイピング練習）

**フロントエンド基礎** - Webの基礎を学ぶ
- HTML/CSS基礎
- JavaScript基礎
