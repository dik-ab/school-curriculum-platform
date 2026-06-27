---
title: 練習問題
parent: AIチャット開発（RAG）
nav_order: 5
---

# 練習問題

[Q&Aボットを構築する](/ai-chat/build_rag_chat/)で完成させたボットを、自分の手で改良していきましょう。実務のRAG開発も、まさにこの「動く最小構成を作ってから、精度と体験を磨き込む」という流れで進みます。

課題は易しい順に並んでいます。課題1〜3は全員挑戦してください。課題4〜6は発展です。

> **【重要】API利用料金について**
>
> この練習問題でも、動作確認のたびにClaude APIとVoyage AIを呼び出します。試行錯誤の回数が増えるぶん、[構築ページ](/ai-chat/build_rag_chat/)よりも呼び出し回数が多くなりがちです。プロンプトの変更を試すときは**同じ質問を使い回して比較する**、取り込みスクリプトは**必要なときだけ再実行する**など、無駄な呼び出しを減らす工夫をしましょう。利用額はAnthropic ConsoleとVoyage AIのダッシュボードで確認できます。

## 学習目標

- 完成したRAGアプリを、要件に応じて自力で変更できる
- 検索品質（Retrieval）と生成品質（Generation）のどちらに手を入れるべきか判断できる
- プロンプト・クエリ・UIのそれぞれの改善が、体験にどう効くかを体感する

## 課題1：関連資料がないときの挙動を改善する

現在の実装は、どんな質問でも**必ず上位5件のチャンクをプロンプトに入れます**。「今日の晩ごはんは何がいい？」のような無関係な質問でも、類似度の低いチャンクが無理やり渡されてしまいます。

**要件**

- 類似度（`similarity`）が一定値（例: 0.5）未満のチャンクは、検索結果から除外する
- 1件も残らなかった場合は、Claudeを**呼び出さずに**「カリキュラムに関係する質問をしてください」と返す

<details markdown="1">
<summary>ヒントを見る</summary>

- `searchChunks`はすでに`similarity`を返しています。SQLの`WHERE`で絞ることも、TypeScript側で`filter`することもできます
- 「Claudeを呼ばずに早期リターン」は、`ask()`の先頭付近に`if`を1つ足すだけです。**呼ばなければ料金もかかりません**
- しきい値の正解は1つではありません。いくつかの質問で`similarity`の実際の値をログに出して、感覚をつかんでから決めましょう

</details>

<details markdown="1">
<summary>解答例を見る</summary>

**`src/chat/chat.service.ts`（`ask`メソッドの冒頭を変更）**

```typescript
const SIMILARITY_THRESHOLD = 0.5;

async ask(question: string): Promise<{ answer: string; sources: string[] }> {
  const queryVector = await this.embeddings.embedQuery(question);
  const chunks = (await this.searchChunks(queryVector)).filter(
    (c) => c.similarity >= SIMILARITY_THRESHOLD,
  );

  if (chunks.length === 0) {
    return {
      answer:
        'その質問に関係する内容がカリキュラムに見つかりませんでした。カリキュラムに関係する質問をしてください。',
      sources: [],
    };
  }

  // 以降は元の実装と同じ
  // ...
}
```

ポイントは、**無関係な質問に対してClaude APIの呼び出し自体をスキップしている**ことです。精度の改善と同時にコスト削減にもなっています。しきい値はモデルやドキュメントの性質によって最適値が変わるため、実データで調整するものだと覚えておいてください。

</details>

## 課題2：出典から本文を確認できるようにする

現在のUIは出典のファイル名を表示するだけです。「本当にそう書いてあるのか」を確認できるようにしましょう。

**要件**

- APIのレスポンスに、回答の根拠になったチャンクの本文（`content`）と類似度を含める
- Reactの画面で、出典部分をクリック（または開閉）すると該当チャンクの本文が読める

<details markdown="1">
<summary>ヒントを見る</summary>

