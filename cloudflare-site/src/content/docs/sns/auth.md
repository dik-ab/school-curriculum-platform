---
title: "NestJS版: ユーザー登録とログイン（JWT認証）"
parent: SNS開発（最終プロジェクト）
nav_order: 31
section_key: sns-nestjs
section_title: SNS NestJS + Prisma版
---

# ユーザー登録とログイン（JWT認証）

[プロジェクトセットアップ](/sns/project_setup/)で、`sns-app` の土台（PostgreSQLのコンテナ、NestJSのバックエンド、Viteのフロントエンド）が完成しました。このページからは、いよいよSNSの機能を1つずつ作っていきます。

最初に作るのは「ユーザー登録」と「ログイン」です。SNSの機能はほぼすべて「誰が操作しているのか」を前提にしています。投稿するのも、いいねするのも、フォローするのも「あなた」という特定のユーザーです。つまり認証（authentication、オーセンティケーション。読み「認証」＝本人確認）は、このプロジェクト全体の土台になります。

このページでは、次の3つの新しい概念を導入します。いずれもWeb開発の現場で毎日のように使われる重要な技術です。

- **bcrypt**（ビークリプト）— パスワードを安全に保存するためのハッシュ化ライブラリ
- **JWT**（JSON Web Token、ジョット）— ログイン状態をトークンで表現する仕組み
- **Guard**（ガード）— NestJSで「ログインしていないとアクセスできないAPI」を作る仕組み

## 学習目標

- パスワードを平文で保存してはいけない理由と、bcryptによるハッシュ化の仕組みを説明できる
- JWTの構造（ヘッダー・ペイロード・署名）と、署名が何を保証するのかを説明できる
- NestJSのGuardがリクエスト処理のどの段階で動くのかを理解し、JWT検証Guardを自作できる
- 登録・ログイン・認証付きAPIを実装し、curlとReact画面の両方から動作確認できる
- HttpOnly Cookieを使い、APIリクエストへ認証情報を安全に同送する仕組みを作れる

## パスワードをそのまま保存してはいけない

ユーザー登録では、メールアドレスとパスワードを受け取ってデータベースに保存します。ここで絶対にやってはいけないことがあります。**パスワードをそのまま（平文で）保存すること**です。

### 平文保存の何が危険か

「自分のデータベースなんだから、そのまま保存しても問題ないのでは」と思うかもしれません。しかし現実には、次のような事態が起こり得ます。

- **データベースの流出**: SQLインジェクションなどの攻撃、設定ミス、バックアップファイルの漏洩などで、データベースの中身が外部に流出する事故は、大企業でも繰り返し起きています。
- **内部犯行・のぞき見**: データベースにアクセスできる開発者や運用者は、平文ならば全ユーザーのパスワードを読めてしまいます。悪意がなくても「読める状態にある」こと自体が問題です。
- **パスワードの使い回し**: 多くの人は複数のサービスで同じパスワードを使い回しています。あなたのサービスから平文パスワードが漏れると、被害はあなたのサービスにとどまらず、ユーザーの銀行口座や他のSNSにまで及ぶ可能性があります。

つまり「漏れたら終わり」の情報を、漏れても致命傷にならない形に変換して保存する必要があります。そのための技術がハッシュ化です。

### ハッシュ化とは — 一方向の変換

ハッシュ化（hashing、ハッシング）とは、データを固定長の別の値（ハッシュ値）に変換することです。最大の特徴は**一方向性**で、元の値からハッシュ値を計算するのは簡単ですが、ハッシュ値から元の値を復元するのは（事実上）不可能です。

```
"password123"  →（ハッシュ関数）→  "ef92b778bafe771e..."
"ef92b778bafe771e..."  →（逆算）→  できない
```

暗号化（encryption、エンクリプション）とは違う点に注意してください。暗号化は「鍵があれば元に戻せる」変換ですが、ハッシュ化は誰にも（サービス運営者にも）元に戻せません。

「元に戻せないなら、ログイン時にどうやってパスワードを照合するのか」と疑問に思うかもしれません。答えはシンプルで、**入力されたパスワードを同じ方法でハッシュ化して、保存済みのハッシュ値と比較する**のです。同じ入力からは必ず同じハッシュ値が得られるので、一致すれば正しいパスワードだと分かります。

### 単純なハッシュ（SHA-256単体）では不十分な理由

ハッシュ関数というと、SHA-256（シャー256）のような汎用ハッシュ関数が有名です。しかし、パスワード保存にSHA-256を**そのまま**使うのは不十分です。理由は2つあります。

**理由1: レインボーテーブル攻撃**

SHA-256は「同じ入力 → 同じ出力」なので、よく使われるパスワードのハッシュ値は世界中で同じ値になります。攻撃者は「よくあるパスワードとそのハッシュ値の巨大な対応表」（レインボーテーブルと呼ばれます）を事前に用意しておき、流出したハッシュ値を表から逆引きします。`password123` のSHA-256ハッシュは一瞬で「逆算」されてしまいます。

**理由2: 総当たり攻撃が速すぎる**

SHA-256は高速に計算できるよう設計されています。これは通常の用途では長所ですが、パスワード保存では短所になります。最近のGPUはSHA-256を1秒間に数十億回計算できるため、短いパスワードなら総当たり（brute force、ブルートフォース。全パターンを片っ端から試す攻撃）で現実的な時間内に破られてしまいます。

### 対策: ソルトとストレッチング

この2つの問題には、それぞれ対応する古典的な対策があります。

- **ソルト（salt）**: ユーザーごとにランダムな文字列（ソルト）を生成し、パスワードに混ぜてからハッシュ化します。同じ `password123` でも、ユーザーごとにソルトが違うのでハッシュ値が変わります。これにより「事前に作った対応表」が役に立たなくなり、レインボーテーブル攻撃を無効化できます。
- **ストレッチング（stretching）**: ハッシュ計算をわざと何千回〜何万回も繰り返して、1回の計算を遅くします。正規のログインでは0.1秒程度の遅延は問題になりませんが、何十億回も試したい攻撃者にとっては致命的なコスト増になります。

### bcrypt — パスワード専用のハッシュ関数

ソルトの生成・保存やストレッチングを自前で正しく実装するのは大変です。そこで登場するのが **bcrypt**（ビークリプト）です。bcryptはパスワード保存のために設計されたハッシュ関数で、ソルトとストレッチングが最初から組み込まれています。

bcryptの使い方は、関数2つを覚えるだけです。

