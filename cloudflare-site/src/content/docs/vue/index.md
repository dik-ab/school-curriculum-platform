---
title: Vue.js入門
section_key: vue
section_title: Vue.js入門
nav_order: 9
description: Vue.jsの役割、テンプレート、リアクティブな状態、コンポーネント、Reactとの違いを学びます。
---

# Vue.js入門

## フレームワークとは

フレームワークは、アプリを作るための「型」を用意してくれる道具です。

素のJavaScriptでも画面は作れます。しかし、フォーム、一覧、モーダル、検索、API通信が増えると、どのコードがどの画面を変更しているのか追いにくくなります。

Vue.jsは、HTMLに近い書き方でUIを作りながら、状態が変わると画面も自動で更新される仕組みを提供します。

> 実務では、Vue.jsは「HTML/CSSに近い感覚で始めやすいフロントエンドフレームワーク」として採用されることがあります。既存の管理画面やLaravelとの組み合わせでも見かけます。

## Vue.jsでできること

| 機能 | 何を解決するか |
| --- | --- |
| テンプレート | HTMLに近い書き方で画面を作れる |
| リアクティブな状態 | 値が変わると画面も更新される |
| コンポーネント | UIを部品に分けられる |
| ディレクティブ | `v-if`、`v-for`、`v-model` で表示や入力を扱える |
| Composition API | 関連する状態と処理をまとめられる |

## Reactとの違い

ReactはJSXでJavaScriptの中にHTMLのような記述を書きます。

Vue.jsは、HTMLテンプレート、JavaScript、CSSを1つの `.vue` ファイルにまとめる書き方がよく使われます。

```vue
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">
    Count: {{ count }}
  </button>
</template>
```

コードの意味です。

- `<script setup lang="ts">` は、TypeScriptで処理を書く場所です。
- `ref(0)` は、画面と連動する状態を作ります。
- `<template>` は、画面のHTML相当を書く場所です。
- `@click="count++"` は、クリック時に `count` を増やします。
- `{{ count }}` は、状態の値を画面に表示します。

## どんな場面で使うか

Vue.jsは、次のような場面で使われます。

- 管理画面
- 既存HTMLに少しずつUI機能を足す
- LaravelやRailsなどのバックエンドと組み合わせる
- 小〜中規模のSPA
- Nuxtの土台として使う

## このカリキュラムでの位置づけ

Reactを中心に学ぶ場合でも、Vue.jsの考え方を知っておくと、現場でVue案件に入ったときに対応しやすくなります。

まずは次を押さえるとよいです。

1. `.vue` ファイルの構成
2. `ref` とリアクティブな状態
3. `v-if`、`v-for`、`v-model`
4. コンポーネントとprops
5. API通信

## 練習問題

### 問題: Vue.jsの特徴を説明する

Vue.jsがReactと比べて初学者に分かりやすいと言われる理由を1つ説明してください。

**答え例:**

Vue.jsは、HTMLに近いテンプレート構文で画面を書けるため、HTML/CSSを学んだ直後の初学者でも構造を追いやすいです。

## 参考リンク

- [Vue.js Guide](https://vuejs.org/guide/introduction.html) - Vue公式ガイドです。
- [Vue.js 日本語ドキュメント](https://ja.vuejs.org/guide/introduction.html) - 公式ガイドの日本語版です。
- [MDN: Getting started with Vue](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Frameworks_libraries/Vue_getting_started) - MDNのVue入門です。
- [Vue School](https://vueschool.io/courses) - Vueの学習用コースや動画教材を探せます。
