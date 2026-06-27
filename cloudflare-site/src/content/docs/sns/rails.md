---
title: Rails + Active Record版
parent: SNS Rails + Active Record版
nav_order: 0
section_key: sns-rails
section_title: SNS Rails + Active Record版
---

# Rails + Active Record版

Ruby on RailsでSNS APIを作るルートです。RailsはRouting、Active Record、Migration、Validation、Integration Testが揃っているため、CRUDとリレーションを短く実装できます。

Rails版の解答コードは、共通Reactフロントエンドと接続して、投稿、いいね、フォロー、プロフィール、メール確認、DMチャットまで動作確認しています。

- 解答リポジトリ: [curriculum-sns-rails-answer](https://github.com/dik-ab/curriculum-sns-rails-answer)
- 共通React: [curriculum-react-projects-answer](https://github.com/dik-ab/curriculum-react-projects-answer)

## 前提知識

- [Ruby基礎](/ruby/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [リアルタイム通信](/realtime/)
- [共通要件定義・仕様書](/sns/requirements/)

## 現在の実装方針

Rails版ではAPIモードを使い、Reactフロントエンドとは別アプリとして接続します。Rails標準の画面一体型構成にはせず、共通SNS仕様のJSON APIに合わせます。

| 項目 | 採用内容 |
|---|---|
| Rails | Rails 8.1 |
| ORM | Active Record |
| DB | SQLite |
| 認証 | `sns_session` HttpOnly Cookie + DB保存セッショントークン |
| メール確認 | `email_verification_tokens` table |
| リアルタイムDM | Faye WebSocket middleware |
| React接続 | `VITE_REALTIME_DRIVER=websocket` |
| CI | `bin/rails test`、`bin/rails zeitwerk:check`、`bin/rails routes` |

RailsにはAction Cableがありますが、共通Reactフロントエンドと同じJSONイベントで検証しやすいよう、この解答では `/chat` にFaye WebSocket middlewareを差し込んでいます。画面、REST API、イベントの意味はLaravel版と同じです。

## 起動手順

Rails APIとWebSocket:

```bash
bundle install
bin/rails db:prepare
bin/rails server -b 127.0.0.1 -p 8012
```

共通React:

```bash
VITE_API_URL=http://127.0.0.1:8012 \
VITE_SOCKET_URL=ws://127.0.0.1:8012 \
VITE_REALTIME_DRIVER=websocket \
npm run dev
```

## 第1段階: 最低限SNS

| 章 | Railsで作る主なファイル |
|---|---|
| セットアップ | `rails new --api`、`config/application.rb`、`config/routes.rb` |
| 認証 | `SnsController`、`SessionToken`、`EmailVerificationToken` |
| 投稿 | `Post` model、`POST /posts`、`GET /posts` |
| いいね | `Like` model、unique index、`find_or_create_by!`、操作後のPost JSON |
| フォロー | `Follow` model、self association、操作後のProfile JSON |
| プロフィール | `PATCH /users/me`、strong parameters相当の入力制御 |
| テスト | `test/integration/sns_api_test.rb` |

最低限SNSでは、RailsのCookie sessionではなく、SNS仕様専用の `session_tokens` tableを使います。これにより、REST APIとWebSocket middlewareが同じ認証方式を共有できます。

## 第2段階: 応用SNS

| 章 | Railsで扱う主な技術 |
|---|---|
| メール確認 | `email_verification_tokens`、`GET /auth/verify-email` |
| DMチャット | Faye WebSocket、`joinConversation`、`sendMessage` |
| 画像アップロード | 開発用PUT URL、`/uploads/avatars/:filename` |
| ページネーション | 今後cursor方式に差し替え |
| CI/CD | GitHub Actions、Minitest、Zeitwerk check |
| デプロイ | Dockerfile、RDS、WebSocket対応のPuma構成を追加予定 |

## 実装ファイルの見方

| ファイル | 役割 |
|---|---|
| `app/controllers/sns_controller.rb` | REST APIの入口。認証、投稿、いいね、フォロー、会話をまとめる |
| `app/controllers/application_controller.rb` | CORS、Cookie認証、共通エラー処理を置く |
| `db/migrate/20260628000001_create_sns_tables.rb` | SNS用tableを作る |
| `lib/chat_socket_server.rb` | `/chat` WebSocketをRack middlewareとして処理する |
| `test/integration/sns_api_test.rb` | 登録からDM保存までのAPIフローを検証する |
| `.github/workflows/ci.yml` | PR/push時に検証を走らせる |

## 重要コード: Active Recordの会話作成

```ruby
class Conversation < ApplicationRecord
  belongs_to :user_one, class_name: "User"
  belongs_to :user_two, class_name: "User"
  has_many :messages, dependent: :destroy

  def self.between(first_user, second_user)
    one_id, two_id = [first_user.id, second_user.id].sort
    find_or_create_by!(user_one_id: one_id, user_two_id: two_id)
  end
end
```

- `belongs_to :user_one, class_name: "User"` は、`user_one_id` が `users` tableを指すことをRailsに伝えます。
- `belongs_to :user_two` も同じく、2人目の参加者を表します。
- `has_many :messages` により、会話を削除したときに紐づくメッセージも削除できます。
- `between` では2人のIDを並べ替え、`alice-bob` と `bob-alice` が別会話にならないようにしています。
- `find_or_create_by!` は既存の会話があればそれを返し、なければ作成します。

> 実務では、1対1の会話、友達関係、ブロック関係のように「同じ2人の組み合わせを重複させたくない」場面がよくあります。IDをソートして保存する設計は、その重複を避けるための単純な方法です。

## 動作確認済みの内容

ローカルで次を確認済みです。

- `bin/rails test`（2 runs / 27 assertions）
- `bin/rails zeitwerk:check`
- `bin/rails routes`
- Playwright MCPで、Alice/Bobの2セッションを使った画面検証
  - Aliceが投稿できる
  - Bobが投稿を見て、いいねできる
  - Alice/Bob間のDMがBob画面にリロードなしで届く

## よくあるミス

- APIモードのRailsでCookie middlewareを戻していない  
  `cookies[:sns_session]` が読めず、すべて401になります。`config.middleware.use ActionDispatch::Cookies` を追加します。

- `Conversation.between` でIDを並べ替えていない  
  Aliceから始めた会話とBobから始めた会話が別レコードになります。

- WebSocket送信前にroomへ参加していない  
  送信データは保存されても、相手画面に即時配信されません。React側は会話選択後に `joinConversation` を送ります。

## 練習問題

1. `SessionToken` に `user_agent` と `ip_address` が保存されていることを、integration testで検証してください。
2. `Conversation.between` の重複防止が効いていることを、model testで確認してください。
3. `/posts` を50件固定ではなく、`before_id` クエリで古い投稿を追加取得できるようにしてください。

<details>
<summary>解答例</summary>

1. ログイン後に `SessionToken.last.user_agent` と `SessionToken.last.ip_address` をassertします。
2. `Conversation.between(alice, bob)` と `Conversation.between(bob, alice)` を呼び、返るIDが同じことをassertします。
3. `params[:before_id]` がある場合だけ `where("id < ?", params[:before_id])` を追加し、`order(id: :desc).limit(50)` で返します。

</details>
