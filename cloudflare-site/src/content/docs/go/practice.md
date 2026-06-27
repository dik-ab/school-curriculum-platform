---
title: Go基礎演習
section_key: go
section_title: Go基礎
nav_order: 5
description: Goで注文一覧を集計し、struct、slice、関数、errorを復習します。
---

# Go基礎演習

## 課題: 注文一覧の集計

APIサーバーのService層を想定して、注文一覧から支払い済みの合計金額を求めます。

## 要件

- 注文は `Order` structのsliceで受け取る
- `Status` が `"paid"` の注文だけ合計する
- `Amount` が0以下なら `error` を返す
- 成功時は合計金額と `nil` を返す

## スターターコード

```go
type Order struct {
	ID     int
	Amount int
	Status string
}
```

## よくあるミス

```go
if order.Status = "paid" {
	total += order.Amount
}
```

Goでは比較に `==` を使います。`=` は代入で、条件式には書けません。また、`error` を返す関数では、呼び出し側で `err != nil` を確認します。

<details>
<summary>回答例</summary>

```go
package main

import (
	"errors"
	"fmt"
)

type Order struct {
	ID     int
	Amount int
	Status string
}

func TotalPaidAmount(orders []Order) (int, error) {
	total := 0

	for _, order := range orders {
		if order.Amount <= 0 {
			return 0, errors.New("amount must be positive")
		}

		if order.Status == "paid" {
			total += order.Amount
		}
	}

	return total, nil
}

func main() {
	orders := []Order{
		{ID: 1, Amount: 1200, Status: "paid"},
		{ID: 2, Amount: 800, Status: "pending"},
		{ID: 3, Amount: 2500, Status: "paid"},
	}

	total, err := TotalPaidAmount(orders)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(total)
}
```

- `Order` は注文データの形です。
- `TotalPaidAmount` は注文一覧を受け取ります。
- `total := 0` で合計を初期化します。
- `range` で注文を1件ずつ処理します。
- `Amount <= 0` の場合はエラーを返します。
- `Status == "paid"` の注文だけ合計します。
- 成功時は `total, nil` を返します。

</details>

## 追加問題

未払い注文のIDだけを `[]int` で返す関数を書いてください。

<details>
<summary>回答例</summary>

```go
func UnpaidOrderIDs(orders []Order) []int {
	ids := []int{}

	for _, order := range orders {
		if order.Status != "paid" {
			ids = append(ids, order.ID)
		}
	}

	return ids
}
```

`append` はsliceの末尾に値を追加します。

</details>
