---
title: Laravel + Eloquent版
parent: SNS Laravel + Eloquent版
nav_order: 0
section_key: sns-laravel
section_title: SNS Laravel + Eloquent版
---

# Laravel + Eloquent版

PHPでSNS APIを作るルートです。LaravelはRouting、Validation、Migration、Eloquent、Feature Testが標準で揃っているため、React分離構成のAPI教材として扱いやすいスタックです。

Laravel版の解答コードは、共通Reactフロントエンドと接続して、投稿、いいね、フォロー、プロフィール、メール確認、DMチャットまで動作確認しています。

- 解答リポジトリ: [curriculum-sns-laravel-answer](https://github.com/dik-ab/curriculum-sns-laravel-answer)
- 共通React: [curriculum-react-projects-answer](https://github.com/dik-ab/curriculum-react-projects-answer)

## 前提知識

- [PHP基礎](/php/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [リアルタイム通信](/realtime/)
- [共通要件定義・仕様書](/sns/requirements/)

## 現在の実装方針

Laravel版では、Laravel SanctumやReverbを前提にせず、教材として追いやすい最小構成にしています。

| 項目 | 採用内容 |
|---|---|
| Laravel | Laravel 13 |
| ORM | Eloquent |
| DB | SQLite |
| 認証 | `sns_session` HttpOnly Cookie + DB保存セッショントークン |
| メール確認 | `email_verification_tokens` table |
| リアルタイムDM | Workermanの素のWebSocket |
| React接続 | `VITE_REALTIME_DRIVER=websocket` |
| CI | `composer validate --strict`、`php artisan test`、`npm run build`、`php artisan route:list` |

認証は、ログイン時にランダムなトークンを発行し、DBにはSHA-256ハッシュだけを保存します。ブラウザには `sns_session` をHttpOnly Cookieとして渡し、APIとWebSocketサーバーの両方が同じCookieを検証します。

```text
login
-> plain session token を発行
-> session_tokens.token_hash に SHA-256 だけ保存
-> Set-Cookie: sns_session=...; HttpOnly; SameSite=Lax
-> API / WebSocket が Cookie を読んで現在のユーザーを復元
```

React共通フロントは既定ではSocket.IOを使います。ただしPHPでSocket.IO v4互換サーバーを教材向けに安定運用する選択肢が限られるため、Laravel版は共通Reactに追加したWebSocketアダプタを使います。画面、REST API、イベントの意味は他スタックと同じです。

## 起動手順

Laravel API:

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8010
```

リアルタイムDM:

```bash
composer ws
```

共通React:

```bash
VITE_API_URL=http://127.0.0.1:8010 \
VITE_SOCKET_URL=ws://127.0.0.1:8021 \
VITE_REALTIME_DRIVER=websocket \
pnpm run dev
```

## 第1段階: 最低限SNS

| 章 | Laravelで作る主なファイル |
|---|---|
| セットアップ | `.env.example`、`bootstrap/app.php`、`routes/web.php` |
| 認証 | `SnsController`、`SessionToken`、`EmailVerificationToken` |
| 投稿 | `Post` model、`posts` migration、`POST /posts`、`GET /posts` |
| いいね | `Like` model、unique制約、`firstOrCreate`、操作後のPost JSON |
| フォロー | `Follow` model、`firstOrCreate` / `delete`、操作後のProfile JSON |
| プロフィール | `PATCH /users/me`、`GET /users/:username` |
| テスト | `tests/Feature/SnsApiTest.php` |

最低限SNSでは、Laravelの標準セッションではなく、SNS仕様専用の `session_tokens` tableを使います。これにより、WebSocketプロセスからも同じCookieを検証しやすくなります。

## 第2段階: 応用SNS

| 章 | Laravelで扱う主な技術 |
|---|---|
| メール確認 | `email_verification_tokens`、`GET /auth/verify-email` |
| DMチャット | Workerman、`scripts/websocket-server.php`、`joinConversation`、`sendMessage` |
| CI/CD | GitHub Actions、Composer、PHPUnit |

## 実装ファイルの見方

| ファイル | 役割 |
|---|---|
| `app/Http/Controllers/SnsController.php` | REST APIの入口。認証、投稿、いいね、フォロー、会話をまとめる |
| `app/Http/Middleware/CorsMiddleware.php` | React dev serverからのcredentials付きリクエストを許可する |
| `database/migrations/2026_06_28_000001_create_sns_tables.php` | SNS用tableを作る |
| `scripts/websocket-server.php` | WorkermanでDM用WebSocketを起動する |
| `tests/Feature/SnsApiTest.php` | 登録からDM保存までのAPIフローを検証する |
| `.github/workflows/ci.yml` | PR/push時に検証を走らせる |

## 重要コード: セッショントークン

```php
$plainToken = bin2hex(random_bytes(32));

SessionToken::create([
    'user_id' => $user->id,
    'token_hash' => hash('sha256', $plainToken),
    'expires_at' => now()->addDays(7),
]);

return response()
    ->json(['message' => 'ログインしました'])
    ->withCookie(Cookie::make(
        'sns_session',
        $plainToken,
        60 * 24 * 7,
        '/',
        null,
        false,
        true,
        false,
        'Lax',
    ));
```

ここでは、DBに保存する値とブラウザに渡す値を分けています。DB漏えい時にそのままログインされないよう、保存値はハッシュにします。CookieはHttpOnlyなので、Reactは値を読みません。`fetch` の `credentials: "include"` により、ブラウザが自動でCookieを送ります。

## 動作確認済みの内容

ローカルで次を確認済みです。

- `composer validate --strict`
- `php artisan test`（4 tests / 32 assertions）
- `npm run build`
- `php artisan route:list --except-vendor`
- 共通React `pnpm run build`
- Playwright MCPで、Alice/Bobの2セッションを使った画面検証
  - メール確認後にログインできる
  - Aliceが投稿できる
  - Bobが投稿を見て、いいねできる
  - Alice/Bob間のDMがBob画面にリロードなしで届く

## 練習問題

1. `session_tokens` tableに `user_agent` と `ip_address` を追加し、ログイン時に保存してください。
2. `/auth/logout` で現在のセッションだけでなく、同じユーザーの全セッションを削除する `/auth/logout-all` を追加してください。
3. `GET /posts` を `cursorPaginate` に変更し、React側で次ページを読み込めるようにしてください。

## 解答の方向性

1. Migrationにnullableな `user_agent`、`ip_address` を追加し、`SessionToken::$fillable` とログイン処理を更新します。
2. `requireUser()` で現在ユーザーを取得し、`SessionToken::where('user_id', $user->id)->delete()` を実行します。
3. Laravel側は `cursorPaginate(20)` を返し、React側は `next_cursor` を保持して追加読み込みします。最初はAPIだけ先に実装し、curlでレスポンス形を固定すると進めやすいです。
