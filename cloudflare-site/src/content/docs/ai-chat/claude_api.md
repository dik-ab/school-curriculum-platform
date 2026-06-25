---
title: Claude APIの基礎
parent: AIチャット開発（RAG）
nav_order: 2
---

# Claude APIの基礎

このページでは、RAGの「Generation（生成）」を担当する**Claude API**を学びます。[AI開発入門](/ai/)ではClaude Codeという「完成品のツール」としてClaudeを使いましたが、今回は**自分のプログラムからAPIとしてClaudeを呼び出します**。

まずはRAGのことをいったん忘れて、「TypeScriptのコードからClaudeに質問して回答をもらう」という最小の形を作れるようになりましょう。

## 学習目標

- Claude APIのAPIキーを取得し、`.env`で安全に管理できる
- Messages APIのリクエストとレスポンスの構造を説明できる
- `@anthropic-ai/sdk`を使ってClaudeを呼び出すコードを書ける
- システムプロンプトと会話履歴（messages配列）の役割を説明できる
- ストリーミングの仕組みを理解し、SDKで実装できる

## Claude APIとは

Claude APIは、Anthropic社が提供する、ClaudeをプログラムからHTTPで呼び出すためのAPIです。[HTTPとREST](/backend/http_and_rest/)で学んだとおり、APIとは「リクエストを送るとレスポンスが返ってくる窓口」です。Claude APIの場合は、**プロンプト（テキスト）を送ると、Claudeが生成したテキストが返ってくる**というシンプルな構造をしています。

> **【重要】API利用料金について**
>
> Claude APIは**従量課金制の有料API**です。料金は送受信した**トークン数**（→ [LLMとは](/ai/what_is_llm/)）に応じて決まります。執筆時点で、このセクションで使うモデル`claude-sonnet-4-6`の料金は**入力100万トークンあたり3ドル、出力100万トークンあたり15ドル**です（最新の料金は必ず[公式の料金ページ](https://platform.claude.com/docs/en/pricing)で確認してください）。
>
> 学習で使う分には1回の質問で数円程度ですが、次の2点は必ず守ってください。
>
> 1. **APIキーを絶対に公開しない** — GitHubにコミットしてしまうと、第三者に不正利用されて高額請求につながる恐れがあります
> 2. **無限ループの中でAPIを呼ばない** — プログラムのバグで大量リクエストを送ると、その分だけ課金されます
>
> Anthropicのコンソールには利用額の上限（Spending Limit）を設定する機能があります。学習を始める前に、低めの上限を設定しておくことを強くおすすめします。

### APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)（現在は platform.claude.com に統合されており、リダイレクトされます）にアクセスし、アカウントを作成します
2. 支払い方法を設定し、クレジット（利用枠）を購入します（最小額でかまいません）
3. 「API Keys」のページで「Create Key」をクリックし、キーを作成します
4. 表示された`sk-ant-`で始まる文字列がAPIキーです。**この画面でしか表示されないので、安全な場所に控えてください**

### APIキーの管理：.envと.gitignore

APIキーは「あなたのアカウントでAPIを使ってよい」という証明書です。**コードに直接書いてはいけません**。コードはGitで管理され、いずれGitHubに置かれるからです。

代わりに、[Prismaの導入](/database/prisma_setup/)でも使った`.env`ファイルに書き、**環境変数**としてプログラムに読み込ませます。

**`.env`**

```bash
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxxxxxxxxx"
```

そして、`.env`が**Gitの管理対象から除外されていることを必ず確認**します（→ [.gitignoreの書き方](/git/basic_commands/)）。

**`.gitignore`**

```text
node_modules
.env
```

> **【重要】コミットしてしまったキーは「漏れたキー」**
>
> 一度でも`.env`をコミット・プッシュしてしまったら、たとえ直後にコミットを消しても、そのキーは漏えいしたものとして扱ってください。Gitの履歴には残り続けますし、公開リポジトリは常にボットに監視されています。その場合は、Anthropic Consoleで**即座にキーを無効化（Delete）して新しいキーを作り直す**のが正しい対処です。

## Messages APIの構造

Claude APIの中心は**Messages API**です。エンドポイントは1つだけです。

```text
POST https://api.anthropic.com/v1/messages
```

SDKを使う前に、生のHTTPリクエストの形を一度見ておきましょう。中身の構造を知っておくと、SDKのコードの意味がよくわかります。

**ターミナル（curlでの呼び出し例）**

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      { "role": "user", "content": "こんにちは。1+1は？" }
    ]
  }'
