---
title: Q&Aボットを構築する
parent: AIチャット開発（RAG）
nav_order: 4
---

# Q&Aボットを構築する

いよいよ集大成です。これまでのページで手に入れた部品——[Claude API](/ai-chat/claude_api/)（生成）、[Voyage AIとpgvector](/ai-chat/embeddings_and_pgvector/)（検索）——を組み合わせて、**「このカリキュラムに質問できるQ&Aボット」**をエンドツーエンドで完成させます。

作るものは3つです。

1. **取り込みスクリプト** — カリキュラムのMarkdownをチャンク分割し、ベクトル化してデータベースに保存する
2. **NestJSのチャットAPI** — 質問を受け取り、検索→プロンプト組み立て→Claude呼び出しを行う
3. **Reactのチャット画面** — ブラウザから質問して回答を表示する

## 学習目標

- RAGの一連の流れをNestJS + pgvector + Claude APIで実装できる
- ドキュメントをチャンク分割して取り込むスクリプトを書ける
- 検索結果をプロンプトに組み込む「コンテキストの注入」を実装できる
- ReactのチャットUIからAPIを呼び出し、回答と出典を表示できる
- 複数のAPIキーを`.env`で安全に管理して開発を進められる

## 完成形の全体像

最初に、質問が回答になるまでの流れをシーケンス図で確認します。実装中に迷子になったら、必ずこの図に戻ってきてください。

```mermaid
sequenceDiagram
    participant B as ブラウザ (React)
    participant N as NestJS (チャットAPI)
    participant V as Voyage AI
    participant P as PostgreSQL (pgvector)
    participant C as Claude API
    B->>N: POST /chat { question }
    N->>V: 質問をベクトル化 (input_type: query)
    V-->>N: 質問ベクトル (1024次元)
    N->>P: コサイン距離の近い順にチャンク検索 (上位5件)
    P-->>N: 関連チャンク (本文 + 出典)
    N->>C: システムプロンプト + チャンク + 質問
    C-->>N: チャンクを根拠にした回答
    N-->>B: { answer, sources }
    Note over B: 回答と出典を画面に表示
```

このほかに、事前に1回だけ実行する「取り込み」の流れがあります。

```mermaid
flowchart LR
    A["カリキュラムの<br>.mdファイル"] --> B["チャンク分割<br>(見出し・長さで区切る)"]
    B --> C["Voyage AIで<br>ベクトル化<br>(input_type: document)"]
    C --> D[("DocumentChunk<br>テーブルに保存")]
    style A fill:#e3f2fd,stroke:#1565c0
    style C fill:#fff3e0,stroke:#ef6c00
    style D fill:#e8f5e9,stroke:#2e7d32
```

> **【重要】API利用料金について**
>
> このページの実装では、**2つの有料APIを実際に呼び出します**。
>
> - **取り込みスクリプト** — ドキュメント全文をVoyage AIに送るため、取り込むファイル数に比例してトークンを消費します。**まず2〜3ファイルで動作確認してから**全体を取り込みましょう。スクリプトの再実行は、その都度embedding費用がかかります
> - **チャットAPI** — 質問1回ごとに、Voyage AI（質問のベクトル化）とClaude API（回答生成）の両方を呼び出します。検索したチャンクをプロンプトに含めるため、入力トークンは素の質問より多くなります
>
> 学習用途の規模なら少額ですが、Anthropic ConsoleとVoyage AIのダッシュボードで利用額を確認する習慣をつけてください。また、**2つのAPIキーはどちらも`.env`で管理し、絶対にコミットしないこと**（→ [.gitignore](/git/basic_commands/)）。

## ステップ1：プロジェクトの準備

### NestJSプロジェクトの作成

[NestJSのセットアップ](/backend/setup/)と同じ手順でプロジェクトを作ります。

**ターミナル**

```bash
nest new rag-chat-api
cd rag-chat-api
pnpm add @anthropic-ai/sdk @nestjs/config@3 class-validator class-transformer dotenv
pnpm add -D prisma@5
pnpm add @prisma/client@5
```

