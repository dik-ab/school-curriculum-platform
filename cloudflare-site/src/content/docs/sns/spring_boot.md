---
title: Spring Boot + JPA版
parent: SNS Spring Boot + JPA版
nav_order: 0
section_key: sns-spring-boot
section_title: SNS Spring Boot + JPA版
---

# Spring Boot + JPA版

Javaで実務的なWeb APIを作るルートです。コード量は多めですが、Controller、Repository、Entity、DTO、例外処理、テストの責務分離をしっかり学べます。

## 前提知識

- [Java基礎](/java/)
- [Spring Bootへの橋渡し](/java/spring_boot_bridge/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [共通要件定義・仕様書](/sns/requirements/)

## 実装方針

現在の解答コードは、MavenベースのSpring Boot APIとしてローカルで動く範囲に絞っています。DBはDocker ComposeのPostgreSQL、APIは `./mvnw spring-boot:run`、Reactは共通フロントを使います。ログイン成功時は `sns_session` HttpOnly Cookieを発行し、各Controllerで `AuthService` から現在のユーザーを解決します。

Spring SecurityのFilter/Interceptor化、Flywayによる厳密なMigration、Dockerfile/ECS/RDSなどの本番デプロイは、現在の解答コードには含めていません。実務寄りに伸ばす場合の改善課題として扱います。

## 第1段階: 最低限SNS

| 章 | Spring Bootで作る主なファイル |
|---|---|
| セットアップ | `pom.xml`、`application.properties`、Docker Compose、JPA/Hibernate schema update |
| 認証 | `User`、`SessionToken`、`AuthController`、`AuthService`、HttpOnly Cookie |
| 投稿 | `Post`、`PostRepository`、`PostsController` |
| いいね | `Like`、一意制約、いいね/解除は冪等な204 |
| フォロー | `Follow`、自己参照、フォロー/解除は冪等な204、フォロー中タイムライン |
| プロフィール | `UpdateProfileRequest`、表示名・bio・avatarUrlの文字列更新 |
| テスト | JUnit、Spring Boot Test、MockMvc |

## 第2段階: 応用SNS

| 章 | Spring Bootで扱う主な技術 |
|---|---|
| メール確認 | `EmailVerificationToken`、確認URLのconsole出力、確認後ログイン許可 |
| DMチャット | `netty-socketio`、Socket.IO互換サーバー、`/chat` namespace、Cookie認証 |
| 画像アップロード | 現在の解答コードには未収録。`avatarUrl`へのURL保存のみ対応 |
| ページネーション | 現在の解答コードには未収録。Spring Data Pageableまたはcursor方式は発展課題 |
| CI/CD | `./mvnw test`、`./mvnw -DskipTests package`、GitHub Actions |
| デプロイ | 現在の解答コードには未収録。Dockerfile、ECS、RDS、環境変数は発展課題 |

## ローカル起動の形

| 役割 | URL / コマンド |
|---|---|
| PostgreSQL | `docker compose up -d` |
| Spring Boot API | `http://localhost:8000` / `./mvnw spring-boot:run` |
| Socket.IO | `http://localhost:8001/chat` |
| React | `http://localhost:5173` |

React共通フロントエンドの `.env` は、Spring版では次の値にします。

```bash
VITE_API_URL="http://localhost:8000"
VITE_SOCKET_URL="http://localhost:8001"
```

## 現在の解答コードの注意点

現在のSpring解答コードは、教材としてローカルで投稿・いいね・フォロー・プロフィール・リアルタイムDMを確認できることを優先しています。そのため、共通仕様の理想形より簡略化している箇所があります。

- セッションは `session_tokens` に保存しますが、現時点ではトークンハッシュ化と有効期限カラムまでは実装していません。
- `/auth/logout` はCookieを失効させます。DB上のセッショントークン削除は、発展課題として追加します。
- メール確認は確認URLをconsoleへ出力するローカル実装です。JavaMailSender、SES SDK、再送、期限切れ処理は発展課題として追加します。
- プロフィール画像は `avatarUrl` 文字列の保存までです。S3 presigned URLの発行、S3 CORS、画像アップロード処理は現在の解答コードには含めていません。
- CSRF対策はCORS許可オリジンと `SameSite=Lax` が中心です。状態変更APIごとの明示的なOrigin検証は、発展課題として追加します。
- ControllerからRepositoryを直接使っている箇所があります。大きくする場合はService層へ切り出します。

## 動作確認済みの範囲

- `./mvnw test` で登録、メール確認、ログイン、投稿作成、いいね、フォロー、会話作成のAPIフローを確認
- `./mvnw -DskipTests package` でビルド成果物を作成できることを確認
- 共通Reactフロントから、投稿作成、別ユーザーによるいいね更新、別ブラウザコンテキスト間のリアルタイムチャット表示を確認
- CIではPR時に `./mvnw test` と `./mvnw -DskipTests package` を実行します。Socket.IOサーバーはテスト環境で `SOCKET_IO_ENABLED=false` にして無効化します。

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [Spring Boot + JPA バックエンド](https://github.com/dik-ab/curriculum-sns-spring-answer)
