---
title: Spring Boot + JPA版
parent: SNS開発（最終プロジェクト）
nav_order: 0
section_key: sns-spring-boot
section_title: SNS Spring Boot + JPA版
---

# Spring Boot + JPA版

Javaで実務的なWeb APIを作るルートです。コード量は多めですが、Controller、Service、Repository、DTO、例外処理、テストの責務分離をしっかり学べます。

## 前提知識

- [Java基礎](/java/)
- [Spring Bootへの橋渡し](/java/spring_boot_bridge/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

Spring Bootでは、JPA Entity、Repository、Service、Controllerに責務を分けます。認証はSpring Securityの全機能を一気に使うと重くなるため、教材では最初にCookieセッションを検証するFilterまたはInterceptorを作り、後半でSpring Securityへの置き換えを扱います。

## 第1段階: 最低限SNS

| 章 | Spring Bootで作る主なファイル |
|---|---|
| セットアップ | `build.gradle`、`application.yml`、Docker Compose、Flyway |
| 認証 | `UserEntity`、`SessionEntity`、`AuthController`、`AuthService`、Cookie認証Filter |
| 投稿 | `PostEntity`、`PostRepository`、`PostService`、`PostController` |
| いいね | `LikeEntity`、複合キー、重複時の409変換 |
| フォロー | `FollowEntity`、自己参照、フォロー中タイムライン |
| プロフィール | `UpdateProfileRequest`、Bean Validation |
| テスト | JUnit、Spring Boot Test、MockMvc |

## 第2段階: 応用SNS

| 章 | Spring Bootで扱う主な技術 |
|---|---|
| メール確認 | JavaMailSenderまたはSES SDK、確認トークン |
| DMチャット | `netty-socketio`、Socket.IO互換サーバー、Cookie認証 |
| 画像アップロード | AWS SDK for Java、presigned URL |
| ページネーション | Spring Data Pageableまたはcursor方式 |
| CI/CD | Gradle test、Docker build |
| デプロイ | Dockerfile、ECS、RDS、環境変数 |

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [Spring Boot + JPA バックエンド](https://github.com/dik-ab/curriculum-sns-spring-answer)
