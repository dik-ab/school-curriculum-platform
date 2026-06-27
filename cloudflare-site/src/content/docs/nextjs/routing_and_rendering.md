---
title: ルーティングとレンダリング
parent: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 3
---

# ルーティングとレンダリング

Next.jsでは、ファイル構成を使ってURLを作ります。この仕組みをファイルベースルーティングと呼びます。

Reactだけで作る場合、URLごとの画面切り替えにはReact Routerなどを追加することが多いです。Next.jsでは、フレームワーク側がルーティングのルールを持っています。

## App Routerの基本

`app` ディレクトリの中に `page.tsx` を置くと、ページになります。

```txt
app/
  page.tsx
  posts/
    page.tsx
    [id]/
      page.tsx
```

この構成の意味です。

- `app/page.tsx` は `/` に対応します。
- `app/posts/page.tsx` は `/posts` に対応します。
- `app/posts/[id]/page.tsx` は `/posts/1` や `/posts/abc` のような詳細ページに対応します。
- `[id]` は、URLの一部を変数として受け取るための書き方です。

## 詳細ページの最小コード

```tsx
type PostPageProps = {
  params: {
    id: string;
  };
};

export default function PostPage({ params }: PostPageProps) {
  return <h1>投稿ID: {params.id}</h1>;
}
```

コードの意味です。

- `PostPageProps` は、ページが受け取る値の型です。
- `params.id` には、URLの `[id]` に入った文字が入ります。
- `PostPage({ params })` は、URLパラメータを受け取るページコンポーネントです。
- `<h1>` で、受け取った投稿IDを画面に表示しています。

## レンダリングとは

レンダリングは、データやコンポーネントからHTMLや画面を作ることです。

Next.jsでは、ページの性質に合わせて表示方法を選べます。

| 種類 | ざっくりした意味 | 向いている例 |
| --- | --- | --- |
| SSR | リクエストごとにサーバーでHTMLを作る | ログイン後の画面、最新情報 |
| SSG | ビルド時にHTMLを作る | ブログ、ヘルプページ |
| CSR | ブラウザで表示を作る | 入力が多い管理画面 |

最初から用語を全部覚える必要はありません。まずは「Next.jsはサーバー側でも画面を準備できる」と理解してください。

## layoutの役割

`layout.tsx` は、複数ページで共通する外枠を作るファイルです。

```tsx
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav>投稿メニュー</nav>
      {children}
    </section>
  );
}
```

コードの意味です。

- `children` は、このレイアウトの中に表示されるページ本体です。
- `<nav>` は、投稿ページ共通のメニューです。
- `{children}` の場所に、`posts/page.tsx` や `posts/[id]/page.tsx` の内容が入ります。

## よくあるミス

> よくあるミスは、Reactのコンポーネント分割とNext.jsのページ分割を混同することです。コンポーネントはUI部品、`page.tsx` はURLに対応する画面です。

`components/PostCard.tsx` はURLになりません。URLにしたい場合は、`app/posts/page.tsx` のようにページファイルを作ります。

## 練習問題

### 問題

`/users` と `/users/42` を作りたい場合、`app` ディレクトリにどのようなファイルを置けばよいですか。

<details>
<summary>答え例</summary>

```txt
app/
  users/
    page.tsx
    [id]/
      page.tsx
```

- `users/page.tsx` が `/users` です。
- `users/[id]/page.tsx` が `/users/42` のような詳細ページです。

</details>

## 次に進む

次は[サーバー機能とAPI](/nextjs/server_features/)で、Next.jsがバックエンド寄りの処理をどこまで扱えるか確認します。
