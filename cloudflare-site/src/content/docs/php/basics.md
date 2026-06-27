---
title: PHPの基本文法
section_key: php
section_title: PHP基礎
nav_order: 2
description: 変数、型、配列、条件分岐、繰り返しをWeb開発の例で学びます。
---

# PHPの基本文法

PHPの基本文法は、フォーム入力、DBから取得した配列、テンプレート表示を扱う土台になります。

## 変数と基本型

```php
<?php

$name = "Sato";
$age = 28;
$active = true;
$price = 1200.5;
```

- PHPの変数は `$` から始まります。
- `$name` は文字列です。
- `$age` は整数です。
- `$active` は真偽値です。
- `$price` は小数です。

## 連想配列

```php
<?php

$user = [
    "id" => 1,
    "name" => "Sato",
    "role" => "admin",
];

echo $user["name"] . PHP_EOL;
```

- `[...]` は配列を作ります。
- `"id" => 1` はキーと値の組です。
- `$user["name"]` は `name` の値を取り出します。
- `PHP_EOL` は改行です。

## 条件分岐と繰り返し

```php
<?php

$orders = [
    ["id" => 101, "status" => "paid"],
    ["id" => 102, "status" => "pending"],
];

foreach ($orders as $order) {
    if ($order["status"] === "paid") {
        echo "注文{$order['id']}は支払い済みです" . PHP_EOL;
    }
}
```

- `foreach` は配列を1件ずつ処理します。
- `$order` に1件分の注文が入ります。
- `===` は型も含めて比較します。
- 条件に合う注文だけ `echo` します。

## よくあるミス

```php
if ($status = "paid") {
    echo "OK";
}
```

`=` は代入です。比較には `===` を使います。このコードは常に代入が行われ、意図しない判定になります。

## 確認問題

次の配列から、`role` が `"admin"` のユーザー名だけを表示してください。

```php
$users = [
    ["name" => "Sato", "role" => "admin"],
    ["name" => "Suzuki", "role" => "member"],
];
```

<details>
<summary>回答例</summary>

```php
<?php

$users = [
    ["name" => "Sato", "role" => "admin"],
    ["name" => "Suzuki", "role" => "member"],
];

foreach ($users as $user) {
    if ($user["role"] === "admin") {
        echo $user["name"] . PHP_EOL;
    }
}
```

- `foreach` で1人ずつ取り出します。
- `$user["role"] === "admin"` で管理者か判定します。
- 管理者だけ名前を表示します。

</details>
