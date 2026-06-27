---
title: Rails + Active Record版
parent: SNS開発（最終プロジェクト）
nav_order: 0
section_key: sns-rails
section_title: SNS Rails + Active Record版
---

# Rails + Active Record版

Ruby on RailsでSNS APIを作るルートです。RailsはActive Record、Migration、Validation、テスト支援が強く、CRUDとリレーションを短く実装できます。

## 前提知識

- [Ruby基礎](/ruby/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

Rails版ではAPIモードを基本にし、Reactフロントエンドとは別アプリとして接続します。Cookieセッション、CSRF、CORSの設定が重要です。第2段階ではAction CableでDMチャットを扱います。

## 第1段階: 最低限SNS

| 章 | Railsで作る主なファイル |
|---|---|
| セットアップ | `rails new --api`、database設定、Migration |
| 認証 | `SessionsController`、`ApplicationController`、Cookie session |
| 投稿 | `Post` model、`PostsController` |
| いいね | `Like` model、unique index、association |
| フォロー | `Follow` model、self association |
| プロフィール | `UsersController`、strong parameters |
| テスト | RSpecまたはMinitest、request spec |

## 第2段階: 応用SNS

| 章 | Railsで扱う主な技術 |
|---|---|
| メール確認 | Action Mailer、SES |
| DMチャット | Action Cable、room設計 |
| 画像アップロード | Active Storage、S3 |
| ページネーション | cursorまたはgem利用 |
| CI/CD | bundle exec rspec、Docker build |
| デプロイ | Dockerfile、ECS、RDS |

## 解答コード

推奨リポジトリ名: `sns-rails-active-record-answer`

Rails版は実装量を短くできますが、Rails標準の画面一体型構成ではなく、React分離APIとして作る点を明確にします。
