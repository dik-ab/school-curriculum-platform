---
title: フォーム・一覧・API通信
parent: Vue.js入門
section_key: vue
section_title: Vue.js入門
nav_order: 4
---

# フォーム・一覧・API通信

Vue.jsでも、React基礎で学ぶフォーム、一覧、API通信は重要です。

違うのは書き方です。Reactでは `useState`、`map`、`onChange` をよく使います。Vue.jsでは `ref`、`v-for`、`v-model` をよく使います。

## フォーム入力

```vue
<script setup lang="ts">
import { ref } from "vue";

const title = ref("");
</script>

<template>
  <label>
    タイトル
    <input v-model="title" />
  </label>
  <p>入力中: {{ title }}</p>
</template>
```

コードの意味です。

- `title` は、フォーム入力の状態です。
- `v-model="title"` は、inputの値と状態を同期します。
- `{{ title }}` は、現在の入力値を表示します。

## 一覧表示

```vue
<script setup lang="ts">
const posts = [
  { id: 1, title: "React基礎" },
  { id: 2, title: "Vue.js入門" },
];
</script>

<template>
  <ul>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

コードの意味です。

- `posts` は、表示したい投稿の配列です。
- `v-for="post in posts"` は、配列の件数分だけ `<li>` を作ります。
- `:key="post.id"` は、各行を安定して識別するための値です。
- `{{ post.title }}` は、投稿タイトルを表示します。

## API通信

Vue.jsでも、まずは通常の `fetch` を理解しておけば大丈夫です。

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue";

type Post = {
  id: number;
  title: string;
};

const posts = ref<Post[]>([]);
const loading = ref(true);

onMounted(async () => {
  const response = await fetch("/api/posts");
  posts.value = await response.json();
  loading.value = false;
});
</script>

<template>
  <p v-if="loading">読み込み中...</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">
      {{ post.title }}
    </li>
  </ul>
</template>
```

コードの意味です。

- `Post` は、APIから返る投稿データの型です。
- `posts` は、投稿一覧の状態です。
- `loading` は、読み込み中かどうかの状態です。
- `onMounted` は、コンポーネントが画面に出たあとに処理を実行します。
- `fetch("/api/posts")` は、APIから投稿一覧を取得します。
- `v-if="loading"` は、読み込み中だけメッセージを表示します。
- `v-else` は、読み込み完了後に一覧を表示します。

## よくあるミス

> よくあるミスは、`posts = await response.json()` のように `ref` 自体へ代入してしまうことです。scriptの中では `posts.value = ...` と書きます。

もう1つのミスは、エラー表示を用意しないことです。実務ではAPIが失敗することもあるため、Reactと同じように `loading` と `error` の状態を分けて持ちます。

## 練習問題

### 問題

Vue.jsでTodo一覧を表示するとき、Reactの `map` に近い役割をするVueの書き方は何ですか。

<details>
<summary>答え例</summary>

`v-for` です。

```vue
<li v-for="todo in todos" :key="todo.id">
  {{ todo.title }}
</li>
```

`todos` 配列の各要素を `todo` として取り出し、件数分だけ `<li>` を作ります。

</details>

## 次に進む

次は[このカリキュラムでの扱い](/vue/curriculum_scope/)で、Vue.jsをどこまで学ぶか整理します。
