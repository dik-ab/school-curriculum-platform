---
title: Ruby基礎
section_key: ruby
section_title: Ruby基礎
nav_order: 0
description: Railsに進む前に、Rubyの特徴、用途、環境構築、基本文法、クラス、モジュール、block、Bundler、テストを学びます。
---

# Ruby基礎

Rubyは「読みやすく書きやすい」ことを大切にしたオブジェクト指向言語です。Web開発ではRuby on Railsと組み合わせて、管理画面、業務システム、SaaS、スタートアップのプロダクト開発で使われます。

## Rubyが活用しやすいシーン

| シーン | 向いている理由 |
| --- | --- |
| Rails開発 | MVC、Active Record、Migration、ルーティングが統合されている |
| 業務アプリ | CRUD中心のWebアプリを素早く作りやすい |
| プロトタイプ | 少ない記述で動くものを作りやすい |
| 既存Rails保守 | 日本国内にもRails資産が多く、読解力が役立つ |

Rubyのメリットは、自然な読み心地とRailsの生産性です。一方で、暗黙的に見える書き方も多いため、基礎文法、block、クラス、モジュールを押さえるとRailsの裏側が読みやすくなります。

## 学習順

1. [Rubyの環境構築](/ruby/environment/)
2. [Rubyの基本文法](/ruby/basics/)
3. [メソッド、配列、ハッシュ、block](/ruby/methods_and_blocks/)
4. [クラス、モジュール、例外、テスト](/ruby/objects_errors_tests/)
5. [Ruby基礎演習](/ruby/practice/)

## 最初の実務例

ユーザー情報から表示名を作ります。

```ruby
user = { id: 1, name: "Sato", role: "admin" }

label = "#{user[:name]} (#{user[:role]})"

puts label
```

- `user = {...}` はハッシュを作ります。
- `:name` や `:role` はシンボルです。ハッシュのキーでよく使います。
- `"#{...}"` は文字列の中に値を埋め込みます。
- `puts` はターミナルへ表示します。

## よくあるミス

```ruby
user = { name: "Sato" }
puts user["name"]
```

キーをシンボルで作ったのに文字列で取り出そうとしています。この場合は `nil` になります。`user[:name]` と書きます。

## 確認問題

Railsに進む前にRubyのblockを学ぶ理由を説明してください。

<details>
<summary>回答例</summary>

RailsやRubyの配列処理では、`each`、`map`、`select` のようにblockを渡す書き方が頻繁に出ます。blockを読めると、一覧処理やルーティング、設定ファイルの読み方が楽になります。

</details>

## 参考にした公式資料

- [Ruby Documentation](https://www.ruby-lang.org/en/documentation/)
- [Ruby Quickstart](https://www.ruby-lang.org/en/documentation/quickstart/)
- [Bundler Documentation](https://bundler.io/docs.html)
- [Rails Guides: Getting Started](https://guides.rubyonrails.org/getting_started.html)

