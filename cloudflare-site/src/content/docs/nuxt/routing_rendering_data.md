---
title: ルーティングとレンダリング
parent: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 3
---

# ルーティングとレンダリング

Nuxtでは、ファイル構成を使ってURLを作れます。Vue.js単体でVue Routerを設定するより、ページ単位の構成を始めやすいのが特徴です。

## pagesの基本

```txt
pages/
  index.vue
  posts/
    index.vue
    [id].vue
```

この構成の意味です。

- `pages/index.vue` は `/` に対応します。
- `pages/posts/index.vue` は `/posts` に対応します。
- `pages/posts/[id].vue` は `/posts/1` や `/posts/abc` に対応します。
- `[id]` は、URLの一部を変数として受け取るための書き方です。

## 詳細ページの最小コード

```vue
<script setup lang="ts">
const route = useRoute();
const postId = route.params.id;
</script>

<template>
  <h1>投稿ID: {{ postId }}</h1>
</template>
```

コードの意味です。

- `useRoute()` は、現在のURL情報を取得します。
- `route.params.id` は、`[id].vue` に入ったURLの値です。
- `postId` は、画面に表示する投稿IDです。
- `{{ postId }}` は、投稿IDを画面に埋め込みます。

## データ取得

Nuxtでは、ページでデータを取得するために `useFetch` がよく使われます。

```vue
<script setup lang="ts">
type Post = {
  id: number;
  title: string;
};

const { data: posts, pending, error } = await useFetch<Post[]>("/api/posts");
</script>

<template>
  <p v-if="pending">読み込み中...</p>
  <p v-else-if="error">読み込みに失敗しました</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

コードの意味です。

- `Post` は、APIから返る投稿データの型です。
- `useFetch<Post[]>("/api/posts")` は、投稿一覧を取得します。
- `posts` は、取得したデータです。
- `pending` は、読み込み中かどうかです。
- `error` は、失敗したときの情報です。
- `v-if`、`v-else-if`、`v-else` で状態に応じて表示を切り替えます。

## レンダリングの考え方

Nuxtでは、ページの性質に応じて表示方法を考えます。

| 表示方法 | ざっくりした意味 | 向いている例 |
| --- | --- | --- |
| SSR | サーバーでHTMLを作る | SEOが必要なページ |
| SPA | ブラウザ中心で動かす | 入力が多い管理画面 |
| 静的生成 | ビルド時にページを作る | 更新頻度が低いページ |

最初は「NuxtはVue.jsの画面をサーバー側表示にも広げられる」と理解できれば十分です。

## よくあるミス

> よくあるミスは、`pages` のファイル名とURLの関係を曖昧にしたまま進むことです。Nuxtではファイルの置き場所がURLに直結します。

もう1つのミスは、`pending` や `error` を表示しないことです。API通信では、読み込み中と失敗時のUIを用意するのが実務では基本です。

## 練習問題

### 問題

`/users` と `/users/10` を作るには、`pages` ディレクトリにどのようなファイルを置けばよいですか。

<details>
<summary>答え例</summary>

```txt
pages/
  users/
    index.vue
    [id].vue
```

- `users/index.vue` が `/users` です。
- `users/[id].vue` が `/users/10` のような詳細ページです。

</details>

## 次に進む

次は[サーバー機能とAPI](/nuxt/server_features/)で、Nuxtがバックエンド寄りの処理をどこまで扱えるか確認します。
