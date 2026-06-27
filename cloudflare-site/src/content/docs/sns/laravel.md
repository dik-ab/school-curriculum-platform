---
title: Laravel + Eloquent版
parent: SNS開発（最終プロジェクト）
nav_order: 0
section_key: sns-laravel
section_title: SNS Laravel + Eloquent版
---

# Laravel + Eloquent版

PHPでSNS APIを作るルートです。Laravelは認証、Validation、Migration、ORM、テストが揃っているため、Webアプリ教材として扱いやすいスタックです。

## 前提知識

- [PHP基礎](/php/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

Laravelでは、Controller、Form Request、Model、Migration、Policyを使って実装します。React分離構成ではCookie、CORS、CSRFの設定が重要です。Laravel Sanctumを使う構成を標準候補にします。

## 第1段階: 最低限SNS

| 章 | Laravelで作る主なファイル |
|---|---|
| セットアップ | Laravelプロジェクト、`.env`、Migration、CORS設定 |
| 認証 | `AuthController`、Sanctum、HttpOnly Cookie、Form Request |
| 投稿 | `Post` model、`PostController`、Policy |
| いいね | pivot table、unique制約、Eloquent relationship |
| フォロー | self relationship、フォロー中タイムライン |
| プロフィール | `UpdateProfileRequest`、部分更新 |
| テスト | PestまたはPHPUnit、Feature Test |

## 第2段階: 応用SNS

| 章 | Laravelで扱う主な技術 |
|---|---|
| メール確認 | Notification、Mail、SES |
| DMチャット | Laravel ReverbまたはPusher互換、Broadcasting |
| 画像アップロード | Storage、S3 disk、temporary upload URL |
| ページネーション | cursorPaginate |
| CI/CD | Composer、Pest、Docker build |
| デプロイ | Dockerfile、ECS、RDS、queue設定 |

## 解答コード

推奨リポジトリ名: `sns-laravel-eloquent-answer`

Laravel版は、フレームワーク標準機能を使うほど短く書けます。ただし、React SPAとCookie認証を接続する部分は初学者が詰まりやすいため、CORS、CSRF、`credentials: "include"` を丁寧に説明します。