- `ChatService.ask()`の戻り値の型を変えます。例: `sources: { source: string; content: string; similarity: number }[]`
- フロント側は、HTMLの`<details>`と`<summary>`タグを使うとJavaScriptなしで開閉UIが作れます
- 「回答の根拠を人間が検証できること」はRAGの大きな利点です（→ [RAGとファインチューニングの違い](/ai-chat/what_is_rag/)）。それをUIとして形にする課題です

</details>

## 課題3：会話履歴に対応する

現在のボットは1問1答です。「それってどういう意味？」のような**続きの質問**が通じません。

**要件**

- フロントエンドから、これまでの会話履歴も一緒に送る
- NestJS側で履歴をClaudeの`messages`配列に変換して渡す
- 履歴は直近5往復（10メッセージ）までに制限する

<details markdown="1">
<summary>ヒントを見る</summary>

- [Claude APIの基礎](/ai-chat/claude_api/)の「会話履歴：APIは前の会話を覚えていない」を読み返してください。`user`と`assistant`を交互に並べるのでした
- Reactの`messages`ステートがそのまま履歴です。`fetch`のbodyに含めて送りましょう
- ただし、`history`には**送信中の質問自身を含めない**こと。[Q&Aボットを構築する](/ai-chat/build_rag_chat/)のフロントはfetchの前に質問を`messages`ステートへ追加しているため、追加後のステートをそのまま渡すと`user`ロールが連続し、Claude APIが400エラーを返します。履歴は`assistant`で終わる状態にして送りましょう
- DTOには配列のバリデーションが必要です。`@ValidateNested({ each: true })`や`@Type(() => ...)`を調べてみましょう
- 検索（embedding）には**最新の質問だけ**を使うのが第一歩としては簡単です。「それ」のような指示語を含む質問の検索精度を上げたければ、「直前のやりとり＋最新の質問」をまとめてベクトル化する方法もあります
- 履歴の上限を設けるのは、**入力トークン（＝料金）が会話のたびに増え続ける**のを防ぐためです

</details>

<details markdown="1">
<summary>解答例（NestJS側の骨格）を見る</summary>

**`src/chat/dto/ask-question.dto.ts`**

```typescript
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class HistoryItemDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(4000)
  content: string;
}

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryItemDto)
  history?: HistoryItemDto[];
}
```

**`src/chat/chat.service.ts`（Claude呼び出し部分の変更）**

```typescript
let history = (dto.history ?? []).slice(-10); // 直近10メッセージに制限

// 末尾がuserだとAPIが組み立てるuserメッセージと連続して400になるため、
// 念のためassistantで終わる状態に整える
while (history.length > 0 && history[history.length - 1].role === 'user') {
  history = history.slice(0, -1);
}

const message = await this.anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system: SYSTEM_PROMPT,
  messages: [
    ...history,
    {
      role: 'user',
      content: `${context}\n\n上の資料を根拠に、次の質問に答えてください。\n質問: ${question}`,
    },
  ],
});
```

検索用のembeddingは従来どおり最新の`question`だけで作り、Claudeには履歴＋資料＋質問を渡す、という分担です。フロント側は`messages`ステートから`role`と`content`だけを抜き出して`history`として送ります（出典など余計なプロパティは送らないこと）。

このとき、`history`に**送信中の質問自身を含めない**よう注意してください。[Q&Aボットを構築する](/ai-chat/build_rag_chat/)のフロントはfetchの前に質問を`messages`ステートへ追加しているため、追加後のステートをそのまま渡すと、履歴末尾の`user`とサーバー側で組み立てる`user`（資料＋質問）が連続し、Claude APIが「rolesは交互に並べること」という400エラーを返します。質問を追加する**前**の`messages`（＝`assistant`で終わる履歴）から`history`を作って送るのが正解です。上のコードの`while`は、それでも末尾に`user`が残っていた場合の保険です。

</details>

## 課題4（発展）：回答をストリーミング表示する

回答が完成するまで「考え中...」のまま待つのではなく、[Claude APIの基礎](/ai-chat/claude_api/)で学んだストリーミングを使って、**生成されたそばから文字を表示**しましょう。

**要件**