```typescript
import * as bcrypt from 'bcrypt';

// ハッシュ化: 第2引数の10は「コスト係数（ソルトラウンド）」
const hash = await bcrypt.hash('password123', 10);
console.log(hash);
// 例: $2b$10$N9qo8uLOickgx2ZMRZoMye.IjdQXvbqW1rT8sM3VuTzGmDqPq6F3W

// 照合: 平文とハッシュ値を渡すと、一致するかどうかを返す
await bcrypt.compare('password123', hash);   // true
await bcrypt.compare('wrong-password', hash); // false
```

**コード解説**

- `bcrypt.hash(平文, 10)` — ソルトを自動生成し、ハッシュ化した文字列を返します。`10` はコスト係数（ソルトラウンド）で、ストレッチングの強度です。数字が1増えると計算時間が約2倍になります。`10` が現在の一般的な推奨値です。
- 出力された `$2b$10$N9qo8uLOickgx2ZMRZoMye.IjdQXvbqW1rT8sM3VuTzGmDqPq6F3W` には、バージョン（`2b`）・コスト係数（`10`）・ソルト・ハッシュ値がすべて埋め込まれています。ソルトを別のカラムに保存する必要はありません。
- `bcrypt.compare(平文, ハッシュ)` — ハッシュ文字列からソルトとコスト係数を取り出し、平文を同じ条件でハッシュ化して比較します。戻り値は `boolean` です。
- どちらも時間のかかる処理なので `Promise` を返します。`await` を忘れないでください。

このプロジェクトでは「パスワードはbcrypt（コスト係数10）でハッシュ化し、`passwordHash` カラムに保存する。平文はどこにも保存しない」という方針で統一します。

## Userモデルとマイグレーション

それでは実装に入ります。まずはユーザーを保存するテーブルをPrismaで定義しましょう。モデル定義とマイグレーションの基本は[モデル定義とマイグレーション](/database/schema_and_migration/)で学んだ通りです。

**`backend/prisma/schema.prisma`**（`generator` と `datasource` の下に追記）

```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  username      String   @unique
  displayName   String
  passwordHash  String
  bio           String   @default("")
  avatarUrl     String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**コード解説**

- `email` / `username` — どちらも `@unique` を付け、重複登録をデータベースレベルで禁止します。`email` はログインに、`username` はURL（`/users/alice` など）やメンションに使う公開IDです。
- `displayName` — 画面に表示する名前です。`username` と違って日本語も重複も自由です。
- `passwordHash` — bcryptでハッシュ化したパスワードを保存します。カラム名を `password` ではなく `passwordHash` にすることで、「平文は保存しない」という意図をコードを読む全員に伝えます。
- `bio` / `avatarUrl` / `emailVerified` — 後の章で使う列も先に定義しておきます。`bio`（自己紹介文）と `avatarUrl`（プロフィール画像のURL）は[プロフィール編集と画像アップロード](/sns/profile_and_images/)で、`emailVerified` は[メールアドレス確認（SES）](/sns/email_verification/)で使います。先に定義しておくと、後の章でマイグレーションのやり直しが減ります。
- `createdAt` / `updatedAt` — 作成日時と更新日時です。`@updatedAt` を付けると、更新のたびにPrismaが自動で現在時刻を入れてくれます。

[プロジェクトセットアップ](/sns/project_setup/)で起動したDBコンテナが動いていることを確認して、マイグレーションを実行します。

```bash
cd sns-app/backend
pnpm exec prisma migrate dev --name add_user
```

実行結果の例:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "sns", schema "public" at "localhost:5432"

Applying migration `20260612090000_add_user`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260612090000_add_user/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

`User` テーブルが作成され、Prisma Clientの型も更新されました。これで `this.prisma.user.create(...)` のようなコードが型安全に書けるようになります（→ [Prisma ClientでCRUD](/database/crud_with_prisma/)）。

## セッションとトークン、JWTとは

次に「ログイン状態」をどう表現するかを考えます。

### HTTPはステートレス

[HTTPとREST](/backend/http_and_rest/)で学んだ通り、HTTPはステートレス（stateless、ステートレス。状態を持たない）なプロトコルです。サーバーはリクエストを処理し終えると、そのクライアントのことを忘れます。1回目のリクエストでログインに成功しても、2回目のリクエストでサーバーは「あなた誰でしたっけ」という状態に戻っています。

そこで「ログイン済みであること」を毎回のリクエストに添えて伝える仕組みが必要になります。代表的な方式は2つあります。

- **セッション方式**: ログイン時にサーバーが「セッションID」を発行してサーバー側にログイン情報を記録し、クライアントはセッションIDだけをCookie（クッキー）で送ります。サーバーは毎回、セッションIDをもとに自分の記録を照会します。状態は**サーバー側**にあります。
- **トークン方式**: ログイン時にサーバーが「このユーザーは本物です」と署名したトークン（通行証のようなデータ）を発行し、クライアントが毎回それを添えて送ります。サーバーは署名を検証するだけで、ログイン情報を覚えておく必要がありません。状態は**クライアント側**にあります。

このプロジェクトではトークン方式を採用します。サーバーがログイン状態を記録しなくてよいため実装と[スケール時の構成](/aws/ecr_ecs/)がシンプルになること、そしてトークン方式の標準である JWT を学ぶことが、現代のAPI開発の共通知識として価値が高いことが理由です。

### JWTの構造

**JWT**（JSON Web Token、読みは「ジョット」）は、JSONデータに署名を付けてやり取りするための標準フォーマット（RFC 7519）です。実物は次のような、ドット（`.`）2つで3分割された長い文字列です。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWxpY2UiLCJpYXQiOjE3NjU1MzYwMDAsImV4cCI6MTc2NTYyMjQwMH0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

3つの部分はそれぞれ次の役割を持ちます。

```mermaid
flowchart TB
    T["JWT = xxxxx.yyyyy.zzzzz<br>（ドットで3分割された文字列）"]
    T --> H
    T --> P
    T --> S
    H["1. ヘッダー（header）<br>alg: HS256, typ: JWT<br>署名アルゴリズムの種類など"]
    P["2. ペイロード（payload）<br>sub: 1, username: alice, exp: 1765622400<br>ユーザーID・有効期限などの中身"]
    S["3. 署名（signature）<br>ヘッダー + ペイロード + 秘密鍵 から計算<br>改ざんされていないことの証明"]
    style T fill:#e3f2fd,stroke:#1565c0
    style H fill:#e3f2fd,stroke:#1565c0
    style P fill:#e3f2fd,stroke:#1565c0
    style S fill:#fff3e0,stroke:#ef6c00
