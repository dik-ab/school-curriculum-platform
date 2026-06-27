---
title: "NestJS版: SNSのテストを書く"
parent: SNS開発（最終プロジェクト）
nav_order: 38
section_key: sns-nestjs
section_title: SNS NestJS + Prisma版
---

# SNSのテストを書く

[プロフィール編集と画像アップロード](/sns/nestjs/profile_and_images/)までで、SNSの機能はすべて揃いました。次のページではいよいよAWSへデプロイしますが、その前にやるべきことがあります。テストです。デプロイ後は「リリースのたびに全機能を手で確認する」わけにはいきません。自動テストがあれば、この後の改修やデプロイを安心して進められます。

ただし、このページで全機能のテストを書くことはしません。テストの書き方そのものは[バックエンドテスト](/testing/)で学習済みなので、ここでは**代表として単体テストを1本、E2Eテストを1本**書きます。単体テストは「権限チェックのロジック」を持つ`PostsService`、E2Eテストは「認証・複数ユーザー・タイムライン」が絡む**フォローAPI**を題材に選びました。残りの機能のテストは、ここでの型を使って各自で追加していく方針です。

## 学習目標

- [バックエンドテスト](/testing/)で学んだ手法を、認証つきの実アプリに適用できる
- 例外（403/404）を投げるServiceのロジックを、モックを使った単体テストで検証できる
- ログインを伴う一連のシナリオを、テスト用DBを使ったE2Eテストで検証できる
- 書いたテストをCIで自動実行するための要点を説明できる

## 何をどこでテストするか

[テストピラミッド](/testing/)で学んだとおり、テストは「速くて細かい単体テストを多く、遅くて広いE2Eテストを少なく」が基本戦略でした。今回書く2本を、ピラミッドのどこに置くのかを先に確認します。

```mermaid
graph TB
    E2E["E2Eテスト: 少数・遅い・本物のDBを使う<br>今回書く: test/follow.e2e-spec.ts<br>（ログイン→フォロー→タイムラインの一連のシナリオ）"]
    MID["結合テスト: 必要に応じて追加する領域"]
    UNIT["単体テスト: 多数・速い・依存はモック<br>今回書く: src/posts/posts.service.spec.ts<br>（削除の権限チェックなどロジックの分岐）"]
    E2E --- MID --- UNIT
    style E2E fill:#fff3e0,stroke:#ef6c00
    style MID fill:#e8f5e9,stroke:#2e7d32
    style UNIT fill:#e3f2fd,stroke:#1565c0
```

単体テスト（青）はロジックの分岐を細かく素早く検証する主役で、本来はServiceごとに数多く書きます。E2Eテスト（橙）は本物のDBとHTTPを通すため遅く、主要なシナリオに絞ります。この比率の感覚を持ったうえで、それぞれの代表を1本ずつ書いていきましょう。

## PostsServiceの単体テスト

[単体テスト](/testing/unit_test/)で学んだ「PrismaServiceをモックに差し替える」手法を、[投稿機能とタイムライン](/sns/nestjs/posts/)で実装した本物の`PostsService`に適用します。テストしたいのは次の挙動です。

| メソッド | 検証したい挙動 |
|---|---|
| `create(userId, content)` | ログイン中のユーザーが`authorId`になり、`content`で投稿が作られる |
| `remove(userId, postId)` | 存在しない投稿なら`NotFoundException`（404） |
| `remove(userId, postId)` | **他人の投稿なら`ForbiddenException`（403）を投げ、削除しない** |

特に3つ目は、SNSとして絶対に壊してはいけないルール（他人の投稿は消せない）です。こうした「セキュリティに関わる分岐」こそ、単体テストで固めておく価値があります。`remove`の実装は、`findUnique`で投稿を取得 → 見つからなければ404 → `authorId`が本人でなければ403 → `delete`、という流れでした（→ [投稿機能とタイムライン](/sns/nestjs/posts/)）。

**`backend/src/posts/posts.service.spec.ts`**