**コード解説**

- `@anthropic-ai/sdk` — Claude APIの公式SDK
- `@nestjs/config` — NestJSで`.env`を読み込むための公式モジュール。`@3` はNestJS 10系に対応するメジャーバージョンの固定です（無指定だと最新版が入り、peer dependencyの不整合を起こすことがあります）
- `class-validator` / `class-transformer` — [DTOとバリデーション](/backend/dto_and_validation/)で学んだ入力チェック用
- `prisma` / `@prisma/client` — [Prismaの導入](/database/prisma_setup/)と同じ構成です
- `dotenv` — NestJSを経由しない単体スクリプト（取り込みスクリプト）で`.env`を読むために使います

### データベースの起動

前のページで作った`compose.yaml`と同じものをプロジェクト直下に置き、pgvector入りPostgreSQLを起動します。

**`compose.yaml`**

```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ragdb
    ports:
      - "5432:5432"
    volumes:
      - rag-db-data:/var/lib/postgresql/data

volumes:
  rag-db-data:
```

**ターミナル**

```bash
docker compose up -d
```

### 環境変数の設定

**`.env`**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ragdb?schema=public"
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxx"
VOYAGE_API_KEY="pa-xxxxxxxxxxxxxxxxxxxx"
```

`.gitignore`に`.env`が含まれていることを**必ず確認**してください（Nest CLIが生成する`.gitignore`には最初から含まれていますが、自分の目で確かめる癖をつけましょう）。

```bash
grep "^\.env" .gitignore
```

```text
.env
```

### Prismaのセットアップとマイグレーション

**ターミナル**

```bash
pnpm exec prisma init
```

生成された`prisma/schema.prisma`を、[前のページ](/ai-chat/embeddings_and_pgvector/)で設計したスキーマに書き換えます。

**`prisma/schema.prisma`**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

model DocumentChunk {
  id        Int                          @id @default(autoincrement())
  source    String
  content   String
  embedding Unsupported("vector(1024)")?
  createdAt DateTime                     @default(now())
}
```

マイグレーションを実行します（→ [マイグレーションの仕組み](/database/schema_and_migration/)）。

**ターミナル**

```bash
pnpm exec prisma migrate dev --name init
```

```text
Applying migration `20XX_init`

Your database is now in sync with your schema.
✔ Generated Prisma Client
```

生成されたマイグレーションSQL（`prisma/migrations/…/migration.sql`）を開いてみてください。`extensions = [vector]`の宣言によって、先頭に`CREATE EXTENSION IF NOT EXISTS "vector";`が自動で含まれているはずです。

## ステップ2：embeddingサービス

Voyage AIの呼び出しは、取り込みとチャットの両方で使うので、NestJSの[Service](/backend/service_and_di/)として切り出します。

**ターミナル**

```bash
nest generate module embeddings
nest generate service embeddings
```

**`src/embeddings/embeddings.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingsService {
  private readonly url = 'https://api.voyageai.com/v1/embeddings';
  private readonly model = 'voyage-4';

  async embed(
    texts: string[],
    inputType: 'query' | 'document',
  ): Promise<number[][]> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
        input_type: inputType,
      }),
    });

    if (!res.ok) {
      throw new Error(`Voyage AI error: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as {
      data: { embedding: number[] }[];
    };
    return json.data.map((d) => d.embedding);
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embed([text], 'query');
    return vector;
  }
}
```

**`src/embeddings/embeddings.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';

