---
title: クラス、モジュール、例外、テスト
section_key: ruby
section_title: Ruby基礎
nav_order: 4
description: RailsのModelやServiceに進む前に、Rubyのクラス、モジュール、例外、Minitest/RSpecの入口を学びます。
---

# クラス、モジュール、例外、テスト

Rubyはほぼすべてがオブジェクトです。RailsではModel、Controller、Serviceなどのクラスを読むため、Rubyのクラスと例外処理を押さえます。

## 実務シーン

メールアドレスが空ならエラーにするクラスを考えます。

```ruby
class UserEmail
  def initialize(value)
    raise ArgumentError, "email is required" if value == ""

    @value = value
  end

  def domain
    @value.split("@")[1]
  end
end

email = UserEmail.new("sato@example.com")
puts email.domain
```

- `class UserEmail` はクラスを定義します。
- `initialize` はインスタンス作成時に呼ばれます。
- `raise ArgumentError, ...` は不正な値のときに例外を出します。
- `@value` はインスタンス変数です。
- `domain` はドメイン部分を返すメソッドです。
- `UserEmail.new(...)` でインスタンスを作ります。

## 例外を受け止める

```ruby
begin
  email = UserEmail.new("")
rescue ArgumentError => e
  puts "登録できません: #{e.message}"
end
```

- `begin` に失敗する可能性がある処理を書きます。
- `rescue` で例外を受け止めます。
- `e.message` でメッセージを取り出します。

## モジュールの入口

```ruby
module PriceFormatter
  def self.yen(price)
    "#{price}円"
  end
end

puts PriceFormatter.yen(1200)
```

- `module` は関連するメソッドや名前をまとめます。
- `self.yen` はモジュールメソッドです。
- Railsでは `ApplicationHelper` や関心ごとの分離でmoduleを見ます。

## テストの入口

```ruby
require "minitest/autorun"

class UserEmailTest < Minitest::Test
  def test_domain
    email = UserEmail.new("sato@example.com")
    assert_equal "example.com", email.domain
  end
end
```

- `minitest/autorun` は標準添付のMinitestを使います。
- `Minitest::Test` を継承してテストクラスを作ります。
- `assert_equal` は期待値と実際の値を比較します。

## よくあるミス

```ruby
def initialize(value)
  value = value
end
```

ローカル変数へ代入しているだけで、インスタンスに保存されていません。メソッドをまたいで使う値は `@value` のようなインスタンス変数に入れます。

## 確認問題

商品価格が0以下なら `ArgumentError` を出す `Product` クラスを書いてください。

<details>
<summary>回答例</summary>

```ruby
class Product
  def initialize(name, price)
    raise ArgumentError, "price must be positive" if price <= 0

    @name = name
    @price = price
  end

  def label
    "#{@name}: #{@price}円"
  end
end

product = Product.new("Book", 1200)
puts product.label
```

- `initialize` で名前と価格を受け取ります。
- 価格が0以下なら例外を出します。
- `@name` と `@price` に保存します。
- `label` で表示用文字列を返します。

</details>