```typescript
import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PostsService', () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = moduleRef.get(PostsService);
  });

  describe('create', () => {
    it('ログイン中のユーザーをauthorIdとして投稿を作成する', async () => {
      mockPrisma.post.create.mockResolvedValue({
        id: 1,
        content: 'テスト投稿です',
        authorId: 10,
        createdAt: new Date(),
      });

      await service.create(10, 'テスト投稿です');

      expect(mockPrisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'テスト投稿です',
            authorId: 10,
          }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('存在しない投稿はNotFoundExceptionを投げ、削除しない', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.remove(10, 999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.post.delete).not.toHaveBeenCalled();
    });

    it('他人の投稿はForbiddenExceptionを投げ、削除しない', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        id: 1,
        content: '他人の投稿',
        authorId: 99,
        createdAt: new Date(),
      });

      await expect(service.remove(10, 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.post.delete).not.toHaveBeenCalled();
    });

    it('自分の投稿なら削除できる', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        id: 1,
        content: '自分の投稿',
        authorId: 10,
        createdAt: new Date(),
      });
      mockPrisma.post.delete.mockResolvedValue({ id: 1 });

      await service.remove(10, 1);

      expect(mockPrisma.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
```

**コード解説**

- `mockPrisma` — [単体テスト](/testing/unit_test/)で学んだとおり、PrismaServiceと同じ形（`post`プロパティの中に各メソッド）の偽物を`jest.fn()`で作ります。`{ provide: PrismaService, useValue: mockPrisma }`でDIを差し替えるのも同じです。
- `expect.objectContaining({...})` — 「少なくともこのプロパティを含む引数で呼ばれた」ことの検証です。[投稿機能とタイムライン](/sns/nestjs/posts/)で実装した`create(authorId, content)`は`data`のほかに`include`（投稿者情報の付与）も渡していますが、このテストはその細部には縛られず、**本質（誰の・どんな内容の投稿が作られるか）だけ**を検証するため、そのまま通ります。
- `mockResolvedValue(null)` — 「投稿が見つからない」状況を偽装します。DBに細工をしなくても、異常系を自在に作れるのがモックの強みです。
- `authorId: 99`に対して`service.remove(10, 1)` — 「ユーザー10が、ユーザー99の投稿1を消そうとする」状況です。`rejects.toThrow(ForbiddenException)`で403の例外を検証します（`await`を忘れずに）。
- `expect(mockPrisma.post.delete).not.toHaveBeenCalled()` — 例外が投げられただけでなく、**deleteが実行されていない**ことまで確認します。「403を返すが消えてしまっている」という最悪のバグを見逃さないためです。

実行します。`-- posts.service`を付けると、ファイル名にこの文字列を含むテストだけを実行できます。

```bash
cd backend
pnpm run test -- posts.service
```

```text
 PASS  src/posts/posts.service.spec.ts
  PostsService
    create
      ✓ ログイン中のユーザーをauthorIdとして投稿を作成する (6 ms)
    remove
      ✓ 存在しない投稿はNotFoundExceptionを投げ、削除しない (3 ms)
      ✓ 他人の投稿はForbiddenExceptionを投げ、削除しない (2 ms)
      ✓ 自分の投稿なら削除できる (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Time:        2.314 s
```

DBなしで2秒少々。この速さなら、コードを直すたびに気軽に回せます。

## フォローAPIのE2Eテスト

次は[E2Eテスト](/testing/e2e_test/)で学んだsupertestを使い、[フォローとフォロー中タイムライン](/sns/nestjs/follow/)のAPIを通しで検証します。単体テストと違い、Guard・バリデーション・Service・本物のDBまで全部が本物です。SNSならではのポイントは次の2つです。

- すべてのエンドポイントが`JwtAuthGuard`で保護されているため、テストの最初に**ログインしてトークンを取得**する必要がある
- フォローは2人いないと成立しないため、**ユーザーを2人**用意する

### テスト用データベースの準備

[E2Eテスト](/testing/e2e_test/)で学んだとおり、E2Eテストはテーブルを全削除するので、開発用DB（`sns`）とは別の**テスト専用DB**を使います。[プロジェクトセットアップ](/sns/nestjs/project_setup/)で作ったcomposeのPostgreSQLコンテナに、`sns_test`データベースを追加します。

