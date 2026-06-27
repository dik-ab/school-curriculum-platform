---
title: Rubyの基本文法
section_key: ruby
section_title: Ruby基礎
nav_order: 2
description: 変数、基本型、配列、ハッシュ、条件分岐、繰り返しをWeb開発の例で学びます。
---

# Rubyの基本文法

Rubyの基本文法では、配列、ハッシュ、条件分岐、繰り返しをよく使います。RailsではDBから取得したレコード一覧を処理する場面で同じ考え方が出ます。

## 変数と基本型

```ruby
name = "Sato"
age = 28
active = true
price = 1200.5
```

- `name` は文字列です。
- `age` は整数です。
- `active` は真偽値です。
- `price` は小数です。
- Rubyでは変数宣言に型名を書きません。

## 配列とハッシュ

```ruby
users = [
  { id: 1, name: "Sato", role: "admin" },
  { id: 2, name: "Suzuki", role: "member" }
]

users.each do |user|
  puts "#{user[:id]}: #{user[:name]}"
end
```

- `users = [...]` は配列です。
- `{ id: 1, ... }` はハッシュです。
- `each do |user|` は配列を1件ずつ処理します。
- `user[:id]` はシンボルキーの値を取り出します。
- `end` はブロックの終わりです。

## 条件分岐

```ruby
status = "paid"

if status == "paid"
  message = "支払い済みです"
elsif status == "pending"
  message = "支払い待ちです"
else
  message = "状態を確認してください"
end

puts message
```

- `if` で条件分岐します。
- `elsif` は追加条件です。
- `else` はどれにも当てはまらない場合です。
- `end` で条件分岐を閉じます。

## よくあるミス

```ruby
if status = "paid"
  puts "OK"
end
```

`=` は代入です。比較には `==` を使います。代入でも条件として評価されるため、意図しない動きになります。

## 確認問題

次の注文一覧から、`total` が `3000` 以上の注文IDだけを表示してください。

```ruby
orders = [
  { id: 101, total: 2500 },
  { id: 102, total: 4800 },
  { id: 103, total: 1200 }
]
```

<details>
<summary>回答例</summary>

```ruby
orders = [
  { id: 101, total: 2500 },
  { id: 102, total: 4800 },
  { id: 103, total: 1200 }
]

orders.each do |order|
  if order[:total] >= 3000
    puts order[:id]
  end
end
```

- `orders.each` で注文を1件ずつ取り出します。
- `order[:total] >= 3000` で金額を判定します。
- 条件に合う注文IDだけ表示します。

</details>