- NestJSに、回答を少しずつ返すエンドポイントを追加する
- Reactで、届いた断片を順次画面に追記する

<details markdown="1">
<summary>ヒントを見る</summary>

- サーバーからクライアントへ少しずつデータを送る方式の比較は[リアルタイム通信](/realtime/what_is_realtime/)で学びます。ここでは最も簡単な「**HTTPレスポンスを少しずつ書き込む**（チャンク転送）」方式で十分です
- NestJSでは`@Res()`でExpressのレスポンスオブジェクトを直接受け取り、`res.write()`で断片を書き込み、最後に`res.end()`します
- SDKの`client.messages.stream(...)`の`on('text', ...)`の中で`res.write(text)`を呼びます
- フロントは`fetch`のレスポンスを`res.body.getReader()`で読み、`TextDecoder`で文字列にして、最後のメッセージに追記していきます

</details>

<details markdown="1">
<summary>解答例（骨格）を見る</summary>

**`src/chat/chat.controller.ts`（追加）**

```typescript
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Post('stream')
async askStream(@Body() dto: AskQuestionDto, @Res() res: Response) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  await this.chatService.askStream(dto.question, (text) => res.write(text));
  res.end();
}
```

**`src/chat/chat.service.ts`（追加）**

```typescript
async askStream(
  question: string,
  onText: (text: string) => void,
): Promise<void> {
  const queryVector = await this.embeddings.embedQuery(question);
  const chunks = await this.searchChunks(queryVector);
  const context = chunks
    .map((c, i) => `【資料${i + 1}（出典: ${c.source}）】\n${c.content}`)
    .join('\n\n');

  const stream = this.anthropic.messages.stream({
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

  stream.on('text', onText);
  await stream.finalMessage(); // 全部流れ終わるまで待つ
}
```

**フロント側（`fetch`部分の変更イメージ）**

```typescript
const res = await fetch('http://localhost:3000/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();

// 空のassistantメッセージを先に追加しておき、断片が届くたびに末尾に追記する
setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  setMessages((prev) => {
    const next = [...prev];
    const last = next[next.length - 1];
    next[next.length - 1] = { ...last, content: last.content + text };
    return next;
  });
}
```

この方式では出典（`sources`）を返す場所がなくなる、という新しい課題に気づいたでしょうか。実務では「最初に出典をJSONで送ってから本文を流す」「SSE形式でイベントの種類を分ける」などの設計が必要になります。興味があれば挑戦してみてください。

</details>

## 課題5（発展）：チャンク分割を改善する

現在の分割は「見出し→長さ」の単純な方式です。チャンクの境界で文脈が切れて、検索精度が落ちることがあります。

**要件（いずれか1つ以上）**

- **オーバーラップ**：隣り合うチャンクの末尾と先頭を100文字程度重複させ、境界の文脈切れを緩和する
- **見出しの引き継ぎ**：チャンクの先頭に「どのページ・どの見出しの配下か」（例: `react/hooks.md > 依存配列`）を付与してからベクトル化する

変更後は取り込みスクリプトを再実行し、**同じ質問への検索結果（ヒットするチャンクと類似度）が変わるか**を比べてみましょう。

<details markdown="1">
<summary>ヒントを見る</summary>

- 比較のために、変更前の検索結果（質問・ヒットしたチャンク・類似度）をメモしておくこと。改善は「測ってから」が鉄則です
- 見出しの引き継ぎは効果が出やすい改善です。「依存配列」とだけ書かれたチャンクより、「react/hooks.md > 依存配列」が付いたチャンクのほうが、質問とのマッチに使える手がかりが増えるからです
- 再取り込みにはembedding費用がかかります。まず一部のファイルで効果を確かめましょう

</details>

## 課題6（発展）：ベクトルインデックスを張る

数百件なら全件スキャンで十分ですが、データが増えたときのために、pgvectorの**HNSWインデックス**を体験しておきましょう。

**要件**

- `DocumentChunk.embedding`にHNSWインデックスを作成する
- インデックスはPrismaのスキーマでは表現できないため、マイグレーションSQLを手書きする

