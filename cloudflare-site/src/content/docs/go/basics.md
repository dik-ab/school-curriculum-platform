---
title: Goの基本文法
section_key: go
section_title: Go基礎
nav_order: 2
description: 変数、基本型、条件分岐、繰り返し、slice、mapをWeb開発の例で学びます。
---

# Goの基本文法

Goの基本文法では、型を明確にしながらデータを処理します。APIやDBから取った値を扱うために、変数、条件分岐、slice、mapを押さえます。

## 変数と基本型

```go
package main

import "fmt"

func main() {
	name := "Sato"
	age := 28
	active := true
	price := 1200.5

	fmt.Println(name, age, active, price)
}
```

- `:=` は型を推論して変数を作ります。
- `name` は文字列です。
- `age` は整数です。
- `active` は真偽値です。
- `price` は小数です。

## sliceとmap

```go
package main

import "fmt"

func main() {
	users := []map[string]string{
		{"name": "Sato", "role": "admin"},
		{"name": "Suzuki", "role": "member"},
	}

	for _, user := range users {
		if user["role"] == "admin" {
			fmt.Println(user["name"])
		}
	}
}
```

- `[]map[string]string` はmapのsliceです。
- `range users` はsliceを1件ずつ処理します。
- `_` は使わないインデックスを捨てています。
- `user["role"] == "admin"` で管理者を判定します。

## よくあるミス

```go
if user["role"] = "admin" {
	fmt.Println(user["name"])
}
```

Goでは条件式の比較に `==` を使います。`=` は代入なので、条件式としては使えません。

## 確認問題

次の注文一覧から、`amount` が `3000` 以上の注文IDだけを表示してください。

```go
orders := []map[string]int{
	{"id": 101, "amount": 2500},
	{"id": 102, "amount": 4800},
	{"id": 103, "amount": 1200},
}
```

<details>
<summary>回答例</summary>

```go
package main

import "fmt"

func main() {
	orders := []map[string]int{
		{"id": 101, "amount": 2500},
		{"id": 102, "amount": 4800},
		{"id": 103, "amount": 1200},
	}

	for _, order := range orders {
		if order["amount"] >= 3000 {
			fmt.Println(order["id"])
		}
	}
}
```

- `orders` は注文のsliceです。
- `for _, order := range orders` で1件ずつ取り出します。
- `order["amount"] >= 3000` で金額を判定します。
- 条件に合う注文IDだけ表示します。

</details>

