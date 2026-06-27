---
title: Next.jsとは何か
parent: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 1
---

# Next.jsとは何か

Next.jsは、Reactで作ったUIを、URLを持つWebアプリ全体に広げるためのフレームワークです。

Reactだけでも画面は作れます。しかし実務では、次のような要件がすぐ出てきます。

- `/login`、`/posts/1` のようにページを分けたい
- 初回表示を速くしたい
- SEOを考えて、サーバー側でHTMLを作りたい
- DBや外部APIから取得したデータをページ表示前に準備したい
- 画面と同じプロジェクト内に、軽いAPIの入口を置きたい

Next.jsは、これらをReactの考え方のまま扱えるようにします。

> 実務では、Reactは「画面部品を作る技術」、Next.jsは「Reactを使ってWebアプリ全体を組み立てる技術」と見ると判断しやすくなります。

## どんな場面で使うか

Next.jsは、次のような場面でよく使われます。

| 場面 | Next.jsが役立つ理由 |
| --- | --- |
| コーポレートサイト | SEOや表示速度を考えやすい |
| SaaSの管理画面 | Reactのコンポーネント設計をそのまま使える |
| ECサイト | 商品ページをURL単位で作りやすい |
| メディアサイト | サーバー側で記事データを取得しやすい |
| 小規模なフルスタックアプリ | Route Handlerで軽いAPIも書ける |

ただし、大きな業務システムでは、Next.jsだけですべてを作るとは限りません。画面はNext.js、業務APIはNestJS、Spring Boot、Laravelなどに分ける構成もよくあります。

## 最小コード

Next.jsでは、`app/page.tsx` のようなファイルがページになります。

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Todo Dashboard</h1>
      <p>今日のタスクを確認します。</p>
    </main>
  );
}
```

コードの意味です。

- `export default function HomePage()` は、このファイルが表示するページコンポーネントを定義しています。
- `<main>` は、ページの中心となる内容を表します。
- `<h1>` は、ページの見出しです。
- `<p>` は、見出しの補足文です。
- Next.jsでは、このファイルの置き場所によってURLが決まります。

## Reactだけのアプリとの違い

React + Viteでは、基本的にブラウザ上でReactアプリを動かします。URLルーティングやサーバー側の処理は、必要に応じて別ライブラリや別サーバーを組み合わせます。

Next.jsでは、最初からルーティング、ページ生成、サーバー側の処理を扱う考え方が入っています。

| 観点 | React + Vite | Next.js |
| --- | --- | --- |
| 主な役割 | UIを作る | Webアプリ全体を作る |
| ルーティング | 追加ライブラリを使うことが多い | ファイル構成で扱う |
| サーバー処理 | 別APIと分けることが多い | 一部を同じプロジェクトに書ける |
| SEO | 工夫が必要 | サーバー側レンダリングを選べる |

## よくあるミス

> よくあるミスは、「Next.jsを使えばバックエンドは全部いらない」と考えることです。認証、権限、決済、複雑な業務ルールが大きくなる場合は、専用バックエンドを分けた方が保守しやすいことがあります。

もう1つのミスは、Reactの基礎が曖昧なままNext.jsに進むことです。Next.jsのページも中身はReactコンポーネントです。props、state、hooks、フォーム、API通信が分からないと、Next.jsの便利機能も使いこなせません。

## 練習問題

### 問題

Reactだけで作るTodo画面に対して、Next.jsを使うと追加で扱いやすくなることを2つ書いてください。

<details>
<summary>答え例</summary>

- `/todos` や `/todos/1` のようなURLごとのページを作りやすくなる。
- サーバー側でTodoデータを取得してから画面を表示する構成を考えやすくなる。
- Route Handlerを使って、同じプロジェクト内に軽いAPIの入口を作れる。

ReactはUI部品を作る力が中心です。Next.jsは、そのUIをページ、ルーティング、サーバー側の処理に広げます。

</details>

## 次に進む

次は[Reactとの違い](/nextjs/react_difference/)で、Server ComponentsとClient Componentsの考え方を確認します。
