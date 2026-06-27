---
title: Vue.jsとは何か
parent: Vue.js入門
section_key: vue
section_title: Vue.js入門
nav_order: 1
---

# Vue.jsとは何か

Vue.jsは、状態からUIを作るためのフロントエンドフレームワークです。

Reactと同じく、Vue.jsも「データが変わると画面が変わる」という考え方でアプリを作ります。違いは、Vue.jsがHTMLに近いテンプレート構文を中心にしている点です。

## どんな役割を持つか

素のJavaScriptでは、`document.querySelector` で要素を探し、`textContent` や `appendChild` で画面を書き換えます。小さい画面ならそれでも問題ありませんが、フォーム、一覧、検索、API通信が増えると管理が難しくなります。

Vue.jsでは、状態とテンプレートを結びつけます。

- 状態を変える
- Vue.jsが画面を更新する
- DOMを直接操作するコードを減らせる

> 実務では、Vue.jsは管理画面、Laravelと組み合わせた画面、小さく始めるSPAなどで見かけます。HTML/CSSの延長で読み始めやすいのが強みです。

## 最小コード

Vue.jsでは、`.vue` ファイルに画面と処理をまとめる書き方がよく使われます。

```vue
<script setup lang="ts">
import { ref } from "vue";

const message = ref("こんにちは");
</script>

<template>
  <p>{{ message }}</p>
</template>
```

コードの意味です。

- `<script setup lang="ts">` は、TypeScriptで処理を書く場所です。
- `import { ref } from "vue";` は、Vueの状態を作る関数を読み込んでいます。
- `ref("こんにちは")` は、画面と連動する状態を作ります。
- `<template>` は、画面に表示するHTML相当の内容です。
- `{{ message }}` は、状態の値を画面に埋め込みます。

## Vue.jsでできること

| 機能 | 何を解決するか |
| --- | --- |
| template | HTMLに近い見た目で画面を書ける |
| ref / reactive | 状態が変わると画面も変わる |
| component | UIを部品に分けられる |
| v-if / v-for | 条件表示や一覧表示を書きやすい |
| v-model | フォーム入力と状態を結びつけやすい |

## Reactと同じ目的

ReactとVue.jsは、どちらも複雑な画面を管理しやすくするための技術です。

| 共通点 | 内容 |
| --- | --- |
| 状態からUIを作る | データが変わると画面が変わる |
| コンポーネントで分ける | 大きな画面を小さな部品に分ける |
| API通信と組み合わせる | サーバーから取ったデータを画面に出す |
| TypeScriptと組み合わせる | propsやAPIレスポンスに型を付ける |

## よくあるミス

> よくあるミスは、Vue.jsを「HTMLを少し便利にするだけのもの」と捉えることです。Vue.jsは、状態管理、コンポーネント、ルーティング、Nuxtへの発展まで含めて、実務アプリを作る土台になります。

もう1つのミスは、ReactとVue.jsを完全に別物として覚えようとすることです。どちらも「状態からUIを作る」点は同じです。違うのは書き方と設計の癖です。

## 練習問題

### 問題

Vue.jsが素のJavaScriptより管理しやすくなる理由を1つ説明してください。

<details>
<summary>答え例</summary>

Vue.jsでは、状態を変えると画面が自動で更新されます。そのため、DOM要素を探して手動で書き換えるコードを減らせます。

</details>

## 次に進む

次は[Reactとの違い](/vue/vue_vs_react/)で、JSXとtemplateの違いを確認します。
