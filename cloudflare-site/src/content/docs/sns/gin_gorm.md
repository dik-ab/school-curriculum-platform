---
title: Gin + GORM版
parent: SNS Gin + GORM版
nav_order: 0
section_key: sns-gin-gorm
section_title: SNS Gin + GORM版
---

# Gin + GORM版

Goで薄いWeb APIを作るルートです。Ginはルーティングとmiddlewareが中心で、LaravelやRailsのような大きな標準構成はありません。その分、設計判断を自分で書く練習になります。

## 前提知識

- [Go基礎](/go/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

Gin版では、handler、service、repository、model、middlewareを明示的に分けます。GORMでMigrationとリレーションを扱い、Cookie認証はmiddlewareとして実装します。

## 第1段階: 最低限SNS

| 章 | Gin/GORMで作る主なファイル |
|---|---|
| セットアップ | `main.go`、`config`、DB接続、AutoMigrateまたはMigration |
| 認証 | `auth_handler.go`、`session_middleware.go`、bcrypt |
| 投稿 | `post_handler.go`、`post_service.go`、`post_repository.go` |
| いいね | composite unique index、GORM error handling |
| フォロー | self relation、timeline query |
| プロフィール | binding、validation、部分更新 |
| テスト | `testing`、httptest、テストDB |

## 第2段階: 応用SNS

| 章 | Gin/GORMで扱う主な技術 |
|---|---|
| メール確認 | SES SDK、確認トークン |
| DMチャット | gorilla/websocketまたはnhooyr/websocket |
| 画像アップロード | AWS SDK for Go、presigned URL |
| ページネーション | cursor query |
| CI/CD | `go test`、Docker build |
| デプロイ | multi-stage Dockerfile、ECS、RDS |

## 解答コード

推奨リポジトリ名: `sns-gin-gorm-answer`

Gin版は最も難しいスタックです。便利な標準機能が少ないため、エラー形式、validation、認証middleware、依存注入風の組み立てを教材側で固定します。
