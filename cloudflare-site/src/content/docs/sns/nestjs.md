---
title: NestJS + Prisma版
parent: SNS開発（最終プロジェクト）
nav_order: 20
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

既存の詳細手順は `localStorage` + `Authorization: Bearer` のJWT方式で書かれています。新しい言語別カリキュラムでは、共通仕様に合わせて `sns_session` のHttpOnly Cookie方式へ寄せます。

主な変更点は次の通りです。

| 項目 | 既存手順 | 新仕様 |
|---|---|---|
| ログイン状態 | JWTをlocalStorage保存 | セッションtokenをHttpOnly Cookie保存 |
| 認証Guard | Authorizationヘッダーを読む | Cookieを読み、Sessionテーブルを検証 |
| ログアウト | localStorage削除 | Session削除 + Cookie失効 |
| React fetch | Authorization付与 | `credentials: "include"` |

## 第1段階: 最低限SNS

| 章 | NestJSで作る主なファイル |
|---|---|
| セットアップ | `main.ts`、`app.module.ts`、`prisma/schema.prisma`、`PrismaModule` |
| 認証 | `AuthModule`、`AuthService`、`SessionService`、`CookieAuthGuard`、DTO |
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

推奨リポジトリ名: `sns-nestjs-prisma-answer`

既存コードは [public/practice/sns-app](/practice/sns-app/) にあります。言語別解答リポジトリを作るときは、このコードを土台にし、認証方式をHttpOnly Cookieへ更新します。

## 次のステップ

既存の詳細手順から始める場合は [プロジェクトセットアップ](/sns/project_setup/) へ進みます。新仕様へ完全対応する版では、最初にSessionテーブルとCookie認証を実装します。