```

- **ヘッダー（header）**: 「どのアルゴリズムで署名したか」などのメタ情報をJSONで書き、Base64URLエンコードしたものです。Base64URL（ベースろくじゅうよんユーアールエル）とは、バイナリやテキストをURLに安全に含められる文字（英数字と `-` `_`）だけで表現するエンコード方式です。
- **ペイロード（payload）**: トークンに乗せたい中身です。このプロジェクトでは `sub`（subject、トークンの主体＝ユーザーID）と `username` を入れます。発行時刻 `iat` と有効期限 `exp` はライブラリが自動で入れてくれます。これもJSONをBase64URLエンコードしたものです。
- **署名（signature）**: ヘッダーとペイロードを連結し、**サーバーだけが知っている秘密鍵**を使って計算した値です。ペイロードを1文字でも書き換えると署名が一致しなくなるため、サーバーは「このトークンは自分が発行したもので、改ざんされていない」と検証できます。

ここで非常に重要な注意点があります。

> **JWTは暗号化ではありません。** ヘッダーとペイロードは単なるBase64URLエンコードであり、誰でもデコードして中身を読めます。試しに [jwt.io](https://jwt.io/) のようなデバッグツールにJWTを貼ると、中身がそのまま表示されます。署名が保証するのは「改ざんされていないこと」だけです。したがって、**パスワードやメールアドレスなどの秘密情報をペイロードに入れてはいけません**。

もう1つの注意は秘密鍵の管理です。秘密鍵（このプロジェクトでは環境変数 `JWT_SECRET`）が漏れると、攻撃者は「任意のユーザーになりすました正規のトークン」を自由に作れてしまいます。秘密鍵は[プロジェクトセットアップ](/sns/project_setup/)で作った `.env` に置き、Gitにコミットしない運用を徹底します（`.gitignore` の役割は[基本コマンド](/git/basic_commands/)で学びました）。本番環境ではAWSのSecrets Managerを使います（→ [RDSとSecrets Manager](/aws/rds/)。実際の組み込みは[AWSへの全体デプロイ](/sns/deploy/)で行います）。

### 登録からログイン、認証付きリクエストまでの流れ

これから作る仕組みの全体像をシーケンス図で確認します。登場するのは、ブラウザ（React）・API（NestJS）・DB（PostgreSQL）の3者です。

```mermaid
sequenceDiagram
    box rgb(227, 242, 253) クライアント
    participant C as ブラウザ（React）
    end
    box rgb(232, 245, 233) サーバー
    participant A as API（NestJS）
    end
    box rgb(255, 243, 224) データベース
    participant D as DB（PostgreSQL）
    end

    Note over C,D: 1. ユーザー登録
    C->>A: POST /auth/register（email, username, password ...）
    A->>A: bcrypt.hash でパスワードをハッシュ化
    A->>D: INSERT（passwordHash を保存）
    D-->>A: 作成された User
    A-->>C: 201 Created（id, email, username）

    Note over C,D: 2. ログイン
    C->>A: POST /auth/login（email, password）
    A->>D: email で User を検索
    D-->>A: User（passwordHash）
    A->>A: bcrypt.compare で照合
    A->>A: JWT を発行（JWT_SECRET で署名）
    A-->>C: 200 OK + Set-Cookie（sns_session）
    C->>C: HttpOnly Cookieとしてブラウザが保存

    Note over C,D: 3. 認証が必要なリクエスト
    C->>A: GET /auth/me（Cookie: sns_session）
    A->>A: Guard がCookie内JWTの署名と有効期限を検証
    A->>D: ユーザーIDで User を取得
    D-->>A: User
    A-->>C: 200 OK（プロフィール情報）
```

ポイントは3つです。

- 登録時、DBに保存されるのはハッシュ値だけです。平文パスワードはリクエストの処理が終わると消えます。
- ログイン成功時にAPIがJWTを発行し、`sns_session` というHttpOnly Cookieでブラウザへ渡します。JavaScriptからはCookieの中身を読まず、`fetch` の `credentials: "include"` でブラウザに送信を任せます。
- 認証付きリクエストでは、ハンドラの処理が始まる**前に** Guard がトークンを検証します。検証に失敗すればハンドラは実行されません。

## AuthModule の実装

それでは、バックエンドに認証機能を実装します。必要なパッケージを追加しましょう。

```bash
cd sns-app/backend
pnpm add bcrypt@5 @nestjs/jwt@10
pnpm add -D @types/bcrypt
```

`@10` や `@5` はメジャーバージョンの固定です。バージョンを指定しないと最新版（NestJS 11向けなど）が入り、NestJS 10系のプロジェクトとpeer dependencyの不整合を起こすことがあるため、本体に合わせたメジャーバージョンを明示します。

実行結果の例:

```
dependencies:
+ @nestjs/jwt 10.2.0
+ bcrypt 5.1.1

devDependencies:
+ @types/bcrypt 5.0.2

Done in 3.4s
```

- `bcrypt` — 先ほど学んだパスワードハッシュ化ライブラリ
- `@nestjs/jwt` — JWTの発行・検証を行うNestJS公式モジュール
- `@types/bcrypt` — `bcrypt` の型定義（開発時のみ必要なので `-D`）

> **注意: pnpm 10以降ではbcryptのビルドがブロックされます**
>
> pnpm 10以降は、セキュリティのためパッケージのネイティブビルドスクリプトをデフォルトでブロックします。bcryptはインストール時のビルドが必要なため、起動時に `MODULE_NOT_FOUND` エラーになる場合は、`backend/package.json` に次の設定を追加してから `pnpm install` をやり直してください。
>
> ```json
> "pnpm": {
>   "onlyBuiltDependencies": ["bcrypt"]
> }
> ```

なお、NestJSには認証ライブラリPassport（パスポート）を組み合わせる方法もありますが、このカリキュラムでは**あえて使いません**。仕組みをブラックボックスにせず、Guardを自分の手で書いて「認証がどう動いているか」を理解することを優先します。

### モジュール・コントローラ・サービスの生成

[Nest CLIによるプロジェクト作成](/backend/setup/)で使ったジェネレータで、authモジュール一式を生成します。

```bash
pnpm exec nest g module auth
pnpm exec nest g controller auth --no-spec
pnpm exec nest g service auth --no-spec
```

実行結果の例:

```
CREATE src/auth/auth.module.ts (81 bytes)
UPDATE src/app.module.ts (312 bytes)
CREATE src/auth/auth.controller.ts (97 bytes)
UPDATE src/auth/auth.module.ts (166 bytes)
CREATE src/auth/auth.service.ts (88 bytes)
UPDATE src/auth/auth.module.ts (240 bytes)
```

`--no-spec` はテストファイルを生成しないオプションです（テストは[SNSのテストを書く](/sns/testing/)でまとめて扱います）。`AppModule` への登録はCLIが自動で行ってくれます（Moduleの役割は[ServiceとDI](/backend/service_and_di/)を参照）。

### AuthModule — JwtModuleの設定

**`backend/src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