@Module({
  providers: [EmbeddingsService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
```

**コード解説**

- `embed(texts, inputType)` — 複数テキストをまとめてベクトル化する汎用メソッド。[前のページ](/ai-chat/embeddings_and_pgvector/)で書いた`fetch`のコードをServiceに移しただけです
- `embedQuery(text)` — チャットAPIから使う「質問1件をベクトル化」する専用メソッド。`input_type: 'query'`を確実に使うために分けています
- `exports: [EmbeddingsService]` — 他のモジュール（後で作るChatModule）から使えるように公開します（→ [Module](/backend/service_and_di/)）

あわせて、Prismaを使うための定番のPrismaServiceも作っておきます（→ [PrismaServiceの組み込み](/database/crud_with_prisma/)で作ったものと同じです）。

**`src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

**`src/prisma/prisma.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## ステップ3：取り込みスクリプト

カリキュラムのMarkdownファイルを読み、チャンク分割→ベクトル化→保存する単体スクリプトを作ります。NestJSアプリを起動せずに`ts-node`で直接実行できるよう、独立したファイルにします。

まず、取り込む対象のドキュメントを用意します。プロジェクト直下に`docs`フォルダを作り、**このカリキュラムのMarkdownファイル一式をコピー**してください（カリキュラムのリポジトリを持っていない場合は、スクールの案内に従って入手するか、手元の学習メモなど任意のMarkdownでも練習できます）。

```text
rag-chat-api/
├── docs/              ← 取り込み対象（例: カリキュラムの.md一式）
│   ├── react/
│   │   ├── hooks.md
│   │   └── ...
│   └── database/
│       └── ...
├── scripts/
│   └── ingest.ts      ← これから作る
└── src/
```

**`scripts/ingest.ts`**

```typescript
import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DOCS_DIR = process.argv[2] ?? './docs';
const BATCH_SIZE = 32;

/** Voyage AIでテキストの配列をベクトル化する */
async function embedDocuments(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: 'voyage-4',
      input_type: 'document',
    }),
  });
  if (!res.ok) {
    throw new Error(`Voyage AI error: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

/** Markdownを「## 見出し」と長さでチャンクに分割する */
function chunkMarkdown(text: string, maxLength = 800): string[] {
  const sections = text.split(/\n(?=## )/); // 「## 」で始まる行の直前で分割
  const chunks: string[] = [];

  for (const section of sections) {
    if (section.length <= maxLength) {
      chunks.push(section.trim());
      continue;
    }
    // 長すぎるセクションは、空行（段落の区切り）でさらに分割して詰めていく
    let current = '';
    for (const paragraph of section.split(/\n\n+/)) {
      if (current && current.length + paragraph.length > maxLength) {
        chunks.push(current.trim());
        current = '';
      }
      current += paragraph + '\n\n';
    }
    if (current.trim()) chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length >= 50); // 短すぎる断片はノイズなので捨てる
}

async function main() {
  // 1. .mdファイルを再帰的に集める
  const files = readdirSync(DOCS_DIR, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.md'));
  console.log(`${files.length}個のMarkdownファイルを取り込みます`);

  // 2. 全ファイルをチャンクに分割する
  const allChunks: { source: string; content: string }[] = [];
  for (const file of files) {
    const text = readFileSync(join(DOCS_DIR, file), 'utf-8');
    for (const content of chunkMarkdown(text)) {
      allChunks.push({ source: file, content });
    }
  }
  console.log(`合計${allChunks.length}チャンクに分割しました`);

  // 3. 既存データを消して、取り込みをやり直せるようにする
  await prisma.documentChunk.deleteMany();

  // 4. バッチごとにベクトル化して保存する
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedDocuments(batch.map((c) => c.content));

    for (let j = 0; j < batch.length; j++) {
      const vectorLiteral = `[${vectors[j].join(',')}]`;
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (source, content, embedding)
        VALUES (${batch[j].source}, ${batch[j].content}, ${vectorLiteral}::vector)
      `;
    }
    console.log(`${Math.min(i + BATCH_SIZE, allChunks.length)} / ${allChunks.length} 件 完了`);
  }

  await prisma.$disconnect();
  console.log('取り込みが完了しました');
}

