---
title: リアクティブとコンポーネント
parent: Vue.js入門
section_key: vue
section_title: Vue.js入門
nav_order: 3
---

# リアクティブとコンポーネント

Vue.jsの中心は、リアクティブな状態とコンポーネントです。

リアクティブとは、値が変わったときに、その値を使っている画面も自動で更新されることです。Reactでstateが変わると再レンダリングされる感覚に近いです。

## refで状態を作る

```vue
<script setup lang="ts">
import { ref } from "vue";

const keyword = ref("");
</script>

<template>
  <input v-model="keyword" placeholder="検索" />
  <p>検索語: {{ keyword }}</p>
</template>
```

コードの意味です。

- `keyword` は、検索フォームの入力値です。
- `ref("")` は、初期値が空文字の状態を作ります。
- `v-model="keyword"` は、inputの値と `keyword` を結びつけます。
- `{{ keyword }}` は、入力中の値を画面に表示します。

## コンポーネントに分ける

Vue.jsでも、Reactと同じように画面を小さな部品に分けます。

```vue
<script setup lang="ts">
defineProps<{
  title: string;
  done: boolean;
}>();
</script>

<template>
  <li>
    <span v-if="done">完了</span>
    <span v-else>未完了</span>
    {{ title }}
  </li>
</template>
```

コードの意味です。

- `defineProps` は、親から受け取る値を定義します。
- `title` は、Todoのタイトルです。
- `done` は、完了状態です。
- `v-if="done"` は、完了しているときだけ表示します。
- `v-else` は、完了していないときに表示します。

## 親から子へデータを渡す

Reactのpropsと同じように、Vue.jsでも親から子へ値を渡します。

```vue
<script setup lang="ts">
import TodoItem from "./TodoItem.vue";

const todo = {
  title: "API通信を復習する",
  done: false,
};
</script>

<template>
  <TodoItem :title="todo.title" :done="todo.done" />
</template>
```

コードの意味です。

- `import TodoItem` は、子コンポーネントを読み込んでいます。
- `todo` は、親コンポーネントが持っているデータです。
- `:title="todo.title"` は、子にタイトルを渡します。
- `:done="todo.done"` は、子に完了状態を渡します。

## よくあるミス

> よくあるミスは、scriptの中で `ref` の値を読むときに `.value` を忘れることです。templateの中では自動で展開されますが、scriptの中では `keyword.value` のように書きます。

もう1つのミスは、子コンポーネントのpropsを直接書き換えようとすることです。親から受け取った値は、基本的に親が管理します。子から親に変更を伝えるときは、emitを使います。

## 練習問題

### 問題

`name` という入力値を持ち、入力中の名前を `こんにちは、〇〇さん` と表示するVueコンポーネントを考えてください。

<details>
<summary>答え例</summary>

```vue
<script setup lang="ts">
import { ref } from "vue";

const name = ref("");
</script>

<template>
  <input v-model="name" placeholder="名前" />
  <p>こんにちは、{{ name }}さん</p>
</template>
```

`v-model` がinputと `name` を結びつけるので、入力すると表示も変わります。

</details>

## 次に進む

次は[フォーム・一覧・API通信](/vue/directives_forms_api/)で、Vue.jsの実用UIを見ます。
