---
title: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 10
description: Vueを土台にしたフルスタック寄りのフレームワークとして、Nuxtの役割、ルーティング、SSR、データ取得、サーバー機能を学びます。
---

# Nuxt入門

## フレームワークとは

フレームワークは、アプリ全体の作り方を用意してくれる道具です。

Vue.jsだけでも画面は作れますが、実務のWebアプリでは、ページ分割、SEO、サーバー側のデータ取得、API、デプロイ構成も必要になります。

Nuxtは、Vueを土台にして、これらをまとめて扱いやすくしたフレームワークです。

> Reactに対するNext.jsのように、Vueに対するNuxtという関係で理解すると分かりやすいです。

## Nuxtでできること

| 機能 | 何を解決するか |
| --- | --- |
| ファイルベースルーティング | `pages` や `app` の構成からURLを作れる |
| SSR | サーバー側でHTMLを生成できる |
| データ取得 | ページ表示前に必要なデータを扱いやすい |
| サーバーAPI | 同じプロジェクト内に軽いAPIを作れる |
| 自動import | よく使う関数やコンポーネントを扱いやすい |

## Vue.jsとの関係

NuxtはVue.jsの代わりではありません。Vueを土台にしたフレームワークです。

Vueで学んだ内容はNuxtでも使います。

- テンプレート
- `ref`
- コンポーネント
- props
- `v-if`
- `v-for`
- `v-model`

Nuxtでは、そこにページルーティング、SSR、サーバー機能が加わります。

## 最小イメージ

Nuxtのページでは、Vueの書き方を使います。

```vue
<script setup lang="ts">
const message = "Hello Nuxt";
</script>

<template>
  <h1>{{ message }}</h1>
</template>
```

コードの意味です。

- `<script setup lang="ts">` は、TypeScriptで処理を書く場所です。
- `message` は、画面に表示する文字列です。
- `<template>` は、画面のHTML相当を書く場所です。
- `{{ message }}` は、値を画面に埋め込みます。

## バックエンドもできるとはどういうことか

Nuxtは、画面だけでなくサーバー側の処理も一部書けます。

例えば、次のような用途です。

- フォーム送信を受け取る
- 外部APIを呼び出す
- ページ表示前にDBからデータを取得する
- 軽いAPIを同じプロジェクト内に作る

ただし、業務ロジックが大きくなる場合は、Nuxtをフロントエンド、LaravelやNestJS、Spring BootをバックエンドAPIとして分ける構成もあります。

## このカリキュラムでの位置づけ

NuxtはVueを本格的なWebアプリに広げるための選択肢です。

まずは次を押さえるとよいです。

1. Vueの基本
2. ファイルベースルーティング
3. レイアウト
4. データ取得
5. SSRとSPAの違い
6. サーバーAPIの入口

## 練習問題

### 問題: Vue.jsとNuxtの関係を説明する

Vue.jsとNuxtの関係を1〜2文で説明してください。

**答え例:**

Vue.jsはUIを作るためのフレームワークです。NuxtはVueを土台に、ルーティング、SSR、データ取得、サーバー機能まで扱いやすくしたフルスタック寄りのフレームワークです。

## 参考リンク

- [Nuxt Docs](https://nuxt.com/docs) - Nuxt公式ドキュメントです。
- [Nuxt: Getting Started](https://nuxt.com/docs/getting-started/introduction) - Nuxtの全体像と始め方を確認できます。
- [Nuxt: Server Engine](https://nuxt.com/docs/guide/concepts/server-engine) - Nuxtのサーバー機能の考え方を確認できます。
- [Vue.js 日本語ドキュメント](https://ja.vuejs.org/guide/introduction.html) - Nuxtの前提になるVueの公式日本語ガイドです。