```bash
docker compose exec db psql -U postgres -c 'CREATE DATABASE sns_test;'
```

```text
CREATE DATABASE
```

接続先の切り替え用に`.env.test`を作ります。`DATABASE_URL`に加えて、アプリの起動に必要な`JWT_SECRET`と`FRONTEND_URL`も入れておきます（テスト中にログインAPIを呼ぶので、JWTの署名鍵が必要です）。

**`backend/.env.test`**

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sns_test?schema=public"
JWT_SECRET="test-secret"
FRONTEND_URL="http://localhost:5173"
```

`.env.test`も`.env`と同様に`.gitignore`へ追加してください。切り替えにはdotenv-cliを使います（→ [E2Eテスト](/testing/e2e_test/)と同じ手順です）。

```bash
pnpm add -D dotenv-cli
```

**`backend/package.json`（scriptsの該当行を変更）**

```json
{
  "scripts": {
    "test:e2e": "dotenv -e .env.test -- jest --config ./test/jest-e2e.json"
  }
}
```

テスト用DBにマイグレーションを適用します。`migrate deploy`は既存のマイグレーションファイルをそのまま適用するコマンドでした（→ [E2Eテスト](/testing/e2e_test/)）。今後スキーマを変えたら、テスト用DBにもこのコマンドで再反映するのを忘れないでください。

```bash
pnpm exec dotenv -e .env.test -- prisma migrate deploy
```

```text
6 migrations found in prisma/migrations

Applying migration `20260601000000_add_user`
Applying migration `20260601000001_add_email_verification_token`
Applying migration `20260601000002_add_post`
Applying migration `20260601000003_add_like`
Applying migration `20260601000004_add_follow`
Applying migration `20260601000005_add_conversation_and_message`

All migrations have been successfully applied.
```

なお、NestJSの雛形として最初から入っている`test/app.e2e-spec.ts`（`GET /`を検証するサンプル）は、このアプリには`GET /`がないため失敗します。削除して構いません。

### シナリオを書く

今回は「アリスがボブをフォローして、タイムラインにボブの投稿が流れ、解除すると消える」という**一連のシナリオ**を、上から順に実行される複数の`it`で書きます。[E2Eテスト](/testing/e2e_test/)では`beforeEach`で毎回データをリセットする独立型で書きましたが、シナリオ型は「ユーザーの実際の操作の流れ」をそのまま表現でき、状態の準備を再利用できるのが利点です。代わりに**テストの順番に意味がある**（途中の1つが落ちると後続も落ちる）ことは理解して使いましょう。

**`backend/test/follow.e2e-spec.ts`**

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function getSetCookie(res: request.Response): string[] {
  const cookie = res.headers['set-cookie'];
  if (!cookie) throw new Error('Set-Cookie header is missing');
  return Array.isArray(cookie) ? cookie : [cookie];
}

describe('Follow API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let aliceCookie: string[];
  let bobCookie: string[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);

    // 参照している側のテーブルから順に全削除する
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.user.deleteMany();

    // テストユーザーを2人、DBに直接作る
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.createMany({
      data: [
        {
          email: 'alice@example.com',
          username: 'alice',
          displayName: 'アリス',
          passwordHash,
          emailVerified: true,
        },
        {
          email: 'bob@example.com',
          username: 'bob',
          displayName: 'ボブ',
          passwordHash,
          emailVerified: true,
        },
      ],
    });

    // ログインしてそれぞれのHttpOnly Cookieを取得する
    const aliceRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' });
    aliceCookie = getSetCookie(aliceRes);

    const bobRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bob@example.com', password: 'password123' });
    bobCookie = getSetCookie(bobRes);

    expect(aliceCookie).toBeDefined();
    expect(bobCookie).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Cookieなしではフォローできない（401）', async () => {
    await request(app.getHttpServer())
      .post('/users/bob/follow')
      .expect(401);
  });

  it('aliceがbobをフォローすると201が返る', async () => {
    await request(app.getHttpServer())
      .post('/users/bob/follow')
      .set('Cookie', aliceCookie)
      .expect(201);
  });

  it('同じ相手への二重フォローは409が返る', async () => {
    await request(app.getHttpServer())
      .post('/users/bob/follow')
      .set('Cookie', aliceCookie)
      .expect(409);
  });

  it('bobのプロフィールにフォロー状態が反映される', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/bob')
      .set('Cookie', aliceCookie)
      .expect(200);

    expect(res.body.isFollowing).toBe(true);
    expect(res.body.followersCount).toBe(1);
  });

  it('フォロー中タイムラインにbobの投稿が表示される', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .set('Cookie', bobCookie)
      .send({ content: 'ボブの投稿です' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/posts/timeline')
      .set('Cookie', aliceCookie)
      .expect(200);

    const contents = res.body.map((post: { content: string }) => post.content);
    expect(contents).toContain('ボブの投稿です');
  });

  it('フォローを解除するとタイムラインからbobの投稿が消える', async () => {
    await request(app.getHttpServer())
      .delete('/users/bob/follow')
      .set('Cookie', aliceCookie)
      .expect(204);

    const res = await request(app.getHttpServer())
      .get('/posts/timeline')
      .set('Cookie', aliceCookie)
      .expect(200);

    const contents = res.body.map((post: { content: string }) => post.content);
    expect(contents).not.toContain('ボブの投稿です');
  });
});
```