<details markdown="1">
<summary>ヒントを見る</summary>

- `pnpm exec prisma migrate dev --create-only --name add_hnsw_index`で「空のマイグレーション」を作り、生成された`migration.sql`にSQLを書き足してから`pnpm exec prisma migrate dev`で適用します
- コサイン距離（`<=>`）で検索しているので、演算子クラスは`vector_cosine_ops`を指定します

</details>

<details markdown="1">
<summary>解答例を見る</summary>

**`prisma/migrations/XXXX_add_hnsw_index/migration.sql`**

```sql
CREATE INDEX document_chunk_embedding_idx
  ON "DocumentChunk"
  USING hnsw (embedding vector_cosine_ops);
```

HNSWは「近似」最近傍探索のためのインデックスです。厳密な全件スキャンと比べて、ごくまれに順位が入れ替わる可能性がある代わりに、件数が増えても高速に検索できます。今回のデータ量では速度差を体感しにくいですが、**「`Unsupported`型の列に対するDDLは、マイグレーションSQLの手書きで対応する**」というPrismaの実務テクニックは覚えておく価値があります（→ [マイグレーションの仕組み](/database/schema_and_migration/)）。

</details>

## 理解度チェック

**Q1. 課題1で「しきい値未満ならClaudeを呼ばない」ようにしました。この変更には品質以外にどんな利点がありますか。**

<details markdown="1">
<summary>解答を見る</summary>

API呼び出し自体をスキップするため、その分の料金（Voyage AIの後のClaude呼び出し分）と応答時間を節約できます。無関係な質問はそもそも生成に進ませない、という「早期リターン」は、外部APIを使うアプリ全般で有効なコスト・性能対策です。

</details>

**Q2. 会話履歴を「直近10メッセージまで」に制限するのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

Claude APIは会話を覚えていないため、履歴は毎回まるごと送る必要があり、無制限だと会話が続くほど入力トークン数＝料金と応答時間が増え続けるからです。また、モデルが一度に読めるテキスト量（コンテキストウィンドウ）にも上限があります。直近のやりとりに絞ることで、文脈の維持とコストのバランスをとっています。

</details>

**Q3. 「検索の改善（課題1・5・6）」と「生成・体験の改善（課題3・4）」では、直しているRAGの段階が違います。それぞれどの段階ですか。**

<details markdown="1">
<summary>解答を見る</summary>

課題1・5・6はRetrieval（検索）段階の改善です。どのチャンクを、どんな品質・速度で取り出すかに効きます。課題3・4はAugmentation〜Generation（プロンプト組み立てと生成）およびUI体験の改善です。RAGの精度が悪いとき、「検索が悪いのか、プロンプトと生成が悪いのか」を切り分けて考えられることが、RAG開発者としての第一歩です。

</details>

## セルフレビュー

- [ ] 課題1〜3を、解答例を見る前に自力で一度は試した
- [ ] 類似度のしきい値を、実際の`similarity`の値を観察して決めた
- [ ] 会話履歴ありでも、APIキーや料金の安全装置（上限・バリデーション）を保てた
- [ ] 改善の前後で「同じ質問」を使って結果を比較した
- [ ] 検索（Retrieval）の問題と生成（Generation）の問題を切り分けて説明できる
- [ ] 各課題で、どのファイルのどの層（DTO / Service / UI / DB）を直したか言える

## 次のステップ

これでAIチャット開発（RAG）のセクションは完了です。LLMの限界をアーキテクチャで補い、検索・生成・UIをひとつのアプリケーションに組み上げる経験をしました。

このRAGの考え方は、[SNS開発](/sns/)で作ったアプリに「投稿検索」「ヘルプQ&A」「管理者向け問い合わせ補助」のようなAI機能を追加するときにも応用できます。SNS本体と同じように、機能を1つずつ積み上げ、小さく動作確認しながら進めてください。

また、今回のQ&Aボットは題材を変えればそのまま実務に通じます。自分の学習ノートや好きなOSSのドキュメントを取り込んでみるなど、ぜひ「自分のRAG」を育ててみてください。
