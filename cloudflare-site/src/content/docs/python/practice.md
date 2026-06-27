---
title: Python基礎演習
section_key: python
section_title: Python基礎
nav_order: 5
description: PythonでAPIレスポンス風データを集計し、関数、型ヒント、例外処理を復習します。
---

# Python基礎演習

## 課題: 注文一覧の集計

ECサイトの注文一覧を受け取り、支払い済みの合計金額を計算する関数を作ります。

## 要件

- 注文は辞書のリストで受け取る
- `status` が `"paid"` の注文だけ合計する
- `amount` が0以下なら `ValueError` を出す
- 合計金額を整数で返す

## スターターコード

```python
orders = [
    {"id": 1, "amount": 1200, "status": "paid"},
    {"id": 2, "amount": 800, "status": "pending"},
    {"id": 3, "amount": 2500, "status": "paid"},
]
```

## よくあるミス

```python
if order["status"] = "paid":
    total += amount
```

`=` は代入です。Pythonの条件式で比較するときは `==` を使います。また、`amount` が0以下かどうかの確認を合計後に書くと、不正な注文を一度合計してしまいます。

## ヒント

`for` で1件ずつ取り出し、`if` で `status` を確認します。合計用の変数を先に `0` で用意します。

<details>
<summary>回答例</summary>

```python
def total_paid_amount(orders: list[dict]) -> int:
    total = 0

    for order in orders:
        amount = order["amount"]
        if amount <= 0:
            raise ValueError("amount must be positive")

        if order["status"] == "paid":
            total += amount

    return total


orders = [
    {"id": 1, "amount": 1200, "status": "paid"},
    {"id": 2, "amount": 800, "status": "pending"},
    {"id": 3, "amount": 2500, "status": "paid"},
]

print(total_paid_amount(orders))
```

- `def total_paid_amount(...):` は注文一覧を集計する関数です。
- `orders: list[dict]` は辞書のリストを受け取る型ヒントです。
- `total = 0` は合計の初期値です。
- `for order in orders:` で注文を1件ずつ処理します。
- `amount = order["amount"]` で金額を取り出します。
- `amount <= 0` なら不正な金額として例外を出します。
- `order["status"] == "paid"` の注文だけ合計します。
- `return total` で計算結果を返します。

</details>

## 追加問題

`status` が `"paid"` 以外の注文IDだけをリストで返す関数を作ってください。

<details>
<summary>回答例</summary>

```python
def unpaid_order_ids(orders: list[dict]) -> list[int]:
    ids = []

    for order in orders:
        if order["status"] != "paid":
            ids.append(order["id"])

    return ids
```

`ids.append(...)` で条件に合うIDをリストへ追加します。

</details>