**コード解説**

- `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))` — `main.ts`（→ [プロジェクトセットアップ](/sns/nestjs/project_setup/)）と同じ設定をテスト用アプリにも適用します。E2Eテストのアプリは`main.ts`を通らずに起動されるため、これを忘れるとバリデーション関連の挙動が本番と変わってしまいます（→ [E2Eテスト](/testing/e2e_test/)）。
- `getSetCookie` — `POST /auth/login` のレスポンスヘッダから `Set-Cookie` を取り出す小さなヘルパーです。実装ではJWTをレスポンス本文に返さず `sns_session` HttpOnly Cookieとして発行するため、E2EテストでもCookieヘッダを保存して次のリクエストに渡します。
- `deleteMany`の順番 — 外部キー制約があるため、**参照している側から先に**消します。SNSはモデルが増えたので削除順も長くなりました（Message → Conversation → Like → Post → Follow → EmailVerificationToken → User）。
- `bcrypt.hash('password123', 10)` — ユーザーは`POST /auth/register`を呼ばずに**DBへ直接**作ります。register経由だと確認メールの処理が絡むうえ、テストの前提条件が別のAPIの実装に依存してしまうからです。直接作る場合、パスワードは[ユーザー登録とログイン（JWT認証）](/sns/nestjs/auth/)と同じくbcrypt（ソルトラウンド10）でハッシュ化しておく必要があります。平文のまま入れるとログインで照合に失敗します。
- `emailVerified: true` — [メールアドレス確認（SES）](/sns/nestjs/email_verification/)で「未確認のユーザーはログインできない（403）」仕様にしたため、テストユーザーは最初から確認済みにしておきます。これを忘れるとログインの段階で全テストが失敗します。
- `aliceCookie` / `bobCookie` — aliceとbobでログインしたときの `Set-Cookie` を保存しています。以降のリクエストでは `.set('Cookie', aliceCookie)` のように付けることで、ブラウザが `credentials: "include"` でCookieを送る動きをSupertest上で再現します。
- 各`it`が、401 → フォロー201 → 二重フォロー409 → プロフィール反映 → タイムライン表示 → 解除で消える、というシナリオを順に進めます。フォローの「数」だけでなく、フォローの**目的であるタイムラインへの反映**まで検証するのがこのテストの価値です。
- `.delete(...).expect(204)` — [フォローとフォロー中タイムライン](/sns/nestjs/follow/)のunfollowには`@HttpCode(204)`を付けたので、成功時は204 No Contentが返ります。もし`@HttpCode`を付けていない場合は、NestJSの`@Delete`はデフォルトで200を返すため、期待値を自分の実装に合わせてください。

### 実行する

composeのDBが起動していることを確認してから実行します。

```bash
pnpm run test:e2e
```

