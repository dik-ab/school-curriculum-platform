---
title: 関数、struct、slice、map
section_key: go
section_title: Go基礎
nav_order: 3
description: API開発に必要な関数、戻り値、struct、slice、mapの使い方を学びます。
---

# 関数、struct、slice、map

Goでは、APIのリクエストやレスポンスの形を `struct` で表すことが多いです。Ginや標準HTTPに進む前に、関数とstructを押さえます。

## 実務シーン

注文の税込金額を計算します。

```go
package main

import (
	"fmt"
	"math"
)

func calculateTotal(price int, taxRate float64) int {
	total := float64(price) * (1 + taxRate)
	return int(math.Round(total))
}

func main() {
	fmt.Println(calculateTotal(1200, 0.1))
}
```

- `func calculateTotal(...) int` は整数を返す関数です。
- `price int` は整数の引数です。
- `taxRate float64` は小数の引数です。
- `float64(price)` は計算のために型変換します。
- `math.Round` は四捨五入します。
- `int(...)` は整数へ戻します。

## structでデータを表す

```go
package main

import "fmt"

type User struct {
	ID   int
	Name string
	Role string
}

func buildLabel(user User) string {
	return fmt.Sprintf("%d: %s (%s)", user.ID, user.Name, user.Role)
}

func main() {
	user := User{ID: 1, Name: "Sato", Role: "admin"}
	fmt.Println(buildLabel(user))
}
```

- `type User struct` はユーザーの形を定義します。
- `ID`, `Name`, `Role` はフィールドです。
- `buildLabel(user User)` は `User` を受け取ります。
- `user.ID` のようにフィールドへアクセスします。

## よくあるミス

```go
type user struct {
	id int
}
```

小文字で始まる名前はパッケージ外から見えません。JSON変換や別パッケージで使うDTOは、必要に応じて大文字始まりにします。

## 確認問題

`Product` structを作り、商品名と価格を表示する `Label` 関数を書いてください。

<details>
<summary>回答例</summary>

```go
package main

import "fmt"

type Product struct {
	Name  string
	Price int
}

func Label(product Product) string {
	return fmt.Sprintf("%s: %d円", product.Name, product.Price)
}

func main() {
	product := Product{Name: "Book", Price: 1200}
	fmt.Println(Label(product))
}
```

- `Product` に必要なフィールドを定義します。
- `Label` は `Product` を受け取って文字列を返します。
- `fmt.Sprintf` で表示用文字列を組み立てます。

</details>

