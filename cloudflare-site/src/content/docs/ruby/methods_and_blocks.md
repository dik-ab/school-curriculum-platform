---
title: メソッド、配列、ハッシュ、block
section_key: ruby
section_title: Ruby基礎
nav_order: 3
description: Railsで頻出するメソッド定義、配列処理、ハッシュ、blockの使い方を学びます。
---

# メソッド、配列、ハッシュ、block

Rubyのblockは、配列処理やRailsの設定で頻繁に出ます。`each`、`map`、`select` を読めると、Railsのコードがかなり追いやすくなります。

## 実務シーン

注文一覧から支払い済みの注文だけを取り出します。

```ruby
orders = [
  { id: 1, amount: 1200, status: "paid" },
  { id: 2, amount: 800, status: "pending" },
  { id: 3, amount: 2500, status: "paid" }
]

paid_orders = orders.select do |order|
  order[:status] == "paid"
end

puts paid_orders
```

- `orders` は注文の配列です。
- `select` は条件に合う要素だけを集めます。
- `do |order| ... end` がblockです。
- `order[:status] == "paid"` が選別条件です。
- `paid_orders` には支払い済み注文だけが入ります。

## メソッドにする

```ruby
def total_paid_amount(orders)
  orders
    .select { |order| order[:status] == "paid" }
    .sum { |order| order[:amount] }
end

puts total_paid_amount(orders)
```

- `def total_paid_amount(orders)` はメソッド定義です。
- `select { ... }` は1行blockです。
- `sum { ... }` は金額を取り出して合計します。
- Rubyでは最後に評価された値が戻り値になります。

## よくあるミス

```ruby
orders.select do |order|
  order["status"] == "paid"
end
```

注文のキーが `:status` なのに、文字列キー `"status"` で取り出しています。結果が空になる原因になります。

## 確認問題

ユーザー一覧から `role` が `"admin"` の名前だけを配列で返すメソッドを書いてください。

<details>
<summary>回答例</summary>

```ruby
def admin_names(users)
  users
    .select { |user| user[:role] == "admin" }
    .map { |user| user[:name] }
end

users = [
  { name: "Sato", role: "admin" },
  { name: "Suzuki", role: "member" }
]

puts admin_names(users)
```

- `select` で管理者だけに絞ります。
- `map` で名前だけの配列へ変換します。
- `admin_names` は配列を返します。

</details>