**コード解説**

- `JwtModule.register({...})` — `@nestjs/jwt` が提供する `JwtService` を使えるように設定します。
- `global: true` — `JwtService` をアプリ全体で（他のモジュールから `imports` しなくても）注入できるようにします。後の章（[DMチャット](/sns/chat/)など）でもトークン検証を使うため、グローバルにしておきます。[プロジェクトセットアップ](/sns/project_setup/)の `PrismaModule` を `@Global()` にしたのと同じ発想です。
- `secret: process.env.JWT_SECRET` — 署名用の秘密鍵です。`.env` の `JWT_SECRET="dev-secret-change-me"` が読み込まれます。
- `signOptions: { expiresIn: '1d' }` — 発行するトークンの有効期限を1日にします。有効期限が切れたトークンは検証で弾かれるため、仮にトークンが漏れても被害を時間的に限定できます。

### DTOの定義

リクエストボディの形と検証ルールをDTOで定義します（DTOと `class-validator` は[DTOとバリデーション](/backend/dto_and_validation/)で学びました。`ValidationPipe` は[プロジェクトセットアップ](/sns/project_setup/)でグローバル設定済みです）。

**`backend/src/auth/dto/register.dto.ts`**

```typescript
import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(/^[a-z0-9_]{3,20}$/, {
    message: 'usernameは英小文字・数字・アンダースコアの3〜20文字で入力してください',
  })
  username: string;

  @IsString()
  @Length(1, 50)
  displayName: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**`backend/src/auth/dto/login.dto.ts`**

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

**コード解説**

- `@IsEmail()` — メールアドレス形式かどうかを検証します。
- `@Matches(/^[a-z0-9_]{3,20}$/)` — `username` はURLに使うため、使える文字を正規表現で厳しく制限します。`message` オプションで日本語のエラーメッセージを返せます。
- `@MinLength(8)` — 短すぎるパスワードは総当たり攻撃に弱いため、最低8文字を要求します。
- `LoginDto` のパスワードに `@MinLength` を付けないのは意図的です。ログインは「保存済みハッシュと一致するか」だけが問題で、形式エラーと認証エラーを区別して返すと攻撃者へのヒントになり得るからです。

### AuthService — 登録とログインのロジック

**`backend/src/auth/auth.service.ts`**

```typescript
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailTaken) {
      throw new ConflictException('このメールアドレスは既に登録されています');
    }

    const usernameTaken = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (usernameTaken) {
      throw new ConflictException('このユーザー名は既に使われています');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName,
        passwordHash,
      },
    });

    return { id: user.id, email: user.email, username: user.username };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('メールアドレスまたはパスワードが正しくありません');
    }

    const payload: JwtPayload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, displayName: true, bio: true, avatarUrl: true },
    });
    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりません');
    }
    return user;
  }
}
```

`JwtPayload` 型はまだ作っていないので、先に作ります。トークンのペイロードの形をアプリ全体で統一するための型です。

**`backend/src/auth/jwt-payload.ts`**

```typescript
export type JwtPayload = {
  sub: number; // ユーザーID（JWTの慣習で subject の略）
  username: string;
};
```

**コード解説（AuthService）**

- `constructor(...)` — `PrismaService`（→ [NestJSへの組み込み](/database/crud_with_prisma/)）と `JwtService` をDIで受け取ります（→ [ServiceとDI](/backend/service_and_di/)）。
- `register` の重複チェック — `email` と `username` をそれぞれ `findUnique` で検索し、既に存在すれば `ConflictException` を投げます。これはHTTPステータス409（Conflict、リソースの競合）を返す例外です（ステータスコードは[HTTPとREST](/backend/http_and_rest/)を参照）。`@unique` 制約があるのでDBも重複を拒否しますが、先にアプリ側でチェックすることで、ユーザーに分かりやすいエラーメッセージを返せます。
- `bcrypt.hash(dto.password, 10)` — コスト係数10でハッシュ化します。このページ前半で学んだ通り、ソルトの生成も込みです。
- `return { id, email, username }` — **`passwordHash` を絶対にレスポンスに含めません**。`user` オブジェクトをそのまま `return user;` と返すとハッシュまで返ってしまうので、返すフィールドを明示的に絞ります。ハッシュは「元に戻せない」とはいえ、外に出してよい情報ではありません。
- `login` のエラーメッセージ — ユーザーが存在しない場合もパスワード不一致の場合も、**同じ「メールアドレスまたはパスワードが正しくありません」**を返します。「このメールアドレスは未登録です」と区別して返すと、攻撃者に「どのメールアドレスが登録済みか」を調べる手段（アカウント列挙攻撃と呼ばれます）を与えてしまうからです。あえて曖昧に返すのが定石です。
- `jwtService.signAsync(payload)` — ペイロードに署名してJWT文字列を生成します。秘密鍵と有効期限は `JwtModule.register` の設定が使われます。
- `me(userId)` — ログイン中ユーザー自身の情報を返します。`select` で返すカラムを明示し、ここでも `passwordHash` を除外しています（→ [include/select](/database/relations/)）。

### AuthController — エンドポイントの定義

**`backend/src/auth/auth.controller.ts`**

```typescript
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('sns_session', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { message: 'ログインしました' };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('sns_session', { path: '/' });
  }
}
```

**コード解説**

- `@Controller('auth')` + `@Post('register')` — `POST /auth/register` というルーティングになります（→ [ルーティングとパラメータ](/backend/controller/)）。
- `@Body() dto: RegisterDto` — リクエストボディが `RegisterDto` の形に合うかを `ValidationPipe` が自動検証し、違反していれば400 Bad Requestを返します。
- `@HttpCode(200)` — NestJSの `@Post` はデフォルトで201 Createdを返しますが、ログインは「リソースの作成」ではないので200 OKに変更します。登録（`register`）は新しいユーザーを作成するので、デフォルトの201のままにします。
- `@Res({ passthrough: true })` — NestJSのレスポンス処理を保ったまま、Expressの `Response` を使ってCookieだけを設定します。
- `res.cookie('sns_session', ...)` — ログイン成功時にJWTをHttpOnly Cookieとして発行します。JavaScriptから読めないため、XSSでトークンを抜かれにくくなります。
- `logout` — ログアウトではCookieを削除します。フロントエンド側でトークン文字列を管理しないため、削除対象は `sns_session` Cookieだけです。

まずここまでをcurlで確認しましょう。バックエンドを起動して（`pnpm run start:dev`）、別のターミナルから実行します。

```bash
curl -i -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","username":"alice","displayName":"アリス","password":"password123"}'
```

実行結果の例:

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":1,"email":"alice@example.com","username":"alice"}
```

