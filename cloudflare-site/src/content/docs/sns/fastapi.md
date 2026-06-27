---
title: FastAPI + SQLAlchemy版
parent: SNS開発（最終プロジェクト）
nav_order: 22
---

# FastAPI + SQLAlchemy版

Pythonで型付きAPIを素早く作るルートです。Pydanticによる入力検証、SQLAlchemyによるDB操作、AlembicによるMigration、pytestによるテストを組み合わせます。

## 前提知識

- [Python基礎](/python/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

FastAPIでは、ルーター、Pydanticスキーマ、サービス関数、SQLAlchemyモデルを分けます。認証はDependencyとして実装し、Cookieから `sns_session` を読み取って現在のユーザーを返す形にします。

## 第1段階: 最低限SNS

| 章 | FastAPIで作る主なファイル |
|---|---|
| セットアップ | `main.py`、`database.py`、Alembic、Docker Compose |
| 認証 | `auth/router.py`、`auth/service.py`、`get_current_user` dependency |
| 投稿 | `posts/router.py`、`posts/service.py`、SQLAlchemy query |
| いいね | 複合Unique制約、IntegrityErrorの409変換 |
| フォロー | self join、フォロー中タイムライン |
| プロフィール | Pydantic schema、部分更新 |
| テスト | pytest、TestClient、テストDB |

## 第2段階: 応用SNS

| 章 | FastAPIで扱う主な技術 |
|---|---|
| メール確認 | SES SDKまたは開発用console mailer |
| DMチャット | WebSocket endpoint、Cookie認証 |
| 画像アップロード | boto3、presigned URL |
| ページネーション | cursor query |
| CI/CD | pytest、ruff、Docker build |
| デプロイ | ASGI server、Dockerfile、ECS |

## 解答コード

推奨リポジトリ名: `sns-fastapi-sqlalchemy-answer`

FastAPI版は、薄く書ける一方でファイル分割の正解が複数あります。教材では「ルーターはHTTP、サービスは業務ロジック、モデルはDB」という分け方に固定します。