```

**コード解説**

- `anthropic-version: 2023-06-01` — APIのバージョンを指定するヘッダー。必須です
- `x-api-key` — 先ほど取得したAPIキーを渡すヘッダー。これが認証になります
- `model` — 使うモデルのID。ここでは`claude-sonnet-4-6`（速度と賢さのバランスが良い現行モデル）を指定
- `max_tokens` — 生成する回答の最大トークン数。回答がこの長さに達すると打ち切られます。**課金の上限を抑える安全装置**でもあります
- `messages` — 会話の配列。`role`は`user`（ユーザーの発言）か`assistant`（Claudeの発言）のどちらかです

レスポンスは次のようなJSONです。

```json
{
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-6",
  "content": [
    { "type": "text", "text": "こんにちは！1+1は2です。" }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 21,
    "output_tokens": 17
  }
}
```

**コード解説**

- `content` — 回答の本体。**配列**になっていることに注意してください。テキスト以外のブロックが入ることもあるため、テキストを取り出すときは`type: "text"`のブロックを探します
- `stop_reason` — 生成が止まった理由。`end_turn`は「自然に話し終えた」、`max_tokens`は「上限に達して打ち切られた」を意味します
- `usage` — 実際に消費したトークン数。**ここを見れば1リクエストの料金が計算できます**

## SDKで呼び出す：最小実装

毎回curlを書くのは大変なので、実際の開発では公式SDK**`@anthropic-ai/sdk`**を使います。小さな練習プロジェクトを作って試しましょう。

**ターミナル**

```bash
mkdir claude-practice
cd claude-practice
pnpm init
pnpm add @anthropic-ai/sdk dotenv
pnpm add -D typescript tsx @types/node
```

```text
Packages: +12
++++++++++++
Progress: resolved 12, reused 0, downloaded 12, added 12, done

dependencies:
+ @anthropic-ai/sdk 0.91.0
+ dotenv 16.4.5
```

**コード解説**

- `@anthropic-ai/sdk` — Claude APIの公式TypeScript SDK
- `dotenv` — `.env`ファイルの内容を環境変数として読み込むライブラリ
- `tsx` — TypeScriptファイルをコンパイルせずに直接実行できる開発用ツール（`pnpm exec tsx ファイル名`で実行します）

なお、pnpmの導入がまだの場合は[React基礎のセットアップ](/react/setup/)を参照してください。

プロジェクト直下に`.env`と`.gitignore`を先ほどの内容で作成したら、最初のプログラムを書きます。

**`hello.ts`**

```typescript
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'TypeScriptのconstとletの違いを1文で教えてください。' },
    ],
  });

  for (const block of message.content) {
    if (block.type === 'text') {
      console.log(block.text);
    }
  }

  console.log('消費トークン:', message.usage);
}

main();
```

**コード解説**

- `import 'dotenv/config'` — この1行で`.env`の内容が`process.env`に読み込まれます。**必ず他のimportより前に書きます**
- `new Anthropic({ apiKey: ... })` — クライアントの初期化。実は`ANTHROPIC_API_KEY`という環境変数名ならSDKが自動で読むため`apiKey`は省略可能ですが、どこからキーが来るのか明示するために書いています
- `client.messages.create(...)` — Messages APIの呼び出し。引数の構造はcurlで見たJSONと同じです
- `for (const block of message.content)` — `content`は配列なので、`text`タイプのブロックだけを取り出して表示します
- `message.usage` — 消費トークン数。料金感覚を養うため、学習中は毎回表示するのがおすすめです

実行してみましょう。

**ターミナル**

```bash
pnpm exec tsx hello.ts
```

```text
constは再代入できない変数を宣言し、letは再代入できる変数を宣言します。
消費トークン: { input_tokens: 32, output_tokens: 28 }
```

自分のコードからClaudeを呼び出せました。これがRAGの「Generation」部品の正体です。

## システムプロンプトと会話履歴

### システムプロンプト：AIの役割を決める

`system`パラメータを使うと、**AIの役割・口調・守るべきルール**を指定できます。ユーザーの発言（`messages`）とは別枠で渡すのがポイントです。

**`system.ts`（抜粋・`hello.ts`の`messages.create`部分を差し替え）**

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  system:
    'あなたはプログラミング初学者向けの先生です。' +
    '専門用語には必ず短い説明を添え、3文以内で簡潔に答えてください。',
  messages: [
    { role: 'user', content: 'DIって何ですか？' },
  ],
});
```