同じ内容でもう一度実行すると、重複チェックが働いて `409 Conflict`（`{"message":"このメールアドレスは既に登録されています",...}`）が返ることも確認してください。続いてログインです。

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

実行結果の例:

```http
HTTP/1.1 200 OK
Set-Cookie: sns_session=eyJhbGciOiJIUzI1NiIs...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
Content-Type: application/json; charset=utf-8

{"message":"ログインしました"}
```

JWTはレスポンスボディではなく `sns_session` Cookieとして保存されます。パスワードを間違えると401が返ることも確認してください。

## Guardの初導入

ここからが本ページ最大の山場、**Guard**（ガード）です。

### Guardとは — ハンドラの手前に立つ関門

SNSのAPIの大半（投稿、いいね、フォローなど）は「ログイン済みユーザーだけが使える」ものです。すべてのハンドラの先頭に「Cookie内のJWTを検証して、無効なら401を返す」コードをコピペするのは現実的ではありません。NestJSはこの「リクエストがハンドラに届く前の関門」として、Guardという仕組みを用意しています。

[NestJSのアーキテクチャ](/backend/what_is_nestjs/)で、リクエストはModule・Controller・Serviceを通って処理されると学びました。より正確には、リクエストはコントローラのハンドラに届く前に、いくつかの処理段階を通過します。

```mermaid
flowchart LR
    R[リクエスト] --> M[Middleware<br>ミドルウェア] --> G[Guard<br>認可の関門] --> P[Pipe<br>ValidationPipe など] --> H[ハンドラ<br>Controller のメソッド]
    G -->|検証失敗| E[401 Unauthorized を返す<br>ハンドラは実行されない]
    style G fill:#e3f2fd,stroke:#1565c0
    style H fill:#e8f5e9,stroke:#2e7d32
    style E fill:#fff3e0,stroke:#ef6c00
```

- **Middleware**（ミドルウェア）— ルーティングの前に動く汎用処理です。[プロジェクトセットアップ](/sns/project_setup/)で設定したCORSもこの層で処理されます。
- **Guard** — 「このリクエストを通してよいか」を判定する関門です。今回作る認証チェックはここに置きます。
- **Pipe** — 入力データの変換と検証です。[DTOとバリデーション](/backend/dto_and_validation/)で学んだ `ValidationPipe` がここで動きます。

つまりGuardは**バリデーションよりも前**に実行されます。「誰なのか分からないリクエストは、中身を検証する前に門前払いする」という順序です。

### CanActivate と ExecutionContext

Guardの正体は、`CanActivate`（キャンアクティベート）というインターフェースを実装したクラスです。

- `canActivate(context)` というメソッドを1つだけ持ちます。`true` を返せばリクエストは先へ進み、`false` を返すか例外を投げれば、そこで処理が打ち切られます。
- 引数の `ExecutionContext`（エグゼキューションコンテキスト。実行文脈）は「いま処理中のリクエストに関する情報の入れ物」です。`context.switchToHttp().getRequest()` で、HTTPリクエストオブジェクト（ヘッダやボディを持つオブジェクト）を取り出せます。回りくどく見えますが、NestJSはHTTP以外（WebSocketなど）も同じGuardの仕組みで扱うため、「まずHTTPの文脈に切り替える」という手順を踏みます。この設計の恩恵は[DMチャット](/sns/chat/)で実感できます。

### JwtAuthGuard の実装

**`backend/src/auth/jwt-auth.guard.ts`**

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('認証トークンがありません');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      (request as Request & { user: JwtPayload }).user = payload;
    } catch {
      throw new UnauthorizedException('認証トークンが無効です');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') return token;
    return parseCookie(request.headers.cookie).sns_session;
  }
}

function parseCookie(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, decodeURIComponent(value.join('='))];
    }),
  );
}
```

**コード解説**

- `@Injectable()` — GuardもServiceと同じくDIコンテナに管理されるクラスなので、この装飾が必要です。これにより `JwtService` をコンストラクタで注入できます。
- `implements CanActivate` — 「このクラスはGuardです」という宣言です。`canActivate` メソッドの実装がTypeScriptによって強制されます。
- `context.switchToHttp().getRequest<Request>()` — 実行文脈からHTTPリクエストオブジェクトを取り出します。
- `extractToken(request)` — まずテストや手動curl用に `Authorization: Bearer ...` を見ます。通常のブラウザ利用では `request.headers.cookie` を解析し、`sns_session` CookieからJWTを取り出します。
- `parseCookie` — `Cookie` ヘッダは `key=value; key2=value2` という1本の文字列で届くため、分割してオブジェクトに変換します。フレームワークにCookie parserを追加してもよいですが、教材では何を読んでいるか分かるように小さく自作します。
- `if (!token)` — トークンがなければ401 Unauthorizedを投げます。Guardが例外を投げると、ハンドラは**実行されません**。
- `this.jwtService.verifyAsync<JwtPayload>(token)` — 署名と有効期限を検証します。検証に成功するとペイロード（`{ sub, username, iat, exp }`）が返り、改ざん・期限切れ・形式不正の場合は例外が投げられます。型引数 `<JwtPayload>` でペイロードの型を指定しています。
- `request.user = payload` — 検証済みのペイロードをリクエストオブジェクトに格納します。これで、後続のハンドラが「いま誰がリクエストしているか」を参照できるようになります。Expressの `Request` 型には `user` プロパティがないため、型を交差させて代入しています。
- `return true` — ここまで到達すれば検証成功です。リクエストはハンドラへ進みます。

### @CurrentUser() カスタムデコレータ

ハンドラから `request.user` を取り出すたびに `@Req()` でリクエスト全体を受け取るのは冗長です。NestJSの `createParamDecorator` を使うと、`@Body()` や `@Query()` のような**引数デコレータを自作**できます。

**`backend/src/auth/current-user.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
```

**コード解説**

- `createParamDecorator(factory)` — 引数デコレータを作る関数です。渡した関数の戻り値が、デコレータを付けた引数に渡されます。
- `_data` — `@CurrentUser('username')` のようにデコレータに渡した値が入りますが、今回は使わないため `_` 始まりの名前にしています。
- `context.switchToHttp().getRequest()` — Guardと同じ方法でリクエストを取り出し、Guardが格納した `request.user` をそのまま返します。

これで、以後どのハンドラでも次の定型で「認証必須＋ログイン中ユーザーの取得」が書けるようになります。この形は以降の章（[投稿](/sns/posts/)、[いいね](/sns/likes/)、[フォロー](/sns/follow/)など）で繰り返し登場します。

```typescript
@UseGuards(JwtAuthGuard)
@Post()
create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) { ... }
```

### GET /auth/me の実装

Guardの最初の利用者として、「ログイン中の自分の情報を返す」エンドポイントを追加します。

**`backend/src/auth/auth.controller.ts`**（importを追加し、クラスの末尾に `me` メソッドを追加）

```typescript
import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './jwt-payload';
// （AuthService と DTO の import は前のまま）

