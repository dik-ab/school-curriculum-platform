---
title: embeddingとpgvector
parent: AIチャット開発（RAG）
nav_order: 3
---

# embeddingとpgvector

このページでは、RAGの「Retrieval（検索）」を支える2つの部品を実際に動かします。

1. **Voyage AIのembeddings API** — 文章をベクトル（意味の座標）に変換する
2. **pgvector** — PostgreSQLにベクトルの保存と類似検索の機能を追加する拡張

[RAGとは何か](/ai-chat/what_is_rag/)で学んだ「embedding」と「コサイン類似度」が、ここで現実のコードとSQLになります。

## 学習目標

- Voyage AIのembeddings APIを呼び出して、文章のベクトルを取得できる
- `input_type`（query / document）の使い分けを説明できる
- pgvector入りのPostgreSQLをDocker Composeで起動できる
- SQLでベクトル列を定義し、類似検索クエリを書ける
- Prismaでベクトル列を扱う方法（`Unsupported`型とraw query）を説明できる

## embeddingの生成：Voyage AI

[RAGとは何か](/ai-chat/what_is_rag/)で触れたとおり、Anthropic社はembeddingモデルを提供していません。Anthropicの公式ドキュメントでは、embeddingプロバイダとして**Voyage AI**が紹介されています。このカリキュラムでもVoyage AIを使います。

