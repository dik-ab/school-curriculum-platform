---
title: このカリキュラムでの扱い
parent: Next.js入門
section_key: nextjs
section_title: Next.js入門
nav_order: 5
---

# このカリキュラムでの扱い

このカリキュラムでは、TodoアプリとSNSアプリの実装解説はReactを基準にします。

理由は単純です。React、Next.js、Vue.js、Nuxtのすべてで同じTodo/SNSを作ると、学習量が膨大になり、初学者が本来身につけるべき「状態管理」「フォーム」「API通信」「コンポーネント分割」がぼやけてしまうからです。

## Reactを基準にする理由

React基礎で学ぶ内容は、フロントエンド開発の中心になります。

- 入力フォームをstateで管理する
- 配列を一覧表示する
- APIから取得したデータを画面に出す
- ローディングとエラーを表示する
- コンポーネントに分けて読みやすくする

これらは、Next.jsでも必要です。Next.jsを使っても、ブラウザで動くUI部分はReactで書きます。

## Next.jsでは何を理解すればよいか

この入門で到達したいゴールは、Next.jsの全機能を使いこなすことではありません。

| 学ぶこと | 到達目標 |
| --- | --- |
| App Router | URLとファイル構成の関係が分かる |
| Server / Client | どちらで動く処理か判断できる |
| レンダリング | SSRやSSGという選択肢があると分かる |
| Route Handler | 軽いAPIを同じプロジェクトに置けると分かる |
| 分担判断 | 専用バックエンドと分ける理由が分かる |

## Todoアプリでの考え方

React基準のTodoアプリでは、次の流れを学びます。

```tsx
type Todo = {
  id: number;
  title: string;
  done: boolean;
};

function TodoItem({ todo }: { todo: Todo }) {
  return <li>{todo.done ? "完了" : "未完了"}: {todo.title}</li>;
}
```

コードの意味です。

- `type Todo` は、Todoデータの形を定義しています。
- `id` は、Todoを区別する番号です。
- `title` は、画面に表示するタスク名です。
- `done` は、完了しているかどうかです。
- `TodoItem` は、1件のTodoを表示するReactコンポーネントです。

Next.jsでTodoを作る場合も、このUI部品の考え方は変わりません。違うのは、ページの置き場所、データ取得のタイミング、サーバー側処理の分担です。

## SNSアプリでの考え方

SNS開発でも、投稿一覧、投稿フォーム、いいね、プロフィール編集などはReactのコンポーネントとして考えます。

Next.jsを使うなら、プロフィールページや投稿詳細ページのURL設計、サーバー側でのデータ取得、SEOなどを追加で考えます。ただし、このカリキュラムではSNS実装の主軸はReact + API連携に置きます。

## よくあるミス

> よくあるミスは、「Next.jsを学ぶならReactのTodoを飛ばしてよい」と考えることです。Next.jsでもUI部分はReactなので、React基礎を飛ばすと結局つまずきます。

もう1つのミスは、フレームワーク比較に時間を使いすぎることです。最初の実践では、1つの技術で最後まで作り切る経験の方が重要です。

## 練習問題

### 問題

TodoアプリとSNSアプリをReact基準で学ぶ理由を、学習量と応用の観点から説明してください。

<details>
<summary>答え例</summary>

React、Next.js、Vue.js、Nuxtのすべてで同じアプリを作ると、学習量が大きくなりすぎます。まずReactで状態管理、フォーム、一覧表示、API通信を固めれば、Next.jsでもUI部分の考え方を応用できます。

</details>

## 次に進む

Next.jsの入門を読んだら、React基礎に戻ってTodoアプリを作る流れを確認してください。