@Controller('auth')
export class AuthController {
  // ...register と login は前のまま...

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}
```

**コード解説**

- `@UseGuards(JwtAuthGuard)` — このハンドラにGuardを適用します。`@Controller` クラス全体に付ければ、そのコントローラの全ハンドラに適用されます。
- `@CurrentUser() user: JwtPayload` — Guardが検証・格納したペイロードを受け取ります。`user.sub` がユーザーIDです。
- トークンのペイロードには最新のプロフィール情報（`displayName` など）が入っていないため、`authService.me(user.sub)` でDBから取得し直して返します。

### curlで動作確認

Cookieなしでアクセスすると、Guardに止められて401が返ります。

```bash
curl -i http://localhost:3000/auth/me
```

実行結果の例:

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"message":"認証トークンがありません","error":"Unauthorized","statusCode":401}
```

ログインしてCookieを取得します。`-c cookies.txt` はレスポンスの `Set-Cookie` をファイルに保存するcurlのオプションです。

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

実行結果には `Set-Cookie: sns_session=...; HttpOnly; SameSite=Lax` が含まれます。保存したCookieを付けて再アクセスします。`-b cookies.txt` は保存済みCookieをリクエストに送るオプションです。

```bash
curl -i -b cookies.txt http://localhost:3000/auth/me
```

実行結果の例:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"email":"alice@example.com","username":"alice","displayName":"アリス","bio":"","avatarUrl":null}
```

Cookieなし→401、Cookieあり→200。Guardが期待通りに働いています。バックエンドの認証はこれで完成です。

## フロントエンドの実装

次はReact側です。登録画面とログイン画面を作り、以降のAPIリクエストでCookieを送れるように `credentials: "include"` を設定します。Cookieの値そのものはJavaScriptから読ませません。

### 型定義 — types.ts

まず、APIレスポンスに対応する型を定義します。このファイルにはプロジェクトを通じて型を追加していきます。

**`frontend/src/types.ts`**

```typescript
export type User = {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
};
```

### APIクライアント — lib/apiClient.ts

[fetchでAPI通信](/react/api_fetch/)では、画面ごとに `fetch` を直接書きました。しかしこのプロジェクトでは「全リクエストでCookieを同送する」「401なら全画面共通でログイン画面へ飛ばす」といった共通処理が必要です。そこで `fetch` を包む共通関数（HTTPクライアントライブラリでは「インターセプタ」と呼ばれる仕組みに相当する、自作のラッパー）を1つ作り、以後すべてのAPI呼び出しをこれに集約します。

**`frontend/src/lib/apiClient.ts`**

```typescript
const API_URL = import.meta.env.VITE_API_URL;

export function clearToken(): void {
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" }).catch(() => undefined);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    clearToken();
    location.hash = "#/login";
    throw new Error("ログインが必要です");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join("\n")
      : body?.message;
    throw new Error(message ?? `エラーが発生しました（${res.status}）`);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
```

**コード解説**

- `import.meta.env.VITE_API_URL` — [プロジェクトセットアップ](/sns/project_setup/)で `frontend/.env` に設定したAPIのURL（`http://localhost:3000`）です。Viteでは `VITE_` で始まる環境変数だけがフロントエンドのコードから参照できます。
- `clearToken` — HttpOnly CookieはJavaScriptから直接削除できないため、この関数は互換用の空実装にします。401時の共通処理から呼べる名前だけ残し、実際のログアウトは `/auth/logout` で行います。
- `logout` — サーバーの `/auth/logout` を呼んで `sns_session` Cookieを削除します。
- `apiFetch<T>(path, options)` — ジェネリクス `T` でレスポンスの型を呼び出し側が指定できます（例: `apiFetch<User>("/auth/me")`）。ジェネリクスは[関数と型](/typescript/functions/)で学んだ型引数の応用です。
- `new Headers(options.headers)` — 呼び出し側が指定したヘッダを引き継ぎつつ、追加のヘッダを安全に設定するために `Headers` オブジェクトに変換します。
- `headers.set("Content-Type", "application/json")` — ボディがあるリクエスト（POSTなど）にだけJSONのContent-Typeを付けます。
- `credentials: "include"` — フロントエンドとAPIのオリジンが違うため、これを指定しないとブラウザはCookieを送信しません。バックエンド側のCORSも `credentials: true` にしておく必要があります。
- `if (res.status === 401 && !path.startsWith("/auth/"))` — Cookieがない、無効、期限切れなどで認証に失敗したら、ログイン画面（`#/login`）へ遷移します。どの画面からAPIを呼んでも、この1箇所で「再ログインへの誘導」が実現します。ただし`/auth/`で始まるパスは対象外です。`/auth/login`が返す401は「ログイン済みCookieが無効」ではなく「メールアドレスまたはパスワードが正しくない」という意味なので、ここでリダイレクトして握りつぶさず、下の`!res.ok`の処理に流してAPIのエラーメッセージをそのまま画面に表示させます。
- `if (!res.ok)` — その他のエラー（400, 403, 409など）は、APIが返すエラーメッセージを取り出して `Error` として投げます。`ValidationPipe` のエラーは `message` が配列で返るため、配列なら改行で連結します。`res.json()` に失敗してもアプリが落ちないよう `.catch(() => null)` を添えています。
- `if (res.status === 204)` — 204 No Contentはボディがないため、`res.json()` を呼ばずに `undefined` を返します（[いいね解除](/sns/likes/)などのDELETE系で使います）。

> **注意: HttpOnly CookieとCSRF**
>
> HttpOnly CookieはXSSでトークン文字列を読まれにくい一方、ブラウザがCookieを自動送信するためCSRF（別サイトから勝手にリクエストを送らせる攻撃）を考える必要があります。この教材では `SameSite=Lax` とCORSの許可オリジン固定を使い、状態変更APIでは第1段階から許可したフロントエンドURLだけを受ける前提にします。
>
> つまり「Cookieなら全部安全」ではありません。XSSとCSRFのどちらのリスクを下げる設計なのかを理解して使うことが重要です。

### ルーティング — hooks/useHashRoute.ts

このプロジェクトでは、React Routerのようなライブラリは使わず、URLのハッシュ（`#` 以降の部分）でページを切り替える小さなカスタムフックを自作します。カスタムフックの作り方は[フック](/react/hooks/)で学んだ通りです。ハッシュの変化はページ遷移（リロード）を起こさず、`hashchange` イベントで検知できるため、SPA（→ [Reactとは](/react/what_is_react/)）のルーティングに手軽に使えます。

**`frontend/src/hooks/useHashRoute.ts`**

```typescript
import { useEffect, useState } from "react";

function currentPath(): string {
  // "#/users/alice" → "/users/alice"。ハッシュがなければ "/"
  return location.hash.slice(1) || "/";
}

export function useHashRoute() {
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    const onHashChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to: string) => {
    location.hash = `#${to}`;
  };

  return { path, navigate };
}
```

**コード解説**

- `currentPath()` — `location.hash` は `#/login` のような文字列なので、先頭の `#` を `slice(1)` で取り除きます。空（トップページ）なら `"/"` を返します。クエリ付きの場合は `"/verify-email?token=..."` のような文字列になります（[次の章](/sns/email_verification/)で使います）。
- `useState(currentPath())` — 現在のパスをstateとして持ちます。stateが変わるとこのフックを使うコンポーネントが再描画されます（→ [propsとstate](/react/props_and_state/)）。
- `useEffect(...)` — マウント時に `hashchange` イベントの購読を開始し、アンマウント時にクリーンアップ関数で解除します。依存配列 `[]` で「最初の1回だけ登録」です（→ [useEffectと依存配列](/react/hooks/)）。
- `navigate(to)` — `location.hash` に代入するとURLが変わり、`hashchange` イベント経由で `path` が更新されます。ブラウザの「戻る」ボタンも自然に機能します。
- 戻り値 `{ path, navigate }` — 「現在のパス」と「遷移する関数」のセットを返します。

