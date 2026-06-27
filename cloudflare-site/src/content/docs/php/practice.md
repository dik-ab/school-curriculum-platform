---
title: PHP基礎演習
section_key: php
section_title: PHP基礎
nav_order: 5
description: PHPで注文一覧を集計し、配列、関数、型宣言、例外処理を復習します。
---

# PHP基礎演習

## 課題: 注文一覧の集計

LaravelのServiceに進む前の練習として、注文一覧から支払い済みの合計金額を求めます。

## 要件

- 注文は連想配列の配列で受け取る
- `status` が `"paid"` の注文だけ合計する
- `amount` が0以下なら `InvalidArgumentException` を出す
- 合計金額を整数で返す

## スターターコード

```php
<?php

$orders = [
    ["id" => 1, "amount" => 1200, "status" => "paid"],
    ["id" => 2, "amount" => 800, "status" => "pending"],
    ["id" => 3, "amount" => 2500, "status" => "paid"],
];
```

## よくあるミス

```php
if ($order["status"] = "paid") {
    $total += $amount;
}
```

`=` は代入です。比較には `===` を使います。PHPではこのミスが動いてしまうことがあるため、条件式の比較演算子を特に注意して読みます。

<details>
<summary>回答例</summary>

```php
<?php

function totalPaidAmount(array $orders): int
{
    $total = 0;

    foreach ($orders as $order) {
        $amount = $order["amount"];

        if ($amount <= 0) {
            throw new InvalidArgumentException("amount must be positive");
        }

        if ($order["status"] === "paid") {
            $total += $amount;
        }
    }

    return $total;
}

$orders = [
    ["id" => 1, "amount" => 1200, "status" => "paid"],
    ["id" => 2, "amount" => 800, "status" => "pending"],
    ["id" => 3, "amount" => 2500, "status" => "paid"],
];

echo totalPaidAmount($orders) . PHP_EOL;
```

- `totalPaidAmount` は注文一覧を受け取ります。
- `$total = 0` で合計を初期化します。
- `foreach` で注文を1件ずつ見ます。
- `$amount <= 0` の場合は不正値として例外を出します。
- `status` が `"paid"` の注文だけ合計します。
- 最後に `$total` を返します。

</details>

## 追加問題

未払い注文のIDだけを返す関数を作ってください。

<details>
<summary>回答例</summary>

```php
<?php

function unpaidOrderIds(array $orders): array
{
    $ids = [];

    foreach ($orders as $order) {
        if ($order["status"] !== "paid") {
            $ids[] = $order["id"];
        }
    }

    return $ids;
}
```

`$ids[] = ...` は配列の末尾に値を追加します。

</details>