**コード解説**

- `system` — アプリケーション開発者が決める「前提の指示」。ユーザーがどんな質問をしても、Claudeはこの指示に従って答えようとします
- RAGでは、このシステムプロンプトに「**渡された文書を根拠に答えること**」というルールを書きます（→ [Q&Aボットを構築する](/ai-chat/build_rag_chat/)）

### 会話履歴：APIは前の会話を覚えていない

ここが初学者のつまずきポイントです。**Claude APIは1回ごとのリクエストが完全に独立しており、前回の会話を覚えていません**。チャットらしい「文脈のつながり」を作るには、**過去のやりとりを毎回`messages`配列に全部含めて送る**必要があります。

```typescript
const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: 'useStateって何ですか？' },
    { role: 'assistant', content: 'useStateはReactで状態を管理するためのフックです。' },
    { role: 'user', content: 'それを使った例を見せてください。' }, // 「それ」が通じる
  ],
});
```

**コード解説**

- `user`と`assistant`を交互に並べることで会話の流れを再現します
- 最後の`user`の「それ」が通じるのは、直前のやりとりが配列に含まれているからです
- 履歴が長くなるほど入力トークンが増え、**料金も増えます**。実際のアプリでは履歴の長さを制限するなどの工夫をします

## ストリーミング：回答を少しずつ受け取る

Claudeの回答生成には数秒〜十数秒かかることがあります。回答が全部できあがるまで画面が無反応だと、ユーザーは「壊れた？」と感じてしまいます。

そこで使うのが**ストリーミング**です。ChatGPTやClaudeのチャット画面で文字がパラパラと表示されていくのを見たことがあるはずです。あれは、**生成されたそばからテキストの断片を順次受け取って表示している**のです。

ストリーミングは**SSE（Server-Sent Events）**という、HTTPのレスポンスを細切れに送り続ける仕組みで実現されています（SSEの位置づけは[リアルタイム通信の比較](/realtime/what_is_realtime/)も参照）。通信の流れをシーケンス図で見てみましょう。

```mermaid
sequenceDiagram
    participant C as クライアント
    participant A as Claude API
    C->>A: POST /v1/messages (stream: true)
    A-->>C: message_start（生成開始）
    A-->>C: content_block_start
    A-->>C: content_block_delta「Type」
    A-->>C: content_block_delta「Scriptは」
    A-->>C: content_block_delta「JavaScriptに…」
    Note over C: 届いた断片を順次表示
    A-->>C: content_block_stop
    A-->>C: message_delta（stop_reasonなど）
    A-->>C: message_stop（生成完了）
```

通常のリクエストが「1回のレスポンスで完結」するのに対し、ストリーミングでは`message_start`から`message_stop`までの**イベントの連続**としてレスポンスが届きます。テキスト本体は`content_block_delta`イベントに少しずつ入っています。

SDKを使えば、このイベント処理を簡単に書けます。

**`streaming.ts`**

```typescript
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function main() {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'RAGとは何か、200字程度で説明してください。' },
    ],
  });

  stream.on('text', (text) => {
    process.stdout.write(text); // 届いた断片をそのまま出力（改行しない）
  });

  const finalMessage = await stream.finalMessage();
  console.log('\n---');
  console.log('消費トークン:', finalMessage.usage);
}

main();
```

**コード解説**

- `client.messages.stream(...)` — `create`の代わりに`stream`を使うと、ストリーミング用のヘルパーが返ります
- `stream.on('text', ...)` — テキストの断片（`content_block_delta`の中身）が届くたびに呼ばれるイベントハンドラです
- `process.stdout.write(text)` — `console.log`と違って改行を入れずに出力するので、断片がつながって1つの文章になります
- `await stream.finalMessage()` — ストリームの完了を待ち、全断片を結合した完成形のメッセージを返します。`usage`もここから取れます

実行すると、回答が一気にではなく**少しずつ表示されていく**のがわかるはずです。

**ターミナル**

```bash
pnpm exec tsx streaming.ts
```

```text
RAG（検索拡張生成）とは、LLMが回答を生成する前に、外部のデータベースや
文書から関連情報を検索し、その内容を根拠として回答を作る手法です。…
---
消費トークン: { input_tokens: 35, output_tokens: 156 }
```

## エラーへの備え

外部APIである以上、呼び出しは失敗することがあります。SDKはHTTPステータスに応じた例外を投げるので、`try...catch`で受け止めます。