main();
```

**コード解説**

- `import 'dotenv/config'` — NestJSを経由しないスクリプトなので、`.env`を自前で読み込みます
- `readdirSync(DOCS_DIR, { recursive: true })` — Node.js 20の機能で、サブフォルダまで再帰的にファイル一覧を取得します
- `chunkMarkdown` — まず`## `見出しで意味のまとまりごとに分け、それでも長いものは段落（空行）単位で約800文字に収まるよう分割します。「**意味の区切りを尊重しつつ、長すぎないサイズにする**」のがチャンク分割の基本方針です
- `c.length >= 50` — 見出しだけの断片などはノイズになるため除外します
- `prisma.documentChunk.deleteMany()` — スクリプトを再実行したとき二重登録にならないよう、毎回入れ替え方式にしています
- `BATCH_SIZE = 32` — Voyage AIは1リクエストで複数テキストを処理できるため、32件ずつまとめて送って呼び出し回数を減らしています
- `${vectorLiteral}::vector` — [前のページ](/ai-chat/embeddings_and_pgvector/)で学んだ、raw queryによるベクトルの保存です

実行します。**最初は`docs`に2〜3ファイルだけ置いて試し、動きを確認してから全体を取り込みましょう**（料金注意ボックス参照）。

**ターミナル**

```bash
pnpm exec ts-node scripts/ingest.ts ./docs
```

```text
42個のMarkdownファイルを取り込みます
合計517チャンクに分割しました
32 / 517 件 完了
64 / 517 件 完了
...
517 / 517 件 完了
取り込みが完了しました
```

psqlで中身を覗いて、保存を確認しておきましょう。

```bash
docker compose exec db psql -U postgres -d ragdb \
  -c 'SELECT id, source, left(content, 30) FROM "DocumentChunk" LIMIT 3;'
```

```text
 id |      source       |              left
----+-------------------+--------------------------------
  1 | react/hooks.md    | ## useEffectとは何か useEffect…
  2 | react/hooks.md    | ## 依存配列 依存配列は「いつエ…
  3 | react/hooks.md    | ## カスタムフックの入口 ここま…
(3 rows)
```

## ステップ4：チャットAPI

検索と生成を組み合わせる本体です。[Controller](/backend/controller/)と[Service](/backend/service_and_di/)を作ります。

**ターミナル**

```bash
nest generate module chat
nest generate controller chat
nest generate service chat
```

### DTO：入力の検証

**`src/chat/dto/ask-question.dto.ts`**

```typescript
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;
}
```

**コード解説**

- `@MaxLength(500)` — 異常に長い入力を弾きます。**入力がそのままAPIのトークン消費（＝料金）になる**ので、上限設定は安全装置として重要です（→ [DTOとバリデーション](/backend/dto_and_validation/)）

### ChatService：RAGの心臓部

**`src/chat/chat.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

const SYSTEM_PROMPT = `あなたはプログラミングスクールのカリキュラムについて答えるアシスタントです。
以下のルールを必ず守ってください。
- 回答は、ユーザーのメッセージに含まれる【資料】の内容だけを根拠にすること
- 資料に書かれていないことを聞かれたら、推測せず「カリキュラムにはその情報が見つかりませんでした」と答えること
- 初学者向けに、専門用語にはひとこと説明を添えること`;

type ChunkRow = {
  id: number;
  source: string;
  content: string;
  similarity: number;
};

@Injectable()
export class ChatService {
  private readonly anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async ask(question: string): Promise<{ answer: string; sources: string[] }> {
    // 1. Retrieval: 質問をベクトル化し、意味の近いチャンクを探す
    const queryVector = await this.embeddings.embedQuery(question);
    const chunks = await this.searchChunks(queryVector);

    // 2. Augmentation: チャンクをプロンプトに組み込む
    const context = chunks
      .map((c, i) => `【資料${i + 1}（出典: ${c.source}）】\n${c.content}`)
      .join('\n\n');

    // 3. Generation: Claudeに回答を生成させる
    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${context}\n\n上の資料を根拠に、次の質問に答えてください。\n質問: ${question}`,
        },
      ],
    });

    const answer = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    const sources = [...new Set(chunks.map((c) => c.source))];
    return { answer, sources };
  }

  private async searchChunks(queryVector: number[]): Promise<ChunkRow[]> {
    const vectorLiteral = `[${queryVector.join(',')}]`;
    return this.prisma.$queryRaw<ChunkRow[]>`
      SELECT
        id,
        source,
        content,
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM "DocumentChunk"
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT 5
    `;
  }
}
```

**コード解説**

- `SYSTEM_PROMPT` — RAGの肝です。「**資料だけを根拠に答える**」「**資料になければ正直にないと言う**」と明示することで、ハルシネーション（→ [RAGとは何か](/ai-chat/what_is_rag/)）を抑えます
- `ask()`のコメント`1.〜3.` — [RAGとは何か](/ai-chat/what_is_rag/)で学んだRetrieval / Augmentation / Generationにそのまま対応しています
- `searchChunks()` — [前のページ](/ai-chat/embeddings_and_pgvector/)で学んだ類似検索のraw queryです。上位5件を取得します
- `【資料1（出典: ...）】` — チャンクを番号と出典つきで整形してプロンプトに注入します。LLMには「どこからどこまでが資料か」を明確に示すことが大切です
- `new Set(...)` — 同じファイルから複数チャンクがヒットすることがあるため、出典の重複を取り除いています
- `message.content.filter(...)` — [Claude APIの基礎](/ai-chat/claude_api/)で学んだとおり、`content`は配列なので`text`ブロックだけを連結します

### ControllerとModuleの配線

**`src/chat/chat.controller.ts`**

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  ask(@Body() dto: AskQuestionDto) {
    return this.chatService.ask(dto.question);
  }
}
```