> **【重要】API利用料金について**
>
> Voyage AIも**従量課金制の有料API**です（無料枠が用意されていますが、上限を超えると課金されます。最新の条件は[Voyage AIの料金ページ](https://docs.voyageai.com/docs/pricing)で確認してください）。Claude APIと同様に、次の2点を必ず守ってください。
>
> 1. **APIキーは`.env`で管理し、絶対にコミットしない**（→ [.gitignore](/git/basic_commands/)）
> 2. **大量のテキストを取り込む前に、トークン数の見当をつける** — 取り込みスクリプトを不用意に何度も実行しない

### APIキーの取得

1. [Voyage AIのサイト](https://www.voyageai.com/)でアカウントを作成します
2. ダッシュボードでAPIキーを作成し、控えます
3. 前のページで作った`claude-practice`プロジェクトの`.env`に追記します

**`.env`**

```bash
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxx"
VOYAGE_API_KEY="pa-xxxxxxxxxxxxxxxxxxxx"
```

### embeddings APIを呼び出す

Voyage AIのembeddings APIは、シンプルなHTTPのエンドポイントです。

```text
POST https://api.voyageai.com/v1/embeddings
```

専用SDKもありますが、構造の理解のために、Node.js標準の`fetch`で呼び出してみましょう（Node.js 20では`fetch`が追加インストールなしで使えます）。

**`embed.ts`（`claude-practice`プロジェクト内）**

```typescript
import 'dotenv/config';

async function embed(
  texts: string[],
  inputType: 'query' | 'document',
): Promise<number[][]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: 'voyage-4',
      input_type: inputType,
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage AI error: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  return json.data.map((d: { embedding: number[] }) => d.embedding);
}

async function main() {
  const [vector] = await embed(['コンポーネントの再利用'], 'document');
  console.log('次元数:', vector.length);
  console.log('先頭5個:', vector.slice(0, 5));
}

main();
```

**コード解説**

- `Authorization: Bearer ...` — Voyage AIの認証はBearerトークン方式です（Claude APIの`x-api-key`とは方式が違う点に注意）
- `input` — ベクトル化したい文章の**配列**。複数の文章を1リクエストでまとめてベクトル化できます
- `model: 'voyage-4'` — 汎用的なテキスト向けの現行モデル。ベクトルの次元数は**1024**です（最新のモデル一覧は[公式ドキュメント](https://docs.voyageai.com/docs/embeddings)を確認してください）
- `input_type` — その文章が検索の**質問（query）**なのか、検索される**文書（document）**なのかを指定します（後述）
- `json.data` — レスポンスにはベクトルの配列が入っています。`map`で`embedding`だけを取り出しています

**ターミナル**

```bash
pnpm exec tsx embed.ts
```

```text
次元数: 1024
先頭5個: [ -0.0131315, 0.0198285, 0.0030781, -0.0442108, 0.0117062 ]
```

たしかに、文章が**1024個の数値の並び**に変換されました。これが「意味の座標」です。

### input_type：queryとdocumentの使い分け

`input_type`は重要なパラメータです。Voyage AIのモデルは、**検索の質問**と**検索される文書**で、最適化のされ方を変えています。

- 文書を取り込んで保存するとき → `input_type: 'document'`
- ユーザーの質問をベクトル化するとき → `input_type: 'query'`

このように使い分けることで検索精度が上がります。**RAGのような検索用途では必ず指定してください**。

### 意味の近さを実際に確かめる

[RAGとは何か](/ai-chat/what_is_rag/)のコサイン類似度を、本物のベクトルで確かめてみましょう。Voyage AIのベクトルは長さが1に正規化されているため、**内積（ドット積）を計算するだけでコサイン類似度になります**。

**`similarity.ts`（`embed`関数は`embed.ts`と同じものを記載）**

```typescript
import 'dotenv/config';

// （embed.tsと同じembed関数をここに書く）

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

async function main() {
  const [a, b, c] = await embed(
    [
      'コンポーネントの再利用',
      '画面の部品の使い回し',
      '今日は雨が降りそうだ',
    ],
    'document',
  );

  console.log('再利用 vs 使い回し:', dot(a, b).toFixed(3));
  console.log('再利用 vs 雨の話  :', dot(a, c).toFixed(3));
}

main();
```

**ターミナル**

```bash
pnpm exec tsx similarity.ts
```

```text
再利用 vs 使い回し: 0.812
再利用 vs 雨の話  : 0.327
```

（数値は実行ごと・モデルのバージョンごとに多少変わります）

単語がまったく違う「コンポーネントの再利用」と「画面の部品の使い回し」の類似度が高く、無関係な文章は低い。**意味で比較できている**ことが確認できました。

## pgvector：PostgreSQLでベクトルを扱う

ベクトルが作れるようになったので、次は**保存と検索**です。カリキュラム全体をチャンク分割すると数百件以上のベクトルになるため、データベースに保存して効率よく検索したいところです。

そこで使うのが**pgvector**です。pgvectorは、PostgreSQLに次の機能を追加する**拡張（extension）**です。

- `vector`型 — ベクトルを格納する列の型（例: `vector(1024)`は1024次元のベクトル）
- 距離演算子 — ベクトル同士の距離・類似度を計算する演算子
- ベクトル用インデックス — 大量データでも高速に近傍検索する仕組み

[データベースとPrisma](/database//)で学んだPostgreSQLがそのまま使える点が大きな利点です。専用のベクトルデータベース製品もありますが、「使い慣れたRDBに拡張を足すだけ」で済むpgvectorは、実務でも広く使われています。

```mermaid
flowchart LR
    T["文章チャンク"] --> V["Voyage AI<br>embeddings API"]
    V --> E["ベクトル<br>(1024次元)"]
    E --> P[("PostgreSQL<br>+ pgvector<br>vector(1024)列に保存")]
    Q["質問のベクトル"] --> P
    P --> R["類似度の高い順に<br>チャンクを返す"]
    style V fill:#fff3e0,stroke:#ef6c00
    style P fill:#e8f5e9,stroke:#2e7d32
    style T fill:#e3f2fd,stroke:#1565c0
    style Q fill:#e3f2fd,stroke:#1565c0
```

### Dockerで起動する

pgvectorの開発元は、**pgvectorがあらかじめ組み込まれたPostgreSQLのDockerイメージ**`pgvector/pgvector`を公開しています。[PostgreSQLの起動](/database/postgresql_setup/)で使った`postgres:16`イメージを、これに差し替えるだけです。

このセクション用の作業ディレクトリを作り、Composeファイルを書きます。

**ターミナル**

```bash
mkdir rag-practice
cd rag-practice
```

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

**コード解説**

- `image: pgvector/pgvector:pg16` — PostgreSQL 16にpgvector拡張を同梱したイメージ。`postgres:16`の置き換えとしてそのまま使えます
- それ以外（environment / ports / volumes）は[Docker Compose](/docker/docker_compose/)で学んだ書き方と同じです
- すでに別プロジェクトでポート5432を使っている場合は、先にそちらのコンテナを止めるか、ポート番号をずらしてください

**ターミナル**

```bash
docker compose up -d
docker compose ps
```

```text
NAME                 IMAGE                    STATUS         PORTS
rag-practice-db-1    pgvector/pgvector:pg16   Up 5 seconds   0.0.0.0:5432->5432/tcp
```

### 拡張を有効化してベクトルを触ってみる

イメージに拡張が「同梱」されていても、データベースごとに`CREATE EXTENSION`で**有効化**する必要があります。psqlで接続して試しましょう。

**ターミナル**

```bash
docker compose exec db psql -U postgres -d ragdb
```

**psql**

```sql
-- pgvector拡張を有効化する
CREATE EXTENSION IF NOT EXISTS vector;

-- 動作確認用に、3次元のベクトル列を持つテーブルを作る
CREATE TABLE sandbox (
  id SERIAL PRIMARY KEY,
  body TEXT,
  embedding vector(3)
);

-- ベクトルは '[1,2,3]' という文字列リテラルで書ける
INSERT INTO sandbox (body, embedding) VALUES
  ('プログラミングの話', '[0.9, 0.2, 0.1]'),
  ('部品の使い回しの話', '[0.85, 0.3, 0.05]'),
  ('天気の話',           '[0.1, 0.95, 0.2]');
```

**コード解説**

- `CREATE EXTENSION IF NOT EXISTS vector` — このデータベースでpgvectorを使えるようにします。**データベースを作り直したら再実行が必要**です
- `vector(3)` — 3次元のベクトル列。本番では`vector(1024)`（voyage-4の次元数）を使いますが、目視確認しやすいよう3次元で練習します
- `'[0.9, 0.2, 0.1]'` — ベクトルのリテラル表記。JSONの配列に似た文字列です

### 類似検索クエリ

pgvectorは、ベクトル間の「距離」を計算する演算子を提供します。

| 演算子 | 意味 | 値の見方 |
|---|---|---|
| `<=>` | **コサイン距離**（= 1 − コサイン類似度） | 0に近いほど似ている |
| `<->` | ユークリッド距離（直線距離） | 0に近いほど似ている |
| `<#>` | 内積 × (−1) | 小さいほど似ている |

注意したいのは、`<=>`が返すのは類似度ではなく**距離**だということです。「似ているほど小さい」値なので、`ORDER BY ... ASC`（昇順）で並べれば「似ている順」になります。コサイン**類似度**がほしいときは`1 - (a <=> b)`と変換します。

「プログラミングに関する質問」を表すベクトル`[0.88, 0.25, 0.08]`に近い順に検索してみましょう。

**psql**

```sql
SELECT
  body,
  1 - (embedding <=> '[0.88, 0.25, 0.08]') AS similarity
FROM sandbox
ORDER BY embedding <=> '[0.88, 0.25, 0.08]'
LIMIT 2;
```

```text
        body        |     similarity
--------------------+--------------------
 プログラミングの話 | 0.9981105588159002
 部品の使い回しの話 |  0.997552255736458
(2 rows)
```

**コード解説**

- `ORDER BY embedding <=> '[...]'` — 質問ベクトルとのコサイン距離が小さい順（＝似ている順）に並べ替えます
- `1 - (embedding <=> ...)` — 距離を類似度に変換して、結果を読みやすくしています
- `LIMIT 2` — 上位2件だけ取得。RAGでは「上位3〜5件をLLMに渡す」のが定番です

**この1つのクエリが、RAGの「Retrieval」の心臓部です。** 次のページでは、これをNestJSから実行します。

確認が終わったら練習用テーブルは消しておきましょう。

**psql**

```sql
DROP TABLE sandbox;
\q
```

## Prismaでpgvectorを扱う

NestJSからは[Prisma](/database/prisma_setup/)でデータベースを操作してきました。ところが、ここで問題があります。**Prismaは`vector`型を正式にサポートしていません**。pgvectorのような拡張が追加する型は、Prismaのスキーマ言語に対応する型が存在しないのです。

その場合のための仕組みが、Prismaに2つ用意されています。

1. **`Unsupported`型** — 「Prismaが直接は扱えない型の列」としてスキーマに書いておく
2. **raw query** — その列の読み書きは、SQLを直接書いて行う

ここでは書き方を理解しましょう（実際にプロジェクトへ組み込むのは次のページで行います）。

### スキーマ定義：Unsupported型とextensions

**`prisma/schema.prisma`（次のページで作るプロジェクトでの完成形）**

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

**コード解説**

- `previewFeatures = ["postgresqlExtensions"]` — スキーマ内でPostgreSQLの拡張を宣言できるようにするプレビュー機能を有効化します
- `extensions = [vector]` — このデータベースでpgvector拡張を使うことを宣言します。これにより、`prisma migrate dev`が生成するマイグレーションSQLに`CREATE EXTENSION`が自動的に含まれます（→ [マイグレーションの仕組み](/database/schema_and_migration/)）
- `Unsupported("vector(1024)")` — 「`vector(1024)`という型の列だが、Prismaは中身を直接扱えない」という宣言です。カッコ内にはSQLの型名をそのまま書きます
- 末尾の`?`（オプショナル） — **重要ポイント**です。`Unsupported`型の**必須**列があるモデルは、Prisma Clientの`create`が使えなくなってしまいます。オプショナルにしておくことで、通常のPrisma操作も共存できます
- `source` — チャンクの出どころ（ファイルパス）。回答の「出典」表示に使います

### 書き込みと検索はraw queryで

`Unsupported`型の列は、Prisma Clientの`create`や`findMany`では読み書きできません。代わりに、[Prisma ClientでCRUD](/database/crud_with_prisma/)で学んだメソッドの裏側にある「生のSQLを実行する」メソッドを使います。

- `$executeRaw` — INSERTやUPDATEなど、結果の行を返さないSQL
- `$queryRaw` — SELECTなど、結果の行を返すSQL

**書き込みの例（チャンクの保存）**

```typescript
const vectorLiteral = `[${embedding.join(',')}]`; // number[] → '[0.1,0.2,...]'

await prisma.$executeRaw`
  INSERT INTO "DocumentChunk" (source, content, embedding)
  VALUES (${source}, ${content}, ${vectorLiteral}::vector)
`;
```

**検索の例（類似チャンクの取得）**

```typescript
const vectorLiteral = `[${queryEmbedding.join(',')}]`;

const chunks = await prisma.$queryRaw<
  { id: number; source: string; content: string; similarity: number }[]
>`
  SELECT
    id,
    source,
    content,
    1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
  FROM "DocumentChunk"
  ORDER BY embedding <=> ${vectorLiteral}::vector
  LIMIT 5
`;
```

**コード解説**

- `` $executeRaw`...` `` — バッククォートの**タグ付きテンプレート**として書きます。`${...}`の部分はPrismaが自動的に**プレースホルダ**に変換するため、SQLインジェクションを防げます（文字列連結でSQLを組み立ててはいけません）
- `${vectorLiteral}::vector` — ベクトルは`'[0.1,0.2,...]'`形式の文字列として渡し、`::vector`でPostgreSQLの`vector`型にキャストします
- `"DocumentChunk"` — Prismaが作るテーブル名は大文字小文字が区別されるため、ダブルクォートで囲みます
- `$queryRaw<...[]>` — 取得する行の型をジェネリクスで指定すると、結果に型がつきます
- SQL自体は、先ほどpsqlで実行した類似検索クエリとまったく同じ構造です

### 補足：データが増えたらインデックス

今回のように数百〜数千件であれば、pgvectorは全行と類似度を計算する方式（全件スキャン）でも十分高速です。データが数十万件規模になると、`HNSW`などのベクトル用インデックスを張って近似検索に切り替えるのが定石です。[練習問題](/ai-chat/practice/)で軽く触れます。

## 理解度チェック

**Q1. embeddingの生成にVoyage AIを使うのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

Anthropic社はembeddingモデルを提供していないからです。Anthropicの公式ドキュメントではembeddingプロバイダとしてVoyage AIが紹介されており、RAGでClaudeと組み合わせる構成が一般的です。embeddingの生成（Voyage AI）と回答の生成（Claude）は別々のAPIが担当します。

</details>

**Q2. `input_type`に`query`と`document`があるのはなぜですか。それぞれいつ使いますか。**

<details markdown="1">
<summary>解答を見る</summary>

Voyage AIのモデルが「検索の質問」と「検索される文書」を別々に最適化しているためです。文書を取り込んで保存するときは`document`、ユーザーの質問をベクトル化するときは`query`を指定します。使い分けることで検索精度が向上するため、RAG用途では必ず指定します。

</details>

**Q3. pgvectorとは何ですか。なぜ専用のベクトルデータベースではなくpgvectorを選びましたか。**

<details markdown="1">
<summary>解答を見る</summary>

pgvectorは、PostgreSQLに`vector`型・距離演算子・ベクトル用インデックスを追加する拡張（extension）です。すでに学んで使い慣れているPostgreSQLに拡張を1つ足すだけでベクトル検索ができ、既存のテーブルとベクトルを同じデータベースで管理できるため、新しい製品を導入するより学習・運用コストが低くて済みます。

</details>

**Q4. `<=>`演算子が返す値は「類似度」ですか「距離」ですか。「似ている順」に並べるにはどう書きますか。**

<details markdown="1">
<summary>解答を見る</summary>

`<=>`はコサイン**距離**（1 − コサイン類似度）を返します。似ているほど0に近い小さな値になるため、`ORDER BY embedding <=> '[質問ベクトル]'`（昇順）で並べれば似ている順になります。類似度として表示したい場合は`1 - (embedding <=> ...)`と変換します。

</details>

**Q5. Prismaでベクトル列を扱うときに`Unsupported`型とraw queryが必要になるのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

Prismaのスキーマ言語にはpgvectorの`vector`型に対応する型が存在しないためです。`Unsupported("vector(1024)")`と書くことで「Prismaが直接扱えない型の列」としてマイグレーションには含めつつ、その列の読み書きは`$executeRaw` / `$queryRaw`で生のSQLを書いて行います。このときテンプレートリテラルの`${...}`を使えば、値はプレースホルダ化されSQLインジェクションを防げます。

</details>

**Q6. `vector(1024)`の「1024」は何を表していますか。この数値は何によって決まりますか。**

<details markdown="1">
<summary>解答を見る</summary>

ベクトルの次元数（数値の個数）です。使用するembeddingモデルが出力する次元数と一致させる必要があり、今回使うvoyage-4の出力が1024次元なので`vector(1024)`としています。モデルを変えて次元数が変わる場合は、列の定義も合わせて変える（作り直す）必要があります。

</details>

## セルフレビュー

- [ ] Voyage AIのembeddings APIを`fetch`で呼び出すコードを写経せずに書ける
- [ ] `input_type`の使い分けを理由つきで説明できる
- [ ] `pgvector/pgvector:pg16`イメージでデータベースを起動できる
- [ ] `CREATE EXTENSION vector`が必要な理由を説明できる
- [ ] psqlで類似検索クエリ（`ORDER BY ... <=> ... LIMIT n`）を書ける
- [ ] コサイン距離とコサイン類似度の関係（1から引く）を説明できる
- [ ] `Unsupported`型を使う理由と、オプショナル（`?`）にする理由を説明できる
- [ ] `$queryRaw`のテンプレートリテラルがSQLインジェクション対策になることを説明できる

## 次のステップ

これでRAGの部品がすべて揃いました。

- Generation: [Claude API](/ai-chat/claude_api/)
- Retrieval: embedding（Voyage AI）+ 類似検索（pgvector）← このページ

次のページ: [Q&Aボットを構築する](/ai-chat/build_rag_chat/) — いよいよ部品を組み立てます。カリキュラムの取り込みスクリプト、NestJSのチャットAPI、Reactのチャット画面を作り、エンドツーエンドで動くQ&Aボットを完成させます。