```typescript
import Anthropic from '@anthropic-ai/sdk';

try {
  const message = await client.messages.create({ /* 省略 */ });
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    console.error(`APIエラー: status=${error.status}`);
    // 401: APIキーが不正 / 429: リクエストが多すぎる / 529: API側が混雑
  } else {
    throw error;
  }
}
```

**コード解説**

- `Anthropic.APIError` — SDKが投げるエラーの基底クラス。`status`プロパティでHTTPステータスコードを確認できます
- `401` — APIキーの間違い。`.env`の値とdotenvの読み込みを確認します
- `429` — レート制限（短時間に呼びすぎ）。SDKは自動で2回までリトライしてくれますが、それでも失敗したら時間を置きます

## 理解度チェック

**Q1. APIキーをコードに直接書いてはいけない理由と、正しい管理方法を説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

コードはGitで管理されGitHubなどに置かれるため、コードに書いたAPIキーは漏えいし、第三者による不正利用と高額請求につながる恐れがあるからです。正しくは、キーを`.env`ファイルに書いて環境変数として読み込み、`.env`自体を`.gitignore`に追加してGitの管理対象から外します。一度でもコミットしてしまったキーは無効化して作り直します。

</details>

**Q2. Messages APIのリクエストに必須の3つのパラメータは何ですか。それぞれの役割も答えてください。**

<details markdown="1">
<summary>解答を見る</summary>

- `model` — 使うモデルのID（例: `claude-sonnet-4-6`）
- `max_tokens` — 生成する最大トークン数。長すぎる回答の打ち切りと課金の上限設定を兼ねる
- `messages` — `user`と`assistant`のやりとりを並べた会話の配列

</details>

**Q3. 「Claude APIは前回の会話を覚えていない」とはどういうことですか。チャットアプリで文脈を保つにはどうしますか。**

<details markdown="1">
<summary>解答を見る</summary>

Claude APIの各リクエストは完全に独立していて、サーバー側に会話の状態は保存されません。文脈を保つには、過去のやりとり（userとassistantのメッセージ）をクライアント側で保持しておき、毎回のリクエストの`messages`配列にすべて含めて送ります。その分、入力トークン数（＝料金）は会話が長くなるほど増えます。

</details>

**Q4. レスポンスの`usage`と`stop_reason`は、それぞれ何を確認するために見ますか。**

<details markdown="1">
<summary>解答を見る</summary>

`usage`は実際に消費した入力・出力トークン数で、リクエスト1回あたりの料金を把握するために見ます。`stop_reason`は生成が終わった理由で、`end_turn`なら自然に完結、`max_tokens`なら上限到達による打ち切りを意味します。回答が途中で切れている場合は`stop_reason`が`max_tokens`になっていないかを確認します。

</details>

**Q5. ストリーミングを使うのはなぜですか。また、テキスト本体はどのイベントに乗って届きますか。**

<details markdown="1">
<summary>解答を見る</summary>

回答全体の生成には数秒以上かかることがあり、完成を待ってから表示するとユーザーには無反応に見えてしまうからです。ストリーミングなら生成されたそばから断片を表示でき、体感速度が大きく改善します。テキスト本体は`content_block_delta`イベントに少しずつ含まれて届きます（SDKでは`stream.on('text', ...)`で受け取れます）。

</details>

## セルフレビュー

- [ ] Anthropic ConsoleでAPIキーを発行し、利用額の上限を設定した
- [ ] `.env` + `.gitignore`によるAPIキー管理を、理由とセットで説明できる
- [ ] Messages APIのリクエストJSONを何も見ずに書ける
- [ ] `@anthropic-ai/sdk`での最小の呼び出しコードを写経せずに書ける
- [ ] システムプロンプトと`messages`配列の役割の違いを説明できる
- [ ] ストリーミングの流れ（イベントの並び）をシーケンス図で描ける
- [ ] `usage`を見て1リクエストのおおよその料金を計算できる

## 次のステップ

これでRAGの「Generation」部品が手に入りました。

次のページ: [embeddingとpgvector](/ai-chat/embeddings_and_pgvector/) — 今度は「Retrieval（検索）」の部品です。文章をベクトル化するVoyage AIと、ベクトルを保存・検索するpgvectorを学びます。

このページで書いた`messages.create`やストリーミングのコードは、[Q&Aボットを構築する](/ai-chat/build_rag_chat/)でNestJSのServiceの中に組み込みます。また、`.env`によるキー管理は[SNS開発](/sns/)を含む今後のすべての開発で使う基本動作です。
