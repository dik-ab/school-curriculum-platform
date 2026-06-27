---
title: Vue・React・Next.jsとの違い
parent: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 2
---

# Vue・React・Next.jsとの違い

Nuxtを理解するには、Vue.js、React、Next.jsとの関係を分けて見ると分かりやすくなります。

## 関係の整理

| 技術 | 役割 |
| --- | --- |
| React | UIをコンポーネントで作るライブラリ |
| Next.js | Reactを土台にしたWebアプリフレームワーク |
| Vue.js | UIをコンポーネントで作るフレームワーク |
| Nuxt | Vue.jsを土台にしたWebアプリフレームワーク |

ReactとVue.jsは、UIを作る層で比べます。Next.jsとNuxtは、ページやサーバー側の機能まで含むアプリ全体の層で比べます。

## Vue.jsとの違い

Nuxtの中身の画面はVue.jsで書きます。

```vue
<script setup lang="ts">
const message = "Hello Nuxt";
</script>

<template>
  <h1>{{ message }}</h1>
</template>
```

コードの意味です。

- `<script setup lang="ts">` は、Vue.jsのComposition APIを使う書き方です。
- `message` は、画面に表示する値です。
- `<template>` は、画面構造を書く場所です。
- `{{ message }}` は、値を画面に埋め込みます。

Vue.js単体との違いは、このファイルがNuxtのルーティングやレンダリングの仕組みに乗ることです。

## Next.jsとの似ている点

Next.jsとNuxtは、役割が似ています。

| 観点 | Next.js | Nuxt |
| --- | --- | --- |
| 土台 | React | Vue.js |
| ルーティング | App Router | pages / file-based routing |
| サーバー機能 | Route Handler | server routes |
| データ取得 | Server Componentsなど | `useFetch` / server側処理 |
| 主な用途 | Reactアプリ全体 | Vueアプリ全体 |

## Reactとの違い

ReactとNuxtを直接比べると、層が違います。

ReactはUI部品を作る技術です。NuxtはVue.jsを土台にしたアプリ全体のフレームワークです。Reactと比べるならVue.js、Next.jsと比べるならNuxt、という対応で見ると混乱しにくくなります。

## よくあるミス

> よくあるミスは、「React vs Nuxt」のように層が違うものをそのまま比較することです。比較するときは、UI層なのか、アプリ全体のフレームワークなのかを揃えます。

もう1つのミスは、Next.jsを知っているからNuxtも同じだと思い込むことです。考え方は似ていますが、Vue.jsのtemplate、ref、v-modelなどの読み方が必要です。

## 練習問題

### 問題

次の組み合わせで、同じ層にあるものを選んでください。

1. React と Vue.js
2. React と Nuxt
3. Next.js と Nuxt

<details>
<summary>答え例</summary>

同じ層にあるのは、1と3です。

- React と Vue.js は、UIを作る層で比較できます。
- Next.js と Nuxt は、アプリ全体のフレームワークとして比較できます。
- React と Nuxt は層が違うため、直接比較すると混乱します。

</details>

## 次に進む

次は[ルーティングとレンダリング](/nuxt/routing_rendering_data/)で、Nuxtのページ構成を確認します。
