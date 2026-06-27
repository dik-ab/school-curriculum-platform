---
title: Nuxt入門
section_key: nuxt
section_title: Nuxt入門
nav_order: 10
has_children: true
permalink: /nuxt/
description: Vueを土台にしたフルスタック寄りのフレームワークとして、Nuxtの役割、ルーティング、SSR、データ取得、サーバー機能を学びます。
---

# Nuxt入門

Nuxtは、Vue.jsを土台にして**ページ構成、ルーティング、SSR、データ取得、サーバーAPI**まで扱いやすくするフレームワークです。

Vue.jsだけでも画面は作れます。しかし実務のWebアプリでは、URLごとのページ分割、SEO、初回表示、サーバー側のデータ取得、API、デプロイ構成も必要になります。Nuxtは、Vueで作ったUIをアプリ全体に広げるための枠組みです。

> このカリキュラムでは、TodoアプリとSNSアプリの実装解説はReactを基準に進めます。Nuxtは「VueでNext.jsのような構成を作ると何が変わるか」を理解するために学びます。

## フレームワークとは

フレームワークは、アプリ全体の作り方を用意してくれる道具です。

Nuxtは、Vueのコンポーネントをページ、レイアウト、データ取得、サーバーAPIと組み合わせるためのルールを持っています。Reactに対するNext.jsのように、Vueに対するNuxtという関係で理解すると分かりやすいです。

## 学習ページ

| ページ | 内容 |
| --- | --- |
| [Nuxtとは何か](/nuxt/what_is_nuxt/) | Nuxtの役割、Vueだけでは足りない場面、現場での使われ方 |
| [Vue・React・Next.jsとの違い](/nuxt/framework_differences/) | Vueとの関係、Next.jsとの似ている点、Reactとの違い |
| [ルーティングとレンダリング](/nuxt/routing_rendering_data/) | pages、layout、SSR、データ取得の流れ |
| [サーバー機能とAPI](/nuxt/server_features/) | server routes、Nitro、バックエンドとの分担 |
| [このカリキュラムでの扱い](/nuxt/curriculum_scope/) | React中心で実践する理由、Nuxtをどこまで学ぶか |

```mermaid
flowchart LR
    A["Vue.js基礎<br/>template / ref"] --> B["Nuxtとは<br/>Vueをアプリ全体へ"]
    B --> C["routing<br/>pages"]
    C --> D["rendering<br/>SSR / SPA"]
    D --> E["server routes<br/>軽いAPI"]
    E --> F["React中心の実践と比較"]
    style A fill:#e8f5e9,stroke:#2e7d32
    style E fill:#fff3e0,stroke:#ef6c00
    style F fill:#e3f2fd,stroke:#1565c0
```

## 参考リンク

- [Nuxt Docs](https://nuxt.com/docs) - Nuxt公式ドキュメントです。
- [Nuxt: Introduction](https://nuxt.com/docs/getting-started/introduction) - Nuxtの全体像と始め方を確認できます。
- [Nuxt: Routing](https://nuxt.com/docs/getting-started/routing) - ファイルベースルーティングを確認できます。
- [Nuxt: Data Fetching](https://nuxt.com/docs/getting-started/data-fetching) - Nuxtのデータ取得の基本を確認できます。
- [Vue.js 日本語ドキュメント](https://ja.vuejs.org/guide/introduction.html) - Nuxtの前提になるVueの公式日本語ガイドです。