**`src/chat/chat.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [PrismaModule, EmbeddingsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
```

**`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ChatModule],
})
export class AppModule {}
```

**`src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: 'http://localhost:5173' });
  await app.listen(3000);
}
bootstrap();
```

**コード解説**

- `ConfigModule.forRoot({ isGlobal: true })` — `.env`を読み込んで`process.env`から使えるようにします。`isGlobal: true`で全モジュールから利用可能になります
- `app.enableCors(...)` — Reactの開発サーバー（`http://localhost:5173`）からの呼び出しを許可します。これがないと、ブラウザのCORS制限でリクエストがブロックされます（→ [fetchでAPI通信](/react/api_fetch/)）
- `ValidationPipe` — DTOのバリデーションを全エンドポイントで有効化します

### curlで動作確認

UIを作る前に、APIだけで動きを確かめます。**動作確認は小さい単位で行う**のが鉄則です。

**ターミナル（1つ目でサーバー起動、2つ目で実行）**

```bash
pnpm run start:dev
```

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "useEffectの依存配列って何のためにあるんですか？"}'
```

```json
{
  "answer": "依存配列は「いつエフェクトを再実行するか」をReactに伝えるための仕組みです。配列に指定した値が変わったときだけ、useEffectの中の処理が再実行されます。…",
  "sources": ["react/hooks.md"]
}
```

カリキュラムに書かれていないことも聞いてみましょう。

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Ruby on Railsの章はどこですか？"}'
```

```json
{
  "answer": "カリキュラムにはその情報が見つかりませんでした。…",
  "sources": ["backend/what_is_nestjs.md", "index.md"]
}
```

システムプロンプトの効果で、知らないことを正直に「ない」と答えています。これがRAGの良いところです。

## ステップ5：Reactのチャット画面

最後にUIです。[Viteでのプロジェクト作成](/react/setup/)と同じ手順で、**別のフォルダに**フロントエンドを作ります。

**ターミナル（rag-chat-apiの外で実行）**

```bash
pnpm create vite@5 rag-chat-ui --template react-ts
cd rag-chat-ui
pnpm install
```

**`src/App.tsx`（丸ごと置き換え）**

```tsx
import { useState } from 'react';
import './App.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: { answer: string; sources: string[] } = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'エラーが発生しました。時間をおいてもう一度お試しください。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat">
      <h1>カリキュラムQ&Aボット</h1>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <p>{m.content}</p>
            {m.sources && m.sources.length > 0 && (
              <p className="sources">出典: {m.sources.join(', ')}</p>
            )}
          </div>
        ))}
        {loading && <div className="message assistant">考え中...</div>}
      </div>

      <form onSubmit={sendQuestion}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="カリキュラムについて質問してください"
        />
        <button type="submit" disabled={loading}>
          送信
        </button>
      </form>
    </div>
  );
}

export default App;
```

