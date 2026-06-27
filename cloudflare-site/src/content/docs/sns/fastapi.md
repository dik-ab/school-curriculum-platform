---
title: FastAPI + SQLAlchemy版
parent: SNS開発（最終プロジェクト）
nav_order: 0
section_key: sns-fastapi
section_title: SNS FastAPI + SQLAlchemy版
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

FastAPI版の解答コードは、共通Reactフロントエンドとそのまま接続できるAPI互換性を優先します。認証は `sns_session` HttpOnly Cookieを読み取るDependencyとして実装し、React側は他スタックと同じく `credentials: "include"` でCookie送信をブラウザに任せます。

DB操作はSQLAlchemy 2.xで書きます。教材本文ではPostgreSQLへ広げる前提を残しますが、現在の解答コードはローカルで確実に動作確認しやすいよう、既定ではSQLite（`sqlite:///./sns_fastapi.db`）を使います。`DATABASE_URL` を差し替えればPostgreSQLにも接続できます。

リアルタイムDMは、React共通フロントが `socket.io-client` を使っているため、素のWebSocketではなく `python-socketio` のASGIサーバーで `/chat` namespaceを実装します。イベント名もReact側に合わせて `joinConversation`、`sendMessage`、`newMessage` に固定します。

## 第1段階: 最低限SNS

| 章 | FastAPIで作る主なファイル |
|---|---|
| セットアップ | `main.py`、`database.py`、Alembic、Docker Compose |
| 認証 | `auth/router.py`、`auth/service.py`、`get_current_user` dependency |
| 投稿 | `posts/router.py`、`posts/service.py`、SQLAlchemy query |
| いいね | `likes` 複合主キー、いいね/解除は冪等な204 |
| フォロー | self join、フォロー中タイムライン |
| プロフィール | Pydantic schema、部分更新 |
| テスト | pytest、TestClient、テストDB |

## 第2段階: 応用SNS

| 章 | FastAPIで扱う主な技術 |
|---|---|
| メール確認 | 開発用console mailer、確認トークン、確認後ログイン許可 |
| DMチャット | `python-socketio`、ASGI、`/chat` namespace、Cookie認証 |
| 画像アップロード | 現在の解答コードは互換用の簡易upload URL。S3 presigned URLは発展課題 |
| ページネーション | 現在の解答コードには未収録。cursor queryは発展課題 |
| CI/CD | pytest、Socket.IO統合テスト、GitHub Actions |
| デプロイ | ASGI server、Dockerfile、ECSは発展課題 |

## ローカル起動の形

| 役割 | URL / コマンド |
|---|---|
| FastAPI API | `http://localhost:8000` / `uvicorn app.main:socket_app --reload --port 8000` |
| Socket.IO | `http://localhost:8000/chat` namespace |
| DB | 既定は `./sns_fastapi.db`（SQLite） |
| React | `http://localhost:5173` |

React共通フロントエンドの `.env` は、FastAPI版では次の値にします。

```bash
VITE_API_URL="http://localhost:8000"
VITE_SOCKET_URL="http://localhost:8000"
```

> 実務では、WebSocketとSocket.IOは別物として扱います。React側がSocket.IOクライアントを使っている場合、バックエンドもSocket.IOプロトコルを話す必要があります。FastAPI版で `python-socketio` を使うのはこのためです。

## 現在の解答コードの注意点

現在のFastAPI回答コードは、教材としてローカルで投稿・いいね・フォロー・プロフィール・リアルタイムDMを確認できることを優先しています。そのため、共通仕様の理想形より簡略化している箇所があります。

- 既定DBはSQLiteです。PostgreSQLを使う場合は `DATABASE_URL` を差し替えます。
- MigrationはAlembicではなく `Base.metadata.create_all()` で作成しています。Alembic導入は発展課題です。
- パスワードハッシュは標準ライブラリのPBKDF2実装です。bcrypt/Argon2idへ差し替える課題を残しています。
- メール送信はconsole出力です。SES、再送、期限切れ処理は発展課題です。
- プロフィール画像はReact互換の簡易upload URLを返します。S3 presigned URLは発展課題です。
- ページネーション、通知、Dockerfile、AWSデプロイは未収録です。

## 動作確認済みの範囲

- `pytest` で投稿・いいね・フォロー・会話作成のAPIフローを確認
- `pytest` でUvicorn実サーバーを起動し、Socket.IOの `sendMessage` から `newMessage` が届くことを確認
- 共通Reactフロントから、投稿作成、別ユーザーによるいいね更新、別ブラウザコンテキスト間のリアルタイムチャット表示を確認

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [FastAPI + SQLAlchemy バックエンド](https://github.com/dik-ab/curriculum-sns-fastapi-answer)

FastAPI版は、薄く書ける一方でファイル分割の正解が複数あります。教材では「ルーターはHTTP、サービスは業務ロジック、モデルはDB」という分け方に固定します。