```text
 PASS  test/follow.e2e-spec.ts (8.12 s)
  Follow API (e2e)
    ✓ Cookieなしではフォローできない（401） (74 ms)
    ✓ aliceがbobをフォローすると201が返る (61 ms)
    ✓ 同じ相手への二重フォローは409が返る (32 ms)
    ✓ bobのプロフィールにフォロー状態が反映される (45 ms)
    ✓ フォロー中タイムラインにbobの投稿が表示される (88 ms)
    ✓ フォローを解除するとタイムラインからbobの投稿が消える (59 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Time:        8.305 s
```

単体テストの数倍の時間がかかりますが、ログイン（JWT発行と検証）からDBの中身、タイムラインのSQLまで、フォロー機能の経路全体が一度に検証できました。

## CIで回す

テストは「pushのたびに必ず実行される」ようになって初めて力を発揮します。このSNS NestJS版の解答リポジトリでは、`.github/workflows/ci.yml` に `pnpm test`、`pnpm build`、PostgreSQLを使ったE2Eテストをまとめて定義します。つまり、このページで書いた**単体テストとE2Eテストの両方**が、Pull Requestとmainへのpushで自動実行されます。

ポイントは、(1) PostgreSQLのサービスコンテナ、(2) テスト用の環境変数、(3) `.env.test` の生成、(4) `prisma migrate deploy`、(5) `pnpm run test:e2e` の順に並べることです（workflowの基本構造は[GitHub Actionsの基礎](/cicd/github_actions_basics/)を参照してください）。

**`.github/workflows/ci.yml`（SNS NestJS版の要点）**

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test-build:
    name: Test and build
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: sns_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres -d sns_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/sns_test?schema=public
      JWT_SECRET: test-secret
      FRONTEND_URL: http://localhost:5173

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Unit tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Prepare E2E environment
        run: |
          cat > .env.test <<'EOF'
          DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sns_test?schema=public"
          JWT_SECRET="test-secret"
          FRONTEND_URL="http://localhost:5173"
          EOF

      - name: Apply database migrations
        run: pnpm exec dotenv -e .env.test -- prisma migrate deploy

      - name: E2E tests
        run: pnpm run test:e2e
