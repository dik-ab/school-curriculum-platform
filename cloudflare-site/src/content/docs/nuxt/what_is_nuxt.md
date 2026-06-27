---
title: Nuxtとは何か
parent: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 1
---

# Nuxtとは何か

Nuxtは、Vue.jsで作ったUIを、ページ、ルーティング、レンダリング、データ取得、サーバーAPIまで含むWebアプリに広げるためのフレームワークです。

Vue.jsだけでも画面は作れます。しかし実務では、URLごとのページ分割、SEO、初回表示速度、データ取得、認証、軽いAPIなどが必要になります。Nuxtは、その部分をVue.jsの書き方に近いまま扱えるようにします。

> Reactに対するNext.jsのように、Vue.jsに対するNuxtという関係で見ると理解しやすいです。

## どんな場面で使うか

Nuxtは、次のような場面で使われます。

| 場面 | Nuxtが役立つ理由 |
| --- | --- |
| メディアサイト | SSRや静的生成を考えやすい |
| コーポレートサイト | ページ構成とSEOを扱いやすい |
| 管理画面 | Vue.jsのコンポーネントを使って作れる |
| 小規模なフルスタックアプリ | server routesで軽いAPIも置ける |
| Vue.js採用プロジェクト | Vueの知識をそのまま活かせる |

## 最小コード

Nuxtのページは、Vue.jsの書き方で作ります。

```vue
<script setup lang="ts">
const title = "Nuxt Dashboard";
</script>

<template>
  <main>
    <h1>{{ title }}</h1>
    <p>サーバーから取得した情報を表示します。</p>
  </main>
</template>
```

コードの意味です。

- `<script setup lang="ts">` は、TypeScriptで処理を書く場所です。
- `title` は、画面に表示する文字列です。
- `<template>` は、画面のHTML相当を書く場所です。
- `{{ title }}` は、変数の値を画面に埋め込みます。
- Nuxtでは、このファイルを置く場所によってURLが決まります。

## Vue.jsだけの場合との違い

Vue.jsはUIを作る中心技術です。Nuxtは、Vue.jsをWebアプリ全体の構成に広げます。

| 観点 | Vue.js | Nuxt |
| --- | --- | --- |
| 主な役割 | UIを作る | VueでWebアプリ全体を作る |
| ルーティング | Vue Routerを組み合わせる | ファイル構成で扱える |
| レンダリング | 主にブラウザ中心 | SSRや静的生成も扱える |
| API | 別サーバーに置くことが多い | server routesで軽いAPIを書ける |

## よくあるミス

> よくあるミスは、Nuxtを使えばVue.jsを知らなくてもよいと考えることです。NuxtのページやコンポーネントはVue.jsで書くため、template、ref、props、v-forなどの基礎は必要です。

もう1つのミスは、Next.jsと完全に同じものとして扱うことです。似ている役割はありますが、NuxtはVue.jsの思想とエコシステムに沿って作られています。

## 練習問題

### 問題

NuxtがVue.jsに追加する役割を2つ書いてください。

<details>
<summary>答え例</summary>

- ファイル構成からURLを作るルーティング。
- SSRや静的生成など、ページの表示方法を選ぶ仕組み。
- server routesで軽いAPIを作る仕組み。

Vue.jsはUI、NuxtはVue.jsを使ったアプリ全体の枠組みと考えると整理できます。

</details>

## 次に進む

次は[Vue・React・Next.jsとの違い](/nuxt/framework_differences/)で、他のフレームワークとの関係を整理します。
