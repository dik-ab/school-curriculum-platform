---
title: 関数、配列、フォームデータ
section_key: php
section_title: PHP基礎
nav_order: 3
description: LaravelのControllerやServiceで使う関数、型宣言、配列処理、フォーム値の扱いを学びます。
---

# 関数、配列、フォームデータ

PHPでは、関数に型宣言を書けます。LaravelのServiceやFormRequestに進む前に、入力値を受け取り、検証し、結果を返す形に慣れます。

## 実務シーン

注文金額から税込金額を計算します。

```php
<?php

function calculateTotal(int $price, float $taxRate): int
{
    $total = $price * (1 + $taxRate);
    return (int) round($total);
}

echo calculateTotal(1200, 0.1) . PHP_EOL;
```

- `function calculateTotal(...)` は関数を定義します。
- `int $price` は整数の引数です。
- `float $taxRate` は小数の引数です。
- `: int` は戻り値が整数であることを示します。
- `round($total)` は四捨五入します。
- `(int)` は整数へ変換します。

## フォーム値を扱う

```php
<?php

function normalizeName(array $input): string
{
    $name = trim($input["name"] ?? "");

    if ($name === "") {
        return "名無し";
    }

    return $name;
}

echo normalizeName(["name" => "  Sato  "]) . PHP_EOL;
```

- `array $input` は配列を受け取ります。
- `$input["name"] ?? ""` は `name` がなければ空文字にします。
- `trim` は前後の空白を取り除きます。
- 空なら `"名無し"` を返します。

## よくあるミス

```php
$name = $_POST["name"];
echo $name;
```

キーがないと警告が出ます。また、画面に出すときにエスケープしていません。`??` で未定義を避け、表示時には `htmlspecialchars` を使います。

## 確認問題

配列 `$input` から `"email"` を取り出し、空なら `"メール未設定"` を返す関数を書いてください。

<details>
<summary>回答例</summary>

```php
<?php

function displayEmail(array $input): string
{
    $email = trim($input["email"] ?? "");

    if ($email === "") {
        return "メール未設定";
    }

    return $email;
}

echo displayEmail(["email" => "sato@example.com"]) . PHP_EOL;
```

- `trim` で余分な空白を除きます。
- `??` でキーがない場合に備えます。
- 空文字なら代替メッセージを返します。

</details>

