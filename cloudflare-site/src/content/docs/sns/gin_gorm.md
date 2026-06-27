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

現在の解答コードは、学習しやすい最小構成として `main.go` にモデル、ルーティング、handler、middleware、Socket.IO処理をまとめています。最初からhandler/service/repositoryへ細かく分けると、Go初学者には「どこで何が起きているか」が見えにくくなるためです。

DBはローカル検証ではSQLiteを既定にし、`DATABASE_URL` が `postgres://` または `postgresql://` で始まる場合はPostgreSQLへ接続します。schema作成はGORMの `AutoMigrate` を使います。ログイン成功時は `sns_session` HttpOnly CookieにJWTを保存し、Gin middlewareでCookieを検証して現在のユーザーを復元します。

リアルタイムDMは、共通Reactフロントの `socket.io-client` と合わせるため、Go側でも `github.com/zishang520/socket.io/v2` を使います。namespaceは `/chat`、イベント名は `joinConversation`、`sendMessage`、`newMessage` です。

> 実務では、Goでも最初から巨大な抽象化を作る必要はありません。まず動く1ファイル構成でHTTP、DB、Cookie、リアルタイム通信の流れを確認し、その後にhandler/service/repositoryへ分割すると、責務分離の理由が理解しやすくなります。

## 第1段階: 最低限SNS

| 章 | Gin/GORMで作る主なファイル |
|---|---|
| セットアップ | `go.mod`、`main.go`、`Config`、DB接続、GORM `AutoMigrate` |
| 認証 | `User`、`EmailVerificationToken`、bcrypt、JWT Cookie、`requireUser` middleware |
| 投稿 | `Post`、`POST /posts`、`GET /posts`、280文字制限 |
| いいね | `Like`、複合主キー、いいね/解除は冪等な204 |
| フォロー | `Follow`、自己参照、フォロー/解除は冪等な204、フォロー中タイムライン |
| プロフィール | `PATCH /users/me`、表示名・bio・avatarUrlの文字列更新 |
| テスト | Go標準 `testing`、`httptest`、SQLite in-memory DB |

## 第2段階: 応用SNS

| 章 | Gin/GORMで扱う主な技術 |
|---|---|
| メール確認 | `EmailVerificationToken`、確認URLのconsole出力、確認後ログイン許可 |
| DMチャット | `github.com/zishang520/socket.io/v2`、`/chat` namespace、Cookie認証 |
| 画像アップロード | 現在の解答コードはローカル疑似アップロードURLまで。S3 presigned URLは発展課題 |
| ページネーション | 現在の解答コードには未収録。cursor queryは発展課題 |
| CI/CD | `go test ./...`、`go build ./...`、GitHub Actions |
| デプロイ | 現在の解答コードには未収録。multi-stage Dockerfile、ECS、RDSは発展課題 |

## ローカル起動の形

| 役割 | URL / コマンド |
|---|---|
| Gin API | `http://localhost:8000` / `go run .` |
| Socket.IO | `http://localhost:8000/chat` |
| SQLite | `sqlite://sns_gin_gorm.db` |
| React | `http://localhost:5173` |

React共通フロントエンドの `.env` は、Gin + GORM版では次の値にします。

```bash
VITE_API_URL="http://localhost:8000"
VITE_SOCKET_URL="http://localhost:8000"
```

