---
title: E2Eテスト
parent: バックエンドテスト
nav_order: 2
---

# E2Eテスト

[前のページ](/testing/unit_test/)では、Prismaをモックにして`PostsService`のロジックを検証しました。しかしモックを使った単体テストでは、「本当にHTTPリクエストを受け付けて、本当にデータベースに保存されるか」までは確認できません。このページでは、実際のHTTPリクエストを送ってアプリ全体を検証する**E2Eテスト**を、SNSアプリの投稿API・いいねAPIを題材に書きます。

E2Eテストでは本物のデータベースを使います。そのとき絶対に守るべきルールが「**開発用のデータベースとテスト用のデータベースを分ける**」ことです。その理由と方法もあわせて学びます。

## 学習目標

- supertestを使って、NestJSアプリにHTTPリクエストを送るテストを書ける
- E2Eテストがルーティング・バリデーション・Service・DBのすべてを検証することを説明できる
- テスト用データベースを分離する理由と手順を説明できる
- `beforeAll` / `beforeEach` / `afterAll`でテストの準備と後片付けを書ける

## E2Eテストの仕組みとsupertest

**supertest（スーパーテスト）**は、HTTPサーバーに対してテスト用のリクエストを送るためのライブラリです。NestJSのプロジェクトには、Jestと同様に**最初から組み込まれています**（`test/`ディレクトリに`app.e2e-spec.ts`という雛形があります）。

E2Eテストの流れは次のとおりです。テストコードがNestJSアプリをテスト内で起動し、supertestでHTTPリクエストを送り、レスポンスとデータベースの中身を検証します。

```mermaid
sequenceDiagram
    participant T as テストコード<br>（Jest + supertest）
    participant A as NestJSアプリ<br>（テスト内で起動）
    participant DB as テスト用PostgreSQL<br>（sns_test）
    T->>A: POST /posts（content: "はじめての投稿です"）
    A->>A: ルーティング → バリデーション → Service
    A->>DB: INSERT（prisma.post.create）
    DB-->>A: 作成された行
    A-->>T: 201 Created + 投稿のJSON
    T->>T: expectでステータスコードとボディを検証
    T->>DB: Prismaで行数を確認
    DB-->>T: 1件
```

単体テストとの最大の違いは、**途中の部品を何もモックにしない**ことです。[Controller](/backend/controller/)のルーティング、[DTOとバリデーション](/backend/dto_and_validation/)のチェック、Serviceのロジック、Prismaを通じたDBへの保存——リクエストが通る経路のすべてが本物のまま検証されます。だからこそE2Eテストが通れば「このAPIは実際に使える」と言えるのです。

## テスト対象のAPI

このページでは、SNSアプリのうち次の2つのエンドポイントをテストします。データベースには`User`（ユーザー）・`Post`（投稿）・`Like`（いいね）の3つのモデルがあり、`Like`は[リレーション](/database/relations/)で学んだ多対多（ユーザー×投稿）を表す中間テーブルです。

| メソッドとパス | 動作 | 成功時 | 失敗時 |
|---|---|---|---|
| `POST /posts` | 投稿を作成する | 201 + 作成された投稿 | 本文が空なら400 |
| `POST /posts/:id/likes` | 投稿にいいねを付ける | 201 | 二重いいねは409、投稿がなければ404 |

なお、本来のSNSでは「誰の操作か」はJWT認証から特定しますが、認証は最終プロジェクトで導入するため（→ [認証](/sns/nestjs/auth/)）、ここでは**ボディで`authorId` / `userId`を受け取る簡略版**とします。アプリ本体の実装は[投稿のCRUD](/sns/nestjs/posts/)・[いいね](/sns/nestjs/likes/)で行うものと同じ構造です。

## テスト用データベースを分離する

E2Eテストには重要な前提があります。テストは毎回**まっさらなデータベース**から始めたいので、テストコードは実行のたびに**テーブルの全データを削除します**。もし開発用データベースに向けてテストを実行したら、開発中に手で入れたデータがすべて消えてしまいます。

そこで、**テスト専用のデータベースを別に用意し、テスト実行時だけ接続先を切り替えます**。

### 手順1: テスト用データベースを作る

[Docker基礎](/docker/docker_compose/)で作ったcomposeのPostgreSQLコンテナの中に、テスト専用のデータベース`sns_test`を追加で作ります。コンテナを増やす必要はありません。