### 登録画面 — pages/RegisterPage.tsx

[フォーム入力](/react/forms_and_lists/)で学んだ制御されたコンポーネント（入力値をstateで管理するフォーム）として実装します。

**`frontend/src/pages/RegisterPage.tsx`**

```tsx
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

type Props = {
  navigate: (to: string) => void;
};

export default function RegisterPage({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, displayName, password }),
      });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit}>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          ユーザー名（英小文字・数字・_ で3〜20文字）
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          表示名
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          パスワード（8文字以上）
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        アカウントを持っている場合は <a href="#/login">ログイン</a>
      </p>
    </main>
  );
}
```

**コード解説**

- 4つの入力をそれぞれ `useState` で管理する、制御されたフォームです（→ [フォーム入力](/react/forms_and_lists/)）。
- `e.preventDefault()` — フォーム送信によるページリロードを止めます。
- `apiFetch("/auth/register", { method: "POST", body: ... })` — 先ほど作った共通クライアントを使います。`Content-Type` の付与やエラーメッセージの抽出はクライアント側に任せられます。
- 成功したら `navigate("/login")` でログイン画面へ移動します（この挙動は[次の章](/sns/email_verification/)で「確認メールを送りました」という表示に変更します）。
- `catch` でAPIのエラーメッセージ（重複409やバリデーション400）を `error` stateに入れ、`{error && <p>...}` の条件付きレンダリングで表示します（→ [エラー処理](/react/api_fetch/)）。
- `disabled={submitting}` — 送信中はボタンを無効化し、二重送信を防ぎます。

### ログイン画面 — pages/LoginPage.tsx

**`frontend/src/pages/LoginPage.tsx`**

```tsx
import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

type Props = {
  navigate: (to: string) => void;
};

export default function LoginPage({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          パスワード
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        アカウントがない場合は <a href="#/register">ユーザー登録</a>
      </p>
    </main>
  );
}
```

**コード解説**

- `apiFetch("/auth/login", ...)` — ログインに成功すると、APIが `Set-Cookie` で `sns_session` を発行します。フロントエンドはレスポンスボディからトークンを取り出しません。
- `navigate("/")` — Cookieが保存されたあと、トップページ（タイムライン予定地）へ遷移します。以後の `apiFetch` は `credentials: "include"` によりCookieを自動送信します。

### App.tsx — ページの出し分け

最後に、`App.tsx` で「パスに応じたページの出し分け」と「未ログインならログイン画面へ」を実装します。

**`frontend/src/App.tsx`**（全体を差し替え）

```tsx
import { useEffect, useState } from "react";
import { useHashRoute } from "./hooks/useHashRoute";
import { apiFetch, logout } from "./lib/apiClient";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import type { User } from "./types";

// 仮のトップページ。posts.md（投稿機能とタイムライン）で置き換えます。
function TemporaryHome({ navigate }: { navigate: (to: string) => void }) {
  const [me, setMe] = useState<(User & { email: string }) | null>(null);

  useEffect(() => {
    apiFetch<User & { email: string }>("/auth/me")
      .then(setMe)
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <main>
      <h1>ようこそ{me ? `、${me.displayName} さん` : ""}</h1>
      <p>タイムラインは「投稿機能とタイムライン」の章で実装します。</p>
      <button onClick={handleLogout}>ログアウト</button>
    </main>
  );
}

export default function App() {
  const { path, navigate } = useHashRoute();

  if (path === "/register") return <RegisterPage navigate={navigate} />;
  if (path === "/login") return <LoginPage navigate={navigate} />;
  return <TemporaryHome navigate={navigate} />;
}
```

**コード解説**

- `useHashRoute()` — 現在の `path` を取得します。ハッシュが変わるたびに `App` が再描画され、表示するページが切り替わります。
- `if (path === ...) return <...>` — ルーティングの本体です。条件付きレンダリングだけで実現できるシンプルさが、ハッシュルーティングの利点です。
- `TemporaryHome` — ログイン後の仮置きページです。マウント時に `GET /auth/me` を呼んで表示名を出すことで、「Cookieが正しく送られている」ことを画面でも確認できます。[投稿機能とタイムライン](/sns/posts/)で本物のタイムラインに置き換えます。
- 未ログイン判定 — HttpOnly CookieはJavaScriptから読めないため、`localStorage` のように事前判定しません。`/auth/me` が401になったらログイン画面へ戻す、というAPI結果ベースの判定にします。
- `handleLogout` — `/auth/logout` を呼び、サーバーからCookie削除ヘッダを返してもらってからログイン画面へ戻します。

最後に、フォームが読みやすくなる程度の最小限のCSSを足しておきます（CSSの書き方は[HTML/CSS](/frontend/html_css/)で学習済みなので、ここでは深入りしません）。

**`frontend/src/index.css`**（末尾に追記）

```css
.auth-page { max-width: 360px; margin: 48px auto; }
.auth-page form { display: flex; flex-direction: column; gap: 12px; }
.auth-page label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.error { color: #c62828; white-space: pre-line; }
```