```

**コード解説**

- `services: postgres:` — jobの実行中だけ、横でPostgreSQL 16のコンテナが起動します。ローカルのcomposeの役割をCI上で果たすものです。`options`のヘルスチェックで「DBの起動完了を待ってからstepを始める」ようにしています。
- `env:`（jobレベル） — `DATABASE_URL`、`JWT_SECRET`、`FRONTEND_URL` をCI上の各stepへ渡します。`pnpm test` や `pnpm build` の中でPrisma Clientを生成するときにも `DATABASE_URL` が必要です。
- `Prepare E2E environment` — `.env.test` はGitに入れないため、CIのランナー上で同じ内容を一時ファイルとして作ります。これにより、ローカルと同じ `pnpm run test:e2e` をそのまま使えます。
- `pnpm exec dotenv -e .env.test -- prisma migrate deploy` — E2Eテストの前に、まっさらなDBへマイグレーションを適用します。ローカルで手順としてやったことが、CIでは毎回自動で行われます。
- `pnpm run test:e2e` — `package.json` の `test:e2e` スクリプトを使い、`.env.test` を読み込んだ状態でsupertestのE2Eテストを実行します。

これで、pushのたびに既存のチェックに加えてE2Eテストも自動で走ります。デプロイのworkflowとの関係は、次のページ[AWSへの全体デプロイ](/sns/nestjs/deploy/)で扱います。

## 理解度チェック

**Q1. 「他人の投稿は削除できない（403）」は単体テストで、「フォローすると409やタイムラインが正しく動く」はE2Eテストで検証しました。この使い分けの理由を説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

削除の権限チェックは`PostsService`の中の**条件分岐のロジック**であり、モックで「他人の投稿が返ってくる」状況を作れば高速・確実に検証できるため、単体テスト向きです。一方フォロー機能の価値は「認証 → フォロー関係の保存 → タイムラインのクエリへの反映」という**複数の部品をまたいだ連携**にあり、どれか1つでもモックにすると検証になりません。そのため本物のDBとHTTPを通すE2Eテストで、シナリオとして検証します。

</details>

**Q2. E2Eテストのユーザー作成で、`POST /auth/register`を呼ばずにPrismaで直接作成しました。その際に必要だった2つの工夫（`passwordHash`と`emailVerified`）はそれぞれなぜ必要ですか。**

<details markdown="1">
<summary>解答を見る</summary>

- `passwordHash: await bcrypt.hash(...)` — ログインAPIは、送られたパスワードをDBの`passwordHash`とbcryptで照合します（→ [ユーザー登録とログイン（JWT認証）](/sns/nestjs/auth/)）。registerを経由しない場合はハッシュ化が行われないので、テストコード側で同じ方式（bcrypt、ソルトラウンド10）でハッシュを作って入れる必要があります。
- `emailVerified: true` — [メールアドレス確認（SES）](/sns/nestjs/email_verification/)で、メール未確認のユーザーはログインを403で拒否する仕様にしました。registerを経由しないと確認フローも走らないため、最初から確認済みフラグを立てておかないとログインできず、すべてのテストが失敗します。

</details>

**Q3. CIのworkflowでは`.env.test`を使わず、jobの`env:`で環境変数を設定しました。なぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

`.env.test`は`.gitignore`に入れており、リポジトリに含まれないからです。CIのrunner上にはそのファイルが存在しないため、`dotenv -e .env.test`を使うスクリプトは失敗します。代わりにworkflowの`env:`で`DATABASE_URL`などを直接設定し、jestを直接起動します。なお、ここで設定しているのはテスト専用の値（CI上の使い捨てDBやダミーの`JWT_SECRET`）なので、workflowファイルに書いても問題ありません。本物の秘密情報は[CI/CD](/cicd/)で学んだとおりSecretsを使います。

</details>

**Q4. このページのE2Eテストは`beforeEach`でのリセットを行わない「シナリオ型」で書きました。[E2Eテスト](/testing/e2e_test/)で書いた「独立型」と比べた利点と欠点を1つずつ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

- **利点**: フォロー → 確認 → 解除のような「ユーザーの一連の操作」を自然に表現でき、前のステップで作った状態（フォロー関係やトークン）を再利用できるため、準備コードの重複が減りテストも速くなります。
- **欠点**: テスト同士が順番に依存するため、途中の1つが失敗すると後続が連鎖的に失敗し、原因の切り分けがしにくくなります。また`it`を単独で実行したり順番を入れ替えたりできません。独立性が必要な検証（並び順に依存しない個別の仕様）は、独立型で書くのが適しています。

</details>

## セルフレビュー

- [ ] 単体テストとE2Eテストのどちらで何を検証すべきか、理由つきで判断できる
- [ ] PrismaServiceをモックして、例外（403/404）を投げるロジックのテストを写経せずに書ける
- [ ] `expect.objectContaining`を使って実装の細部に依存しないアサーションを書ける
- [ ] テスト用DB（`sns_test`）の作成・`.env.test`での切り替え・`prisma migrate deploy`の適用が一人でできる
- [ ] 認証つきAPIのE2Eテストで、トークンを取得して`Authorization`ヘッダーに付ける流れを書ける
- [ ] 外部キー制約を考慮した順番でテーブルをクリアできる
- [ ] CIでPostgreSQLを`services`として起動し、テストを自動実行する構成の要点を説明できる

## 次のステップ

機能（〜[プロフィール編集と画像アップロード](/sns/nestjs/profile_and_images/)）とテストが揃い、デプロイの準備が整いました。次のページ[AWSへの全体デプロイ](/sns/nestjs/deploy/)では、[AWSデプロイ](/aws/)の章で学んだ構成（S3 + CloudFront、ECR + ECS、RDS）をこのSNSに適用し、CI/CDから自動デプロイするところまで一気に仕上げます。このページで作ったCIのテストjobは、その自動デプロイの「関門」として組み込まれます。テストが通らないコードは本番に出ない、という体制の完成です。

残りの機能（いいね、チャット、プロフィール編集）のテストは、ここで書いた2本を型にして、[総仕上げ](/sns/nestjs/wrap_up/)の追加課題として自分の手で増やしていきましょう。