```bash
docker compose exec db psql -U postgres -c 'CREATE DATABASE sns_test;'
```

```text
CREATE DATABASE
```

`db`の部分は、自分の`compose.yaml`で定義したPostgreSQLのサービス名に合わせてください。

### 手順2: .env.testを作る

接続先の切り替えには環境変数を使います。[Prismaの導入](/database/prisma_setup/)で作った`.env`とは別に、テスト用の`.env.test`をプロジェクト直下に作ります。

**`.env.test`**

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sns_test"
```

`.env`との違いは末尾のデータベース名（`sns_test`）だけです。ユーザー名・パスワードは自分の環境に合わせてください。`.env.test`も`.env`と同様に`.gitignore`へ追加します。

### 手順3: テスト実行時に.env.testを読み込む

`.env.test`を読み込んでコマンドを実行するために、**dotenv-cli**というツールを開発用依存としてインストールします。

```bash
pnpm add -D dotenv-cli
```

そして`package.json`のE2Eテスト用scriptを書き換えます。

**`package.json`（scriptsの該当行のみ）**

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.test -- jest --config ./test/jest-e2e.json"
  }
}
```

**コード解説**

- `dotenv -e .env.test --` — `.env.test`の内容を環境変数として読み込んだうえで、`--`以降のコマンドを実行します。これにより`DATABASE_URL`がテスト用DBを指した状態でJestが動きます。
- `jest --config ./test/jest-e2e.json` — NestJSプロジェクトに最初からある、E2Eテスト用のJest設定（`test/`ディレクトリの`.e2e-spec.ts`ファイルを対象にする設定）です。

### 手順4: テスト用DBにマイグレーションを適用する

テスト用DBは作った直後は空っぽで、テーブルがありません。[マイグレーション](/database/schema_and_migration/)で作成済みのマイグレーションファイルを、テスト用DBにも適用します。

```bash
pnpm exec dotenv -e .env.test -- prisma migrate deploy
```

```text
3 migrations found in prisma/migrations

Applying migration `20260601000000_init`
...
All migrations have been successfully applied.
```

`migrate deploy`は「既存のマイグレーションファイルをそのまま適用する」コマンドです（`migrate dev`と違い、新しいマイグレーションの生成はしません）。スキーマを変更したら、テスト用DBにもこのコマンドで反映するのを忘れないでください。

## E2Eテストを書く

準備が整いました。`test/posts.e2e-spec.ts`を作成します。

