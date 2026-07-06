---
title: "Project 02: 共通認証基盤"
description: Amazon CognitoとOIDCで認証基盤「Lumina ID」を作り、既存アプリのユーザー移行と2アプリSSOまでやり切る。
nav_order: 3
section_key: advanced
section_title: 実務プロジェクト応用編
---

# Project 02: 共通認証基盤「Lumina ID」

Lumina Reserveが軌道に乗り、会社は会員向けポータル「Lumina Members」(予約履歴とポイントの確認)を追加することにしました。アプリごとに認証を別々に持つと、パスワードもユーザー情報も二重管理になります。そこでAmazon Cognitoを使った共通認証基盤「Lumina ID」を作り、ReserveとMembersをSSOでつなぎます。

- 仕様リポジトリ: [curriculum-project-auth-platform](https://github.com/dik-ab/curriculum-project-auth-platform)
- 目安: 4〜5週(AI駆動前提)
- 必要なもの: AWSアカウント(Cognitoは50,000 MAUまで無料、Lambdaも実質無料)

## このプロジェクトで身につくこと

SNSでは自前のJWT認証を実装しました。実務では、認証を**IdP(Identity Provider)に寄せる**構成が主流です。このプロジェクトはその移行を丸ごと経験します。

| テーマ | 具体的には |
| --- | --- |
| OAuth 2.0 / OIDC | Authorization Code + PKCEフローを自分のコードで完走させる |
| JWT検証 | JWKSの取得とキャッシュ、iss/aud/exp/署名の検証をmiddlewareとして書く |
| IaC | Terraformで User Pool、App Client、Hosted UIドメインを構築する |
| ユーザー移行 | User Migration Lambdaで、既存ユーザーをログイン時に無停止で移行する |
| SSO | 2つのアプリを1つのログインセッションでつなぎ、ログアウトも伝播させる |

「Cognito(またはAuth0/Keycloak)への移行」は実務案件として非常に多く、OIDCのフローを説明できるエンジニアは面接で強いです。

## 主な機能(Must)

- Terraformによる User Pool / App Client×2 / Hosted UI の構築
- フロントでのAuthorization Code + PKCEフロー(callback、token交換、refresh)
- バックエンドのJWT検証middlewareと、初回ログイン時のユーザー自動プロビジョニング
- User Migration LambdaによるReserve既存ユーザーの移行
- Lumina Members(ミニSPA: 予約履歴+ポイント)とSSO
- RP-Initiated Logoutによる両アプリからのログアウト

Lumina Reserveが未完成でも進められるよう、最小認証アプリで代替する手順を仕様リポジトリに用意しています。

## マイルストーン

| マイルストーン | 内容 | issue数 |
| --- | --- | --- |
| M1: OIDCを理解する + IaC | フロー読解(座学issue)、Terraformで User Pool構築、curlでtoken取得 | 4 |
| M2: 認証統合 | PKCEフロー実装、JWT検証middleware、自動プロビジョニング | 4 |
| M3: Reserve移行 | cognito_sub追加、User Migration Lambda、ログイン切替、移行検証 | 4 |
| M4: SSOとMembers | Members SPA、SSO確認、ログアウト伝播、Googleログイン | 4 |

M1の最初のissueは「フローを図で説明できるようになる」座学課題です。ここを飛ばすと後半で必ず詰まるので、AIに書かせず自分の言葉でまとめてください。

## 始め方

1. [仕様リポジトリ](https://github.com/dik-ab/curriculum-project-auth-platform)で「Use this template」→ 自分のリポジトリを作る
2. `project-onboarding` スキルで全体像を掴み、`setup-github-project` スキルでissueを複製する
3. `oidc-and-cognito` スキルにOIDC用語とCognitoの対応表、ハマりどころ一覧があります。実装前にAIに読ませてください

## 注意

AWSリソースを作ります。Cognito・Lambdaは無料枠内ですが、**学習が終わったら `terraform destroy` で削除**してください。手順は `docs/infra.md` にあります。

## 発展課題(advancedラベル)

MFA(TOTP)の有効化と、Pre Token Generation Lambdaによるカスタムクレーム追加がissueとして入っています。

## 次のステップ

完成したら、[メッセージ配信基盤](/advanced/notification_platform/)へ。3つ揃うと「プロダクト+認証基盤+配信基盤」という小さなマイクロサービス構成がポートフォリオになります。
