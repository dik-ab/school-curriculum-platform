---
title: Reactとの違い
parent: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 2
---

# Reactとの違い

Next.jsはReactの代わりではありません。Reactの上に乗るフレームワークです。

Reactで学んだコンポーネント、props、state、hooks、フォーム、API通信はNext.jsでも使います。そのうえで、Next.jsでは「この処理はサーバーで動くのか、ブラウザで動くのか」を意識します。

## 役割の違い

| 観点 | React | Next.js |
| --- | --- | --- |
| 分類 | UIライブラリ | Reactフレームワーク |
| 得意なこと | コンポーネントで画面を作る | ページ、ルーティング、サーバー処理も扱う |
| URL | 自分で設計する | ファイル構成から作れる |
| データ取得 | ブラウザからfetchすることが多い | サーバー側でも取得できる |
| API | 別サーバーに置くことが多い | Route Handlerで軽いAPIも書ける |

> 実務では、ReactでUIの作り方を覚えてからNext.jsに進む方が理解が速いです。Next.jsの便利機能は、Reactの基礎の上に乗っています。

## Server ComponentとClient Component

Next.jsのApp Routerでは、コンポーネントを大きく2つに分けて考えます。

- Server Component: サーバー側で実行される。DBや外部APIからデータを取得しやすい。
- Client Component: ブラウザ側で実行される。クリック、入力、state、Effectを扱える。

クリックやフォーム入力を扱う場合は、ファイルの先頭に `"use client"` を書きます。

```tsx
"use client";

import { useState } from "react";

export default function CounterButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

コードの意味です。

- `"use client";` は、このコンポーネントをブラウザ側で動かす合図です。
- `useState(0)` は、クリックで変わる状態を作ります。
- `onClick={() => setCount(count + 1)}` は、ボタンを押したときに状態を更新します。
- `Count: {count}` は、現在の状態を画面に表示します。

## どこがReactと違うのか

Reactだけの学習では、ほとんどのコンポーネントがブラウザで動く前提で考えます。

Next.jsでは、最初からサーバー側で動くコンポーネントがあります。そのため、次のような判断が必要になります。

| やりたいこと | 置き場所の考え方 |
| --- | --- |
| DBから一覧を取得する | Server Componentやサーバー側処理 |
| ボタンを押して表示を変える | Client Component |
| フォーム入力をstateで持つ | Client Component |
| APIキーを使って外部APIを呼ぶ | サーバー側に置く |

## よくあるミス

> よくあるミスは、`useState` や `onClick` を使うコンポーネントに `"use client"` を書き忘れることです。Next.jsでは、ブラウザで動く必要がある処理を明示します。

もう1つのミスは、何でもClient Componentにしてしまうことです。サーバーで済むデータ取得までブラウザに寄せると、不要なJavaScriptが増えたり、APIキーを外に出してしまったりします。

## 練習問題

### 問題

次の機能はServer ComponentとClient Componentのどちらに置くべきか考えてください。

1. 投稿一覧をDBから取得する
2. いいねボタンを押したら数を増やす
3. 検索フォームに入力中の文字をstateで持つ

<details>
<summary>答え例</summary>

1. 投稿一覧をDBから取得する処理は、Server Componentやサーバー側処理に置くのが自然です。
2. いいねボタンのクリック処理は、Client Componentに置きます。
3. 入力中の文字をstateで持つ処理も、Client Componentに置きます。

判断基準は、「ブラウザ上の操作が必要か」です。クリックや入力が必要ならClient Component、サーバー側で完結するデータ取得ならServer Componentを考えます。

</details>

## 次に進む

次は[ルーティングとレンダリング](/nextjs/routing_and_rendering/)で、ページの作り方を確認します。