**`test/posts.e2e-spec.ts`**

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { name: 'テスト太郎', email: 'taro@example.com' },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /posts', () => {
    it('投稿を作成して201を返し、DBに1件保存される', async () => {
      const res = await request(app.getHttpServer())
        .post('/posts')
        .send({ content: 'はじめての投稿です', authorId: userId })
        .expect(201);

      expect(res.body).toMatchObject({
        content: 'はじめての投稿です',
        authorId: userId,
      });
      expect(res.body.id).toEqual(expect.any(Number));

      const count = await prisma.post.count();
      expect(count).toBe(1);
    });

    it('本文が空なら400を返し、DBに保存されない', async () => {
      await request(app.getHttpServer())
        .post('/posts')
        .send({ content: '', authorId: userId })
        .expect(400);

      const count = await prisma.post.count();
      expect(count).toBe(0);
    });
  });

  describe('POST /posts/:id/likes', () => {
    let postId: number;

    beforeEach(async () => {
      const post = await prisma.post.create({
        data: { content: 'いいねされる投稿', authorId: userId },
      });
      postId = post.id;
    });

    it('投稿にいいねを付けて201を返す', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .send({ userId })
        .expect(201);

      const likes = await prisma.like.count({ where: { postId } });
      expect(likes).toBe(1);
    });

    it('同じユーザーの二重いいねは409を返し、件数は増えない', async () => {
      await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .send({ userId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/posts/${postId}/likes`)
        .send({ userId })
        .expect(409);

      const likes = await prisma.like.count({ where: { postId } });
      expect(likes).toBe(1);
    });

    it('存在しない投稿へのいいねは404を返す', async () => {
      await request(app.getHttpServer())
        .post('/posts/999999/likes')
        .send({ userId })
        .expect(404);
    });
  });
});
```

**コード解説**

- `beforeAll` — **このファイルの全テストの前に1回だけ**実行されます。アプリの起動は時間がかかるため、テストごとではなく最初に1回だけ行います。
- `Test.createTestingModule({ imports: [AppModule] })` — 単体テストでは`providers`に必要なものだけを並べましたが、E2Eテストでは**アプリ全体のモジュール（AppModule）をそのまま読み込みます**。何もモックにしないためです。
- `app.useGlobalPipes(new ValidationPipe(...))` — `main.ts`と同じバリデーション設定をテスト用アプリにも適用します。これを忘れると「本文が空なら400」のテストが失敗します（テスト用アプリは`main.ts`を通らないため、`main.ts`での設定は自動では効きません）。
- `app.get(PrismaService)` — 起動したアプリからPrismaServiceを取り出します。テストコードからDBの中身を確認・準備するために使います。
- `beforeEach`の`deleteMany()` — **各テストの前にデータを全削除**し、毎回まっさらな状態から始めます。削除の順番に注意してください。`Like`は`Post`と`User`を参照しているため、外部キー制約により**参照している側（Like）から先に**消す必要があります。
- `prisma.user.create(...)` — 投稿には投稿者が必要なので、テスト用ユーザーを1人作っておきます。これを**テストデータの準備（セットアップ）**と呼びます。
- `afterAll`の`app.close()` — 全テストの後にアプリを終了し、DB接続などを片付けます。これを忘れるとJestが終了しないことがあります。
- `request(app.getHttpServer())` — supertestに、テスト内で起動したアプリのHTTPサーバーを渡します。実際のポートを開かずにリクエストを送れます。
- `.post('/posts').send({...})` — POSTリクエストの送信です。`.send()`がリクエストボディ（JSON）になります。
- `.expect(201)` — supertest自身の機能で、**ステータスコード**を検証します。Jestの`expect`と名前が同じですが別物なので注意してください。
- `toMatchObject({...})` — レスポンスボディが「少なくともこのプロパティを持つ」ことを検証します。`createdAt`のような毎回変わる値を無視して、重要な部分だけ比べられます。
- `expect.any(Number)` — 「何でもよいが数値であること」を表します。自動採番されるIDの検証に便利です。
- `prisma.post.count()` — レスポンスだけでなく、**DBに本当に行が増えたか（あるいは増えていないか）**まで確認しています。ここがE2Eテストの真価です。

### 実行する

composeでPostgreSQLが起動していることを確認してから実行します。

```bash
pnpm run test:e2e
```

```text
 PASS  test/posts.e2e-spec.ts (6.41 s)
  Posts API (e2e)
    POST /posts
      ✓ 投稿を作成して201を返し、DBに1件保存される (152 ms)
      ✓ 本文が空なら400を返し、DBに保存されない (38 ms)
    POST /posts/:id/likes
      ✓ 投稿にいいねを付けて201を返す (45 ms)
      ✓ 同じユーザーの二重いいねは409を返し、件数は増えない (61 ms)
      ✓ 存在しない投稿へのいいねは404を返す (24 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Time:        6.532 s
```

単体テスト（約2秒）と比べて時間がかかっていることが分かります。これが[テストピラミッド](/testing/)で学んだ「E2Eテストは遅いので少数に絞る」の実感です。なお、E2Eテストのファイルが複数になった場合、同じDBを共有して同時実行すると`deleteMany`がぶつかることがあります。その場合は`test:e2e`のscriptに`--runInBand`（テストファイルを1つずつ順番に実行するオプション）を付けてください。

## 単体テストとE2Eテストの使い分け

2つのページで書いたテストを見比べると、役割の違いがはっきりします。

| | 単体テスト | E2Eテスト |
|---|---|---|
| 対象 | `PostsService`単体 | `POST /posts`の経路全体 |
| DB | モック（不要） | 本物（テスト用DB） |
| 速度 | 速い（ミリ秒単位） | 遅い（テストごとに数十ms〜） |
| 得意なこと | ロジックの分岐を細かく検証 | 「実際に使えるか」の保証 |

「Serviceの細かい分岐は単体テストで網羅し、主要なAPIのシナリオはE2Eテストで通しで確認する」——この組み合わせが、このカリキュラムのテスト戦略です。

## 理解度チェック

**Q1. E2Eテストでは、なぜテスト用データベースを開発用と分ける必要があるのですか。**

<details markdown="1">
<summary>解答を見る</summary>

E2Eテストは毎回まっさらな状態から始めるために、`beforeEach`で**テーブルの全データを削除する**からです。開発用DBに向けて実行すると、開発中に作ったデータがすべて消えてしまいます。そこで`sns_test`のような専用DBを作り、`.env.test`の`DATABASE_URL`で接続先を切り替えます。

</details>

**Q2. `beforeAll`と`beforeEach`の違いは何ですか。このページのテストではそれぞれ何に使いましたか。**

<details markdown="1">
<summary>解答を見る</summary>

`beforeAll`は**ファイル内の全テストの前に1回だけ**、`beforeEach`は**各テストの前に毎回**実行されます。このページでは、時間のかかるアプリの起動を`beforeAll`で1回だけ行い、データの全削除とテスト用ユーザーの作成を`beforeEach`で毎回行いました。

</details>

**Q3. `beforeEach`で`like` → `post` → `user`の順に`deleteMany`しています。順番を逆（userから）にするとどうなりますか。**

<details markdown="1">
<summary>解答を見る</summary>

**外部キー制約のエラーになります**。`Post`は`User`を、`Like`は`Post`と`User`を参照しているため、参照されている側（User）を先に消そうとすると「まだこのユーザーを参照する投稿が残っている」とデータベースが削除を拒否します。**参照している側から先に**消すのが原則です（→ [リレーション](/database/relations/)）。

</details>

**Q4. supertestの`.expect(201)`とJestの`expect(...)`は何が違いますか。**

<details markdown="1">
<summary>解答を見る</summary>

supertestの`.expect(201)`はリクエストのメソッドチェーンの一部で、**HTTPレスポンスのステータスコード**を検証します。Jestの`expect(値)`は任意の値に対するアサーションで、`toBe`や`toEqual`などのマッチャーと組み合わせて使います。名前は同じですが提供元も使い方も別物です。このページではステータスコードはsupertest、レスポンスボディとDBの中身はJestの`expect`で検証しました。

</details>

**Q5. テスト用アプリに`app.useGlobalPipes(new ValidationPipe(...))`を付け忘れると、どのテストがどう失敗しますか。**

<details markdown="1">
<summary>解答を見る</summary>

「本文が空なら400を返す」のテストが失敗します。バリデーションが効かないため空の本文でも投稿が作成されてしまい、期待した400ではなく201が返るからです。E2Eテストのアプリは`main.ts`を通らずに起動されるため、`main.ts`に書いたグローバル設定はテスト側でも同じように適用する必要があります（→ [DTOとバリデーション](/backend/dto_and_validation/)）。

</details>

## セルフレビュー

- [ ] E2Eテストが何もモックにせず経路全体を検証することを説明できる
- [ ] テスト用DBを分離する理由と、`.env.test` + dotenv-cliによる切り替え方法を説明できる
- [ ] `prisma migrate deploy`でテスト用DBにスキーマを反映できる
- [ ] `beforeAll` / `beforeEach` / `afterAll`の使い分けを説明できる
- [ ] supertestで`POST`リクエストを送り、ステータスコードとボディを検証するテストを写経せずに書ける
- [ ] 外部キー制約を考慮した削除順で、テストデータの後片付けを書ける
- [ ] レスポンスの検証だけでなく、DBの中身（件数）まで確認する意味を説明できる
- [ ] 単体テストとE2Eテストの使い分けを自分の言葉で説明できる

## 次のステップ

これでバックエンドテストのセクションは完了です。テストを書く理由（[セクション概要](/testing/)）、Jestとモックによる単体テスト（[単体テスト](/testing/unit_test/)）、supertestとテスト用DBによるE2Eテストという、バックエンドのテストの核を一通り学びました。

次のセクション[CI/CD](/cicd/)では、ここで書いたテストを**GitHubにpushするたびに自動実行する**仕組みを作ります。テストは「書くこと」と「毎回必ず実行されること」が揃って初めて力を発揮します。そして最終プロジェクトの[SNSのテストを書く](/sns/nestjs/testing/)では、認証も含めた実際のSNSアプリに対して、このセクションの内容を総動員してテストを書きます。
