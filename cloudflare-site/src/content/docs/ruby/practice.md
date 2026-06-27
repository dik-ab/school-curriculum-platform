---
title: Ruby基礎演習
section_key: ruby
section_title: Ruby基礎
nav_order: 5
description: Rubyで注文一覧を集計し、ハッシュ、配列、メソッド、block、例外処理を復習します。
---

# Ruby基礎演習

## 課題: 注文一覧の集計

RailsのServiceやModelメソッドに進む前の練習として、注文一覧から支払い済みの合計金額を求めます。

## 要件

- 注文はハッシュの配列で受け取る
- `status` が `"paid"` の注文だけ合計する
- `amount` が0以下なら `ArgumentError` を出す
- 合計金額を整数で返す

## スターターコード

```ruby
orders = [
  { id: 1, amount: 1200, status: "paid" },
  { id: 2, amount: 800, status: "pending" },
  { id: 3, amount: 2500, status: "paid" }
]
```

## よくあるミス

```ruby
if order["status"] == "paid"
  total += order["amount"]
end
```

スターターコードのキーは `:status` と `:amount` です。文字列キーで取り出すと `nil` になり、条件が合わなかったり計算でエラーになったりします。

<details>
<summary>回答例</summary>

```ruby
def total_paid_amount(orders)
  total = 0

  orders.each do |order|
    amount = order[:amount]

    raise ArgumentError, "amount must be positive" if amount <= 0

    if order[:status] == "paid"
      total += amount
    end
  end

  total
end

orders = [
  { id: 1, amount: 1200, status: "paid" },
  { id: 2, amount: 800, status: "pending" },
  { id: 3, amount: 2500, status: "paid" }
]

puts total_paid_amount(orders)
```

- `total_paid_amount` は注文一覧を受け取ります。
- `total = 0` で合計を初期化します。
- `orders.each` で注文を1件ずつ処理します。
- `amount <= 0` の場合は例外を出します。
- `status` が `"paid"` の注文だけ合計します。
- Rubyは最後の `total` を戻り値にします。

</details>

## 追加問題

未払い注文のIDだけを配列で返すメソッドを書いてください。

<details>
<summary>回答例</summary>

```ruby
def unpaid_order_ids(orders)
  orders
    .select { |order| order[:status] != "paid" }
    .map { |order| order[:id] }
end
```

`select` で未払い注文だけに絞り、`map` でIDだけへ変換します。

</details>
