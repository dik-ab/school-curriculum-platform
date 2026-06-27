---
title: NestJS + Prisma版
parent: SNS開発（最終プロジェクト）
nav_order: 0
section_key: sns-nestjs
section_title: SNS NestJS + Prisma版
---

# NestJS + Prisma版

TypeScriptでバックエンドまで統一したい場合の標準ルートです。既存のSNSチュートリアルと回答コードがあるため、最初に整えるスタックとして最適です。

## 前提知識

- [TypeScript基礎](/typescript/)
- [NestJS基礎](/backend/)
- [Prisma導入](/database/prisma_setup/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

初期の詳細手順には `localStorage` + `Authorization: Bearer` のJWT方式で書かれている箇所が残っていました。現在の解答コードとこの版の標準方針では、JWTを `sns_session` のHttpOnly Cookieに入れ、React側は `credentials: "include"` でCookie送信をブラウザに任せます。

主な変更点は次の通りです。

| 項目 | 既存手順 | 新仕様 |
|---|---|---|
| ログイン状態 | JWTをlocalStorage保存 | JWTをHttpOnly Cookie保存 |
| 認証Guard | Authorizationヘッダーを読む | Cookieを読み、JWTを検証 |
| ログアウト | localStorage削除 | `/auth/logout` でCookie失効 |
| React fetch | Authorization付与 | `credentials: "include"` |

## 第1段階: 最低限SNS

| 章 | NestJSで作る主なファイル |
|---|---|
| セットアップ | `main.ts`、`app.module.ts`、`prisma/schema.prisma`、`PrismaModule` |
| 認証 | `AuthModule`、`AuthService`、`JwtAuthGuard`、`CurrentUser`、DTO |
| 投稿 | `PostsModule`、`PostsController`、`PostsService` |
| いいね | `LikesModule`、複合主キー、Prismaの一意制約エラー処理 |
| フォロー | `UsersModule`、自己参照リレーション、フォロー中タイムライン |
| プロフィール | `UpdateProfileDto`、`PATCH /users/me` |
| テスト | `posts.service.spec.ts`、`follow.e2e-spec.ts` |

## 第2段階: 応用SNS

| 章 | NestJSで扱う主な技術 |
|---|---|
| メール確認 | MailModule、SES SDK、確認トークン |
| DMチャット | `@nestjs/websockets`、Socket.IO、Cookie認証のhandshake検証 |
| 画像アップロード | S3 presigned URL、環境変数 |
| ページネーション | cursor pagination、Prisma query |
| CI/CD | pnpm、Prisma migrate、Jest |
| デプロイ | Dockerfile、ECS、RDS、Secrets Manager |

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [NestJS + Prisma バックエンド](https://github.com/dik-ab/curriculum-sns-nestjs-answer)

## 次のステップ

既存の詳細手順から始める場合は [プロジェクトセットアップ](/sns/project_setup/) へ進みます。認証では、まずJWT発行と `sns_session` HttpOnly Cookie、`JwtAuthGuard` によるCookie検証を実装します。
