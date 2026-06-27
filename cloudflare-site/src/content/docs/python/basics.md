---
title: Pythonの基本文法
section_key: python
section_title: Python基礎
nav_order: 2
description: 変数、基本型、リスト、辞書、条件分岐、繰り返しをWeb開発の例で学びます。
---

# Pythonの基本文法

ここでは、APIレスポンスやフォーム入力を扱うために必要なPythonの基本文法を学びます。

## 変数と基本型

```python
name = "Sato"
age = 28
active = True
price = 1200.5
```

- `name` は文字列です。
- `age` は整数です。
- `active` は真偽値です。
- `price` は小数です。

Pythonは変数宣言時に型名を書きません。ただし、値には型があります。

## リストと辞書

実務では、一覧データはリスト、1件のデータは辞書で表すことが多いです。

```python
users = [
    {"id": 1, "name": "Sato", "role": "admin"},
    {"id": 2, "name": "Suzuki", "role": "member"},
]

for user in users:
    print(f'{user["id"]}: {user["name"]}')
```

- `users = [...]` はユーザー一覧をリストで持っています。
- `{...}` は1人分のユーザーを辞書で表しています。
- `for user in users:` は1件ずつ取り出します。
- `user["id"]` と `user["name"]` は辞書の値を取り出します。
- `print(...)` は表示します。

## 条件分岐

```python
status = "paid"

if status == "paid":
    message = "支払い済みです"
elif status == "pending":
    message = "支払い待ちです"
else:
    message = "状態を確認してください"

print(message)
```

- `if status == "paid":` は状態が支払い済みか確認します。
- `elif` は追加条件です。
- `else` はどれにも当てはまらない場合です。
- Pythonではインデントが処理のまとまりを表します。

## よくあるミス

```python
if status = "paid":
    print("OK")
```

`=` は代入です。比較には `==` を使います。このコードは構文エラーになります。

もう1つ多いミスはインデントのずれです。

```python
if status == "paid":
print("OK")
```

`print` の前にインデントがないため `IndentationError` になります。

## 確認問題

次の `orders` から、`total` が `3000` 以上の注文だけを表示してください。

```python
orders = [
    {"id": 101, "total": 2500},
    {"id": 102, "total": 4800},
    {"id": 103, "total": 1200},
]
```

<details>
<summary>回答例</summary>

```python
orders = [
    {"id": 101, "total": 2500},
    {"id": 102, "total": 4800},
    {"id": 103, "total": 1200},
]

for order in orders:
    if order["total"] >= 3000:
        print(f'注文ID: {order["id"]}')
```

- `for order in orders:` で注文を1件ずつ取り出します。
- `order["total"] >= 3000` で金額を判定します。
- 条件に合うときだけ `print` します。

</details>