**`src/App.css`（丸ごと置き換え）**

```css
.chat {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px;
  font-family: sans-serif;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 320px;
  margin-bottom: 16px;
}

.message {
  padding: 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  text-align: left;
}

.message.user {
  background: #e3f2fd;
  align-self: flex-end;
  max-width: 80%;
}

.message.assistant {
  background: #f1f3f4;
  align-self: flex-start;
  max-width: 80%;
}

.sources {
  margin-top: 8px;
  font-size: 12px;
  color: #5f6368;
}

form {
  display: flex;
  gap: 8px;
}

form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

form button {
  padding: 10px 20px;
}
```

**コード解説**

- `ChatMessage`型 — 画面に並べる吹き出し1つ分。`role`でユーザーとボットを区別し、ボットの回答には`sources`（出典）を持たせます
- `messages` / `input` / `loading` — [useState](/react/props_and_state/)で管理する3つの状態。「会話の履歴」「入力中のテキスト」「通信中かどうか」です
- `setMessages((prev) => [...prev, ...])` — 既存の配列を直接書き換えず、新しい配列を作って更新します（→ [リスト表示とkey](/react/forms_and_lists/)）
- 質問を送った直後に`setMessages`でユーザーの吹き出しを先に追加 — 回答を待たずに自分の発言が表示され、チャットらしい操作感になります
- `loading`中は`「考え中...」`を表示し、ボタンを`disabled`に — [ローディング/エラー処理](/react/api_fetch/)で学んだパターンです。二重送信の防止にもなります（**二重送信はそのまま二重課金**です）
- `white-space: pre-wrap` — Claudeの回答に含まれる改行をそのまま表示します

### 全体を動かす

3つのターミナルで起動します。

```bash
# ターミナル1: データベース
cd rag-chat-api && docker compose up -d

# ターミナル2: API
cd rag-chat-api && pnpm run start:dev

# ターミナル3: フロントエンド
cd rag-chat-ui && pnpm run dev
```

ブラウザで`http://localhost:5173`を開き、「Prismaのマイグレーションって何でしたっけ？」のように質問してみてください。数秒後に、カリキュラムの内容にもとづいた回答と出典が表示されれば**完成です**。

最初のシーケンス図を見返してください。ブラウザからClaudeまで、登場した部品のすべてを自分の手で書いたことになります。

## うまく動かないときは

| 症状 | 確認すること |
|---|---|
| `401 Unauthorized`系のエラー | `.env`のAPIキーの値、`ConfigModule`/`dotenv`の読み込み |
| 回答が毎回「見つかりませんでした」 | 取り込みが済んでいるか（`DocumentChunk`の件数）、質問の言語とドキュメントの言語 |
| ブラウザのコンソールにCORSエラー | `main.ts`の`enableCors`の設定とフロントのURL（ポート番号） |
| `relation "DocumentChunk" does not exist` | `pnpm exec prisma migrate dev`を実行したか、`DATABASE_URL`の接続先 |
| 回答が途中で切れる | `max_tokens`を増やす。レスポンスの`stop_reason`が`max_tokens`になっていないか |

## 理解度チェック

**Q1. 質問が送信されてから回答が表示されるまでに、どの外部サービスがどの順番で呼ばれますか。**

<details markdown="1">
<summary>解答を見る</summary>

①Voyage AI（質問を`input_type: 'query'`でベクトル化）→ ②PostgreSQL + pgvector（質問ベクトルとのコサイン距離が近いチャンクを上位5件検索）→ ③Claude API（チャンクをプロンプトに注入して回答を生成）の順です。NestJSがこの3つを順番に呼び出して組み立てています。

</details>

**Q2. システムプロンプトに「資料だけを根拠に答える」「なければ見つからないと答える」と書くのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