## 動作確認

すべての部品がそろいました。通しで動かしてみましょう。3つのターミナルで次を起動します。

```bash
# ターミナル1: DB
cd sns-app && docker compose up -d

# ターミナル2: バックエンド
cd sns-app/backend && pnpm run start:dev

# ターミナル3: フロントエンド
cd sns-app/frontend && pnpm run dev
```

ブラウザで `http://localhost:5173` を開き、次の順に確認します。

1. **未ログインのリダイレクト**: トップページを開くと、自動で `#/login` に遷移する。
2. **登録**: 「ユーザー登録」リンクから `#/register` へ。フォームに入力して登録すると、ログイン画面に戻る。短いパスワード（8文字未満）や使用済みのメールアドレスでは、赤いエラーメッセージが表示される。
3. **ログイン**: 登録した情報でログインすると、「ようこそ、アリス さん」のような表示に変わる。開発者ツール（Application → Cookies）を開くと、`sns_session` Cookieが保存され、HttpOnlyにチェックが付いている。
4. **ログイン維持**: ブラウザをリロードしても、ログイン状態が維持される（HttpOnly Cookieが残っているため）。
5. **ログアウト**: 「ログアウト」ボタンを押すとログイン画面に戻り、`sns_session` Cookieが削除される。リロードしてもログイン画面のまま。

さらに、開発者ツールのCookie編集画面で `sns_session` に偽の値を入れてからトップページを開いてみてください。`GET /auth/me` が401になり、表示名が出なくなります（Networkタブで401が確認できます）。Guardが偽トークンを確実に弾いている証拠です。この後の章で作る投稿などの認証必須APIが401を返したときは、`apiFetch`が自動でログイン画面へ戻します。

## 理解度チェック

**Q1. パスワードの保存にSHA-256単体ではなくbcryptを使うのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

SHA-256単体には2つの弱点があります。(1) 同じ入力から常に同じハッシュが得られるため、よくあるパスワードのハッシュ対応表（レインボーテーブル）で逆引きできてしまう。(2) 計算が高速なため、GPUによる総当たり攻撃で短いパスワードが現実的な時間で破られてしまう。

bcryptはこの2つに対策済みです。ユーザーごとにランダムなソルトを自動生成して混ぜるため対応表が無効になり、コスト係数によるストレッチング（計算の意図的な低速化）で総当たりのコストを跳ね上げます。ソルトとコスト係数はハッシュ文字列自体に埋め込まれるため、別途保存する必要もありません。

</details>

**Q2. JWTの署名は何を保証しますか。また、何を保証しませんか。**

<details markdown="1">
<summary>解答を見る</summary>

署名が保証するのは「このトークンは秘密鍵を知っているサーバーが発行したものであり、発行後に改ざんされていない」ことです。ペイロード（例えば `sub: 1`）を書き換えると署名が一致しなくなるため、なりすましの改ざんを検知できます。

一方、**機密性は保証しません**。ヘッダーとペイロードは暗号化ではなく単なるBase64URLエンコードなので、トークンを手に入れた人は誰でも中身を読めます。したがってパスワードなどの秘密情報をペイロードに入れてはいけません。

</details>

**Q3. NestJSのGuardは、リクエスト処理のどの段階で実行されますか。ValidationPipeとの順序も答えてください。**

<details markdown="1">
<summary>解答を見る</summary>

Guardは「Middlewareの後、Pipeの前」、つまり**コントローラのハンドラが実行される前**に動きます。順序は Middleware → Guard → Pipe → ハンドラ です。

Guardが `false` を返すか例外（`UnauthorizedException` など）を投げると、`ValidationPipe` もハンドラも実行されません。「誰か分からないリクエストは、ボディの検証より前に門前払いする」という設計になっています。

</details>

**Q4. ログイン失敗時に「メールアドレスまたはパスワードが正しくありません」とあえて曖昧なメッセージを返すのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

「このメールアドレスは登録されていません」「パスワードが違います」と区別して返すと、攻撃者が「どのメールアドレスがこのサービスに登録済みか」を機械的に調べられてしまうからです（アカウント列挙攻撃）。登録済みと分かったアドレスは、パスワードの総当たりやフィッシングの標的になります。どちらが間違っていても同じレスポンスを返すことで、この情報漏洩を防ぎます。

</details>

**Q5. HttpOnly Cookie方式の「ログアウト」で、サーバー側の処理が必要なのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

HttpOnly CookieはJavaScriptから読めず、直接削除もできません。そのため、ログアウト時はフロントエンドが `/auth/logout` を呼び、サーバーが `Set-Cookie` で `sns_session` を期限切れにします。

今回の実装ではCookieの中身はJWTなので、サーバー側にセッション行を保存しているわけではありません。より厳密に「全端末ログアウト」「管理者による強制ログアウト」を実現したい場合は、セッションテーブルやトークン失効リストを追加します。

</details>

## セルフレビュー

- [ ] 平文保存・SHA-256単体・bcryptの違いと、ソルト/ストレッチングの役割を自分の言葉で説明できる
- [ ] JWTの3つの部分（ヘッダー・ペイロード・署名）の役割と「暗号化ではない」ことを説明できる
- [ ] セッション方式とトークン方式の違い（状態をどちら側が持つか）を説明できる
- [ ] `JwtAuthGuard` を写経せずに書ける（トークン取り出し→ `verifyAsync` → `request.user` 格納→例外処理）
- [ ] `@UseGuards` と `@CurrentUser()` を使って認証必須のエンドポイントを作れる
- [ ] `apiFetch` が `credentials: "include"`・401処理・エラーメッセージ抽出をどう行っているか説明できる
- [ ] 登録→ログインCookie保存→`/auth/me`の流れを、curlだけで再現できる
- [ ] HttpOnly Cookieで下がるXSSリスクと、別途考えるべきCSRFリスクを説明できる

## 次のステップ

このページでは、bcryptによるパスワード保護、JWTによるログイン状態の表現、Guardによる認証チェックという、SNSの土台となる認証基盤を作りました。ここで作った `JwtAuthGuard`・`@CurrentUser()`・`apiFetch` は、この後のすべての章で繰り返し使います。

- 前のページ: [プロジェクトセットアップ](/sns/project_setup/) — 開発環境の構成を見直したいときはこちら
- 次のページ: [メールアドレス確認（SES）](/sns/email_verification/) — 現状の登録機能は、他人のメールアドレスでも登録できてしまいます。次は確認メールを送り、`emailVerified` を `true` にしてからログインを許可する仕組みを作ります。Userモデルに先回りで定義した `emailVerified` カラムが、さっそく活躍します。