PostgreSQLで動かす場合は、API起動時に `DATABASE_URL` を渡します。

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/sns_go?sslmode=disable" go run .
```

- `VITE_API_URL` はREST APIの向き先です。
- `VITE_SOCKET_URL` はSocket.IOの向き先です。Gin版はRESTとSocket.IOを同じポートで受けます。
- `DATABASE_URL` を省略すると、ローカル確認用のSQLiteファイルを使います。

## 小さな実装例

ログイン後のAPIを守るmiddlewareは、Cookieから現在のユーザーを復元します。

```go
func (a *App) requireUser(c *gin.Context) {
	user, err := a.userFromRequest(c.Request)
	if err != nil {
		abort(c, http.StatusUnauthorized, "ログインが必要です", "UNAUTHENTICATED")
		c.Abort()
		return
	}
	c.Set("user", user)
	c.Next()
}
```

- `func (a *App) requireUser(c *gin.Context)` は、Ginのmiddlewareとして使う関数です。
- `a.userFromRequest(c.Request)` は `sns_session` Cookieを読み、JWTを検証してDBからユーザーを取得します。
- エラー時は `401` と共通エラー形式を返し、`c.Abort()` で後続のhandlerを止めます。
- `c.Set("user", user)` で、後続のhandlerから現在のユーザーを取り出せるようにします。
- `c.Next()` で、認証済みの場合だけ次のhandlerへ進みます。

## 現在の解答コードの注意点

現在のGin + GORM解答コードは、教材としてローカルで投稿・いいね・フォロー・プロフィール・メール確認・リアルタイムDMを確認できることを優先しています。そのため、共通仕様の理想形より簡略化している箇所があります。

- handler、service、repositoryはまだ分割していません。責務分離は発展課題として、動く状態を確認した後に行います。
- MigrationはGORM `AutoMigrate` です。Atlas、golang-migrate、Gooseなどによる厳密なMigration管理は発展課題です。
- メール確認は確認URLをconsoleへ出力するローカル実装です。SES SDK、再送、期限切れ処理は発展課題です。
- 画像アップロードはローカル疑似URLの発行までです。S3 presigned URL、S3 CORS、ファイル検証は現在の解答コードには含めていません。
- CSRF対策はCORS許可オリジンと `SameSite=Lax` が中心です。状態変更APIごとの明示的なOrigin検証は発展課題です。
- Cookie内のJWTでセッションを管理します。DBセッション、失効リスト、refresh tokenは発展課題です。

## よくあるミス

- `VITE_SOCKET_URL` に `/chat` まで書いてしまうと、React側がさらに `/chat` を付けて接続先がずれます。値は `http://localhost:8000` にします。
- GinのCORSで `Access-Control-Allow-Origin: *` と `credentials: true` を組み合わせると、ブラウザがCookie付きリクエストを拒否します。開発中もフロントエンドのoriginを固定します。
- Socket.IOのroomに入る前に送信すると、相手画面に届かないことがあります。React側は会話を選んだ後に `joinConversation` を送ってから `newMessage` を購読します。

## 動作確認済みの範囲

- `go test ./...` で登録、メール確認、ログイン、投稿作成、いいね、フォロー、会話作成、ログアウトCookie失効を確認
- `go build ./...` でビルドできることを確認
- 共通Reactフロントから、投稿作成、別ユーザーによるいいね更新、別ブラウザコンテキスト間のリアルタイムチャット表示を確認
- CIではPR時に `go test ./...` と `go build ./...` を実行します。

## 練習問題

`requireUser` middlewareを使って、ログイン中ユーザーだけが呼べる `GET /auth/me` を実装してください。

要件:

- 未ログインなら `401` を返す
- ログイン済みなら `id`、`username`、`displayName`、`email` をJSONで返す
- React側から `credentials: "include"` で呼べること

<details>
<summary>解答例</summary>

```go
r.GET("/auth/me", a.requireUser, func(c *gin.Context) {
	user := c.MustGet("user").(User)
	c.JSON(http.StatusOK, gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"displayName": user.DisplayName,
		"email":       user.Email,
	})
})
```

- `a.requireUser` を先に通すため、未ログインのリクエストはhandler本体へ届きません。
- `c.MustGet("user").(User)` でmiddlewareが保存した現在のユーザーを取り出します。
- `c.JSON(http.StatusOK, ...)` でReactが扱いやすいJSONを返します。

</details>

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/sns)
- [Gin + GORM バックエンド](https://github.com/dik-ab/curriculum-sns-gin-gorm-answer)
