---
title: サーバー機能とAPI
parent: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 4
---

# サーバー機能とAPI

Next.jsは、画面だけでなくサーバー側の処理も一部書けます。

ここで大事なのは、「Next.jsはバックエンドもできる」という言葉を広く受け取りすぎないことです。軽いAPIや画面に近いサーバー処理は得意ですが、複雑な業務ロジックまで全部Next.jsに入れるのが常に正解ではありません。

## 何ができるか

Next.jsのサーバー機能では、次のような処理を扱えます。

- 外部APIをサーバー側から呼び出す
- APIキーをブラウザに出さずに使う
- フォーム送信を受け取る
- Cookieを読んでログイン状態を確認する
- Route Handlerで軽いAPIを作る

> 実務では、画面に近い処理はNext.js、複雑な業務ルールはNestJSやSpring BootなどのAPIに分ける構成がよくあります。

## Route Handlerの最小コード

`app/api/health/route.ts` を作ると、`/api/health` というAPIを用意できます。

```ts
export function GET() {
  return Response.json({
    status: "ok",
  });
}
```

コードの意味です。

- `GET` は、HTTPのGETリクエストを受け取る関数です。
- `Response.json(...)` は、JSON形式のレスポンスを返します。
- `{ status: "ok" }` は、APIの呼び出し元に返すデータです。

## フォーム送信のイメージ

例えば問い合わせフォームをNext.js内で受け取るなら、次のような形になります。

```ts
export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({
    receivedName: body.name,
  });
}
```

コードの意味です。

- `POST` は、フォーム送信などのPOSTリクエストを受け取ります。
- `request.json()` は、送られてきたJSONを読み取ります。
- `receivedName: body.name` は、受け取った名前をレスポンスに含めています。

実務では、このあとにバリデーション、DB保存、メール送信、認証チェックなどが入ります。

## 専用バックエンドと分ける判断

| Next.js内でよいことが多い | 専用バックエンドを検討すること |
| --- | --- |
| 軽いフォーム送信 | 複雑な権限管理 |
| 外部APIの中継 | 決済、請求、在庫など重要な業務処理 |
| 画面専用の小さなAPI | 複数アプリから使う共通API |
| Cookieを読んだ表示切り替え | 大量データ処理、バッチ処理 |

このカリキュラムのTodoアプリやSNSアプリでは、React画面と別バックエンドAPIを接続する形を基準にします。Next.jsだけで同じものを作る解説は行いません。

## よくあるミス

> よくあるミスは、APIキーや秘密情報をClient Componentに書いてしまうことです。ブラウザに送られるコードに秘密情報を書いてはいけません。

もう1つのミスは、Route Handlerを増やしすぎて、業務ロジックが画面プロジェクトに散らばることです。あとから別アプリやモバイルアプリでも同じAPIを使うなら、専用バックエンドに分けた方が整理しやすくなります。

## 練習問題

### 問題

次の処理はNext.js内のRoute Handlerでよいか、専用バックエンドに分けるべきか考えてください。

1. お問い合わせフォームを受け取ってメール通知する
2. 銀行振込、請求、権限を含む受注管理
3. 外部APIのAPIキーを隠して検索結果だけ返す

<details>
<summary>答え例</summary>

1. 小さなフォームならRoute Handlerでも始められます。
2. 業務ルールが重く重要度も高いため、専用バックエンドを検討します。
3. APIキーを隠す目的ならRoute Handlerが役立ちます。

判断基準は、処理の重要度、再利用性、複雑さです。画面に近い軽い処理はNext.js、複雑で共通化したい処理は専用APIに分けます。

</details>

## 次に進む

次は[このカリキュラムでの扱い](/nextjs/curriculum_scope/)で、React中心で実践する理由を確認します。
