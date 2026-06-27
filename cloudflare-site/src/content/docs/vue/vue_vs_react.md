---
title: Reactとの違い
parent: Vue.js入門
section_key: vue
section_title: Vue.js入門
nav_order: 2
---

# Reactとの違い

ReactとVue.jsは、どちらもUIをコンポーネントとして作るための技術です。

大きな違いは、ReactがJavaScriptの中にJSXを書き、Vue.jsがHTMLに近いtemplateを中心に書くことです。

## 書き方の違い

Reactでは、条件分岐や一覧表示をJavaScriptの式で書きます。

```tsx
type Todo = {
  id: number;
  title: string;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

Vue.jsでは、templateの中で `v-for` を使います。

```vue
<script setup lang="ts">
type Todo = {
  id: number;
  title: string;
};

defineProps<{
  todos: Todo[];
}>();
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      {{ todo.title }}
    </li>
  </ul>
</template>
```

Vueコードの意味です。

- `type Todo` は、Todoデータの形です。
- `defineProps<{ todos: Todo[] }>()` は、親コンポーネントから受け取るpropsを定義します。
- `<li v-for="todo in todos">` は、配列を繰り返して表示します。
- `:key="todo.id"` は、各行を区別するための値です。
- `{{ todo.title }}` は、Todoのタイトルを画面に表示します。

## 状態の違い

Reactでは `useState` を使います。

Vue.jsでは `ref` を使います。

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
```

コードの意味です。

- `ref(0)` は、リアクティブな状態を作ります。
- `count.value++` は、scriptの中で値を更新しています。
- `@click="increment"` は、クリック時に関数を呼びます。
- templateの中では、`count.value` ではなく `count` と書けます。

## 比較表

| 観点 | React | Vue.js |
| --- | --- | --- |
| 画面の書き方 | JSX | template |
| 状態 | `useState` | `ref` / `reactive` |
| 一覧表示 | `map` | `v-for` |
| 条件表示 | 三項演算子や `&&` | `v-if` |
| フォーム | `value` と `onChange` | `v-model` |
| ファイル | `.tsx` | `.vue` |

## よくあるミス

> よくあるミスは、Vue.jsのtemplateを普通のHTMLと完全に同じだと思うことです。`v-for`、`v-if`、`:key`、`@click` など、Vue.js独自の書き方があります。

React経験者がVue.jsに入るときは、`map` で一覧を書く感覚を `v-for` に置き換えると理解しやすくなります。

## 練習問題

### 問題

Reactの `useState` とVue.jsの `ref` は、どちらも何をするためのものですか。

<details>
<summary>答え例</summary>

どちらも、画面と連動する状態を持つためのものです。値が変わると、対応するUIも更新されます。

</details>

## 次に進む

次は[リアクティブとコンポーネント](/vue/reactivity_and_components/)で、Vue.jsの部品化を見ます。
