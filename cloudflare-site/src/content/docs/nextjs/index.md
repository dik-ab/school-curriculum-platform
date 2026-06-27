---
title: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 8
description: Reactを土台にしたフルスタック寄りのフレームワークとして、Next.jsの役割、ルーティング、レンダリング、サーバー機能を学びます。
---

# Next.js入門

## フレームワークとは

フレームワークは、アプリを作るための「決まった作り方」と「便利な機能」をまとめたものです。

Reactだけでも画面は作れますが、実務のWebアプリでは次のようなことも必要になります。

- URLごとにページを分ける
- 初回表示を速くする
- サーバー側でデータを取得する
- APIの入口を用意する
- 画像やフォントを最適化する
- 本番環境にデプロイしやすくする

Next.jsは、Reactを土台にして、これらをまとめて扱えるようにしたフレームワークです。

> 実務では、Reactは「UI部品を作る力」、Next.jsは「ページ、サーバー処理、デプロイまで含めてアプリ全体を作る力」と考えると分かりやすいです。

## Next.jsでできること

| 機能 | 何を解決するか |
| --- | --- |
| ファイルベースルーティング | ファイル構成からURLを作れる |
| Server Components | サーバー側でデータ取得しやすい |
| Client Components | クリックや入力などブラウザ上の操作を扱える |
| API Route / Route Handler | 簡単なAPIを同じプロジェクト内に作れる |
| SSR / SSG | 表示速度やSEOを考えたページ生成ができる |

## Reactとの関係

Next.jsはReactの代わりではありません。Reactの上に乗るフレームワークです。

Reactで学んだ内容は、そのままNext.jsでも使います。

- コンポーネント
- props
- state
- hooks
- フォーム
- API通信

そのうえで、Next.jsでは「どのURLでどのページを表示するか」「サーバーでどこまで処理するか」を追加で学びます。

## 最小イメージ

Next.jsでは、`app` フォルダの中にページを作ります。

```tsx
export default function HomePage() {
  return <h1>Home</h1>;
}
```

コードの意味です。

- `export default function HomePage()` は、ページコンポーネントを定義しています。
- `return <h1>Home</h1>;` は、画面に表示するHTML相当の内容です。
- Next.jsでは、このようなページファイルがURLと結びつきます。

## バックエンドもできるとはどういうことか

Next.jsは、画面だけでなくサーバー側の処理も一部書けます。

例えば、次のような用途です。

- フォーム送信を受け取る
- DBからデータを取得する
- ログイン状態を確認する
- 外部APIを呼び出して画面に渡す

ただし、複雑な業務APIを全部Next.jsに詰め込むべきとは限りません。大きなアプリでは、Next.jsをフロントエンド、NestJSやSpring BootをバックエンドAPIとして分ける構成もよくあります。

## このカリキュラムでの位置づけ

まずはReact基礎を学びます。その後、Next.jsでは次を扱うとよいです。

1. App Routerの考え方
2. ページとレイアウト
3. Server ComponentとClient Component
4. データ取得
5. Route Handlerによる簡単なAPI
6. 認証やDB接続は発展課題

## 練習問題

### 問題: ReactとNext.jsの違いを説明する

ReactとNext.jsの違いを、1〜2文で説明してください。

**答え例:**

ReactはUIを部品として作るためのライブラリです。Next.jsはReactを土台に、ルーティング、サーバー側の処理、ページ生成、デプロイしやすい構成まで提供するフレームワークです。

## 参考リンク

- [Next.js Docs](https://nextjs.org/docs) - Next.js公式ドキュメントです。
- [Next.js Learn](https://nextjs.org/learn) - 公式の学習教材です。App Routerやデータ取得を順番に学べます。
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - サーバー側とブラウザ側の役割分担を確認できます。
- [Vercel: Next.js Examples](https://vercel.com/templates/next.js) - 実際のテンプレートを見ながら構成を学べます。
