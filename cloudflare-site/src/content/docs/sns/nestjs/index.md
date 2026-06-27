---
title: NestJS + Prisma版
parent: SNS NestJS + Prisma版
nav_order: 0
section_key: sns-nestjs
section_title: SNS NestJS + Prisma版
---

# NestJS + Prisma版

TypeScriptでバックエンドまで統一したい場合の標準ルートです。既存のSNSチュートリアルと解答コードがあるため、最初に整えるスタックとして最適です。

## 前提知識

- [TypeScript基礎](/typescript/)
- [NestJS基礎](/backend/)
- [Prisma導入](/database/prisma_setup/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

現在の解答コードとこの版の標準方針では、JWTを `sns_session` のHttpOnly Cookieに入れ、React側は `credentials: "include"` でCookie送信をブラウザに任せます。古い `localStorage` + `Authorization: Bearer` 方式は比較対象としてだけ扱い、通常の画面実装では使いません。

主な変更点は次の通りです。

| 項目 | 古い方式 | 現在の標準 |
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
| いいね | `LikesModule`、複合主キー、二重いいねは `409`、未いいね解除は `404` |
| フォロー | `UsersModule`、自己参照リレーション、二重フォローは `409`、未フォロー解除は `404`、フォロー中タイムライン |
| プロフィール | `UpdateProfileDto`、`PATCH /users/me` |
| テスト | `posts.service.spec.ts`、`follow.e2e-spec.ts` |

## 第2段階: 応用SNS

| 章 | NestJS解答コードで扱う主な技術 |
|---|---|
| メール確認 | MailModule、SES SDK、確認トークン |
| DMチャット | `@nestjs/websockets`、Socket.IO、Cookie認証のhandshake検証 |
| プロフィール画像 | `avatarUrl` の保存、S3 presigned URL発行処理 |
| CI/CD | pnpm、Prisma migrate、Jest |

ページネーション、AWSデプロイ、S3実バケットを使った画像アップロード完了確認は発展課題です。詳細チュートリアルには設計と手順を残していますが、解答リポジトリの標準確認範囲はローカルで投稿・いいね・フォロー・プロフィール・メール確認・リアルタイムDM・CIが動くところまでです。

## 動作確認済みの範囲

- `pnpm test` でServiceの単体テストを確認
- `pnpm build` でNestJSバックエンドをビルドできることを確認
- `pnpm run test:e2e` でHttpOnly Cookie認証、投稿、フォロー中タイムラインのE2Eフローを確認
- 共通Reactフロントから、投稿作成、別ユーザーによるいいね更新、別ブラウザコンテキスト間のリアルタイムチャット表示を確認
- CIではPR時に `pnpm test`、`pnpm build`、Prisma migration、`pnpm run test:e2e` を実行します。

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [NestJS + Prisma バックエンド](https://github.com/dik-ab/curriculum-sns-nestjs-answer)

## 次のステップ

既存の詳細手順から始める場合は [プロジェクトセットアップ](/sns/nestjs/project_setup/) へ進みます。認証では、まずJWT発行と `sns_session` HttpOnly Cookie、`JwtAuthGuard` によるCookie検証を実装します。