LLMは知らないことでも、それらしい誤答（ハルシネーション）を生成してしまうことがあるからです。根拠を渡した資料に限定し、資料にない場合の答え方まで指示しておくことで、「検索で見つかった事実にもとづく回答」と「正直なお手上げ」に行動を絞り込み、誤情報の混入を抑えます。

</details>

**Q3. 取り込みスクリプトでチャンクを「## 見出し」で分割してから、さらに長さで分割しているのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

見出しは「話題の区切り」なので、まず見出しで分けることで意味的にまとまったチャンクになります。ただし1セクションが長すぎると、検索でヒットしてもプロンプトに入れるテキストが無駄に大きくなる（トークン＝料金の浪費、要点のぼやけ）ため、上限（約800文字）を超えるものは段落単位でさらに分割します。「意味の区切りを尊重しつつ、長すぎないサイズ」がチャンク分割の基本です。

</details>

**Q4. `searchChunks`の`$queryRaw`で、ベクトルを`${vectorLiteral}::vector`の形で渡しているのはなぜですか。文字列連結でSQLを組み立ててはいけない理由もあわせて答えてください。**

<details markdown="1">
<summary>解答を見る</summary>

Prismaは`vector`型を直接サポートしていないため、ベクトルを`'[0.1,0.2,...]'`形式の文字列として渡し、`::vector`でPostgreSQL側でベクトル型にキャストしています。`$queryRaw`のテンプレートリテラルでは`${...}`が自動的にプレースホルダになるため、SQLインジェクションを防げます。文字列連結でSQLを組み立てると、入力値に仕込まれたSQL片がそのまま実行される脆弱性が生まれます。

</details>

**Q5. `main.ts`で`enableCors`を設定しないと何が起きますか。**

<details markdown="1">
<summary>解答を見る</summary>

ブラウザ上のReactアプリ（`http://localhost:5173`）からNestJS（`http://localhost:3000`）への`fetch`が、オリジン（プロトコル+ドメイン+ポート）が異なるためブラウザのCORS制限でブロックされ、レスポンスを読み取れずエラーになります。`enableCors`でフロントエンドのオリジンを許可することで、ブラウザがレスポンスの利用を許可します。

</details>

**Q6. APIキーが2つ（Anthropic / Voyage AI）になりました。このプロジェクトでキーを安全に保つために行った対策をすべて挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

①キーをコードに書かず`.env`に集約した、②`.env`が`.gitignore`に含まれていることを確認した（Gitにコミットされない）、③NestJSでは`ConfigModule`、単体スクリプトでは`dotenv`で環境変数として読み込んだ、④DTOの`@MaxLength`やローディング中の送信無効化で、意図しない大量消費（課金）を抑えた。万一コミットしてしまった場合は、キーの無効化と再発行が必要です。

</details>

## セルフレビュー

- [ ] 全体シーケンス図を何も見ずに描き、各ステップを説明できる
- [ ] 取り込み（事前）と応答（質問ごと）の2フェーズを区別して実装できた
- [ ] チャンク分割の方針（見出し→長さ）を理由つきで説明できる
- [ ] ChatServiceの`ask()`がRAGの3ステップにどう対応するか指させる
- [ ] システムプロンプトでハルシネーションを抑える書き方ができる
- [ ] CORSエラーが出たときに、どこを直せばよいかわかる
- [ ] 2つのAPIキーを一度もコミットせずにここまで来た
- [ ] curl→UIの順で段階的に動作確認する進め方を実践できた

## 次のステップ

おめでとうございます。RAGを使ったQ&Aボットが完成しました。

次のページ: [練習問題](/ai-chat/practice/) — このボットには、まだ改良の余地がたくさんあります。会話履歴への対応、ストリーミング応答、検索精度の改善などに挑戦して、自分のものにしましょう。

また、ここで使った「NestJS + Prisma + React + 外部API」という構成と進め方（小さく作って小さく確かめる）は、[SNS開発（最終プロジェクト）](/sns//)でそのまま活きてきます。
