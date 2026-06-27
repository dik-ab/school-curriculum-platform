---
title: サーバー機能とAPI
parent: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 4
---

# サーバー機能とAPI

Nuxtは、画面だけでなくサーバー側の処理も一部書けます。

Nuxtのサーバー機能は、Nitroというサーバーエンジンの上で動きます。初学者の段階では、まず「Nuxtの同じプロジェクト内に軽いAPIを置ける」と理解すれば十分です。

## 何ができるか

Nuxtのserver routesでは、次のような処理を扱えます。

- 軽いAPIを作る
- フォーム送信を受け取る
- 外部APIをサーバー側から呼び出す
- APIキーをブラウザに出さずに使う
- ページ表示前に必要なデータを準備する

ただし、複雑な業務APIをすべてNuxtに入れるべきとは限りません。

## server routeの最小コード

`server/api/health.get.ts` を作ると、`/api/health` で呼び出せるAPIになります。

```ts
export default defineEventHandler(() => {
  return {
    status: "ok",
  };
});
```

コードの意味です。

- `defineEventHandler` は、Nuxtのサーバー側でリクエストを処理する関数です。
- `return { status: "ok" }` は、JSONとして返すデータです。
- `health.get.ts` の `get` は、GETリクエスト用のAPIであることを表します。

## 投稿作成APIのイメージ

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ title: string }>(event);

  return {
    id: 1,
    title: body.title,
  };
});
```

コードの意味です。

- `event` は、リクエスト情報を持つ値です。
- `readBody<{ title: string }>(event)` は、送られてきたbodyを読み取ります。
- `title: body.title` は、受け取ったタイトルをレスポンスに含めています。
- 実務では、このあとにバリデーション、DB保存、認証チェックを追加します。

## 専用バックエンドとの分担

| Nuxt内で始めやすい処理 | 専用バックエンドを検討する処理 |
| --- | --- |
| 小さなフォーム送信 | 複雑な権限管理 |
| 外部APIの中継 | 決済や請求 |
| 画面専用の軽いAPI | 複数サービスから使う共通API |
| SEO用のデータ取得 | 大量データ処理、バッチ処理 |

このカリキュラムのTodoアプリやSNSアプリでは、React画面と専用APIをつなぐ形を基準にします。Nuxtだけで同じアプリを作る解説は行いません。

## よくあるミス

> よくあるミスは、Nuxtのserver routesに業務ロジックをどんどん詰め込むことです。小さなAPIには便利ですが、長く育つ業務APIは専用バックエンドに分けた方が保守しやすい場合があります。

もう1つのミスは、秘密情報をVueコンポーネント側に書くことです。APIキーや秘密のトークンは、ブラウザに送られないサーバー側に置きます。

## 練習問題

### 問題

次の処理はNuxtのserver routesで始めやすいか、専用バックエンドを検討すべきか考えてください。

1. 外部APIを呼び出して天気情報だけ返す
2. 複雑な権限と承認フローを持つ社内申請システム
3. お問い合わせフォームを受け取る

<details>
<summary>答え例</summary>

1. 外部APIの中継はserver routesで始めやすいです。
2. 複雑な業務ルールがあるため、専用バックエンドを検討します。
3. 小さなフォームならserver routesでも始められます。

判断基準は、処理の複雑さ、重要度、他アプリからの再利用性です。

</details>

## 次に進む

次は[このカリキュラムでの扱い](/nuxt/curriculum_scope/)で、React中心で実践する理由を確認します。
