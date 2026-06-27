---
title: クラス、名前空間、例外、テスト
section_key: php
section_title: PHP基礎
nav_order: 4
description: Laravelに必要なクラス、コンストラクタ、名前空間、例外処理、テストの入口を学びます。
---

# クラス、名前空間、例外、テスト

LaravelではController、Model、Service、FormRequestなど、多くのクラスを扱います。PHPのクラス構文を先に押さえると、Laravelのコードが読みやすくなります。

## 実務シーン

ユーザー登録でメールアドレスを必須にする値オブジェクトを考えます。

```php
<?php

class UserEmail
{
    public function __construct(private string $value)
    {
        if ($value === "") {
            throw new InvalidArgumentException("email is required");
        }
    }

    public function domain(): string
    {
        return explode("@", $this->value)[1] ?? "";
    }
}

$email = new UserEmail("sato@example.com");
echo $email->domain() . PHP_EOL;
```

- `class UserEmail` はクラスを定義します。
- `__construct` はインスタンス作成時に呼ばれます。
- `private string $value` は外から直接触れない文字列プロパティです。
- `throw new InvalidArgumentException(...)` は不正な値を例外にします。
- `$this->value` は自分のプロパティを参照します。
- `explode("@", ...)` は文字列を `@` で分割します。

## 名前空間の入口

```php
<?php

namespace App\Service;

class PriceCalculator
{
    public function total(int $price, float $taxRate): int
    {
        return (int) round($price * (1 + $taxRate));
    }
}
```

- `namespace App\Service;` はクラスの所属場所を表します。
- Laravelでは `App\Http\Controllers` や `App\Models` のような名前空間をよく見ます。

## 例外を受け止める

```php
<?php

try {
    $email = new UserEmail("");
} catch (InvalidArgumentException $error) {
    echo "登録できません: {$error->getMessage()}" . PHP_EOL;
}
```

- `try` に失敗する可能性がある処理を書きます。
- `catch` で特定の例外を受け止めます。
- `$error->getMessage()` で例外メッセージを取り出します。

## テストの入口

Laravelに進むと、PestまたはPHPUnitでテストを書くことが多いです。ここではPHPUnit風の最小例で、クラスの振る舞いを確認します。

```php
<?php

use PHPUnit\Framework\TestCase;

final class UserEmailTest extends TestCase
{
    public function testDomain(): void
    {
        $email = new UserEmail("sato@example.com");

        $this->assertSame("example.com", $email->domain());
    }
}
```

- `use PHPUnit\Framework\TestCase;` はPHPUnitの基本クラスを読み込みます。
- `extends TestCase` でテストクラスにします。
- `testDomain` はテストメソッドです。
- `new UserEmail(...)` でテスト対象を作ります。
- `assertSame` で期待値と実際の値を厳密に比較します。

## よくあるミス

```php
echo $email.domain();
```

PHPでメソッドを呼ぶときは `->` を使います。`.` は文字列結合です。

## 確認問題

商品価格が0以下なら例外を出す `Product` クラスを書いてください。

<details>
<summary>回答例</summary>

```php
<?php

class Product
{
    public function __construct(
        private string $name,
        private int $price
    ) {
        if ($price <= 0) {
            throw new InvalidArgumentException("price must be positive");
        }
    }

    public function label(): string
    {
        return "{$this->name}: {$this->price}円";
    }
}

$product = new Product("Book", 1200);
echo $product->label() . PHP_EOL;
```

- コンストラクタで名前と価格を受け取ります。
- 価格が0以下なら例外を投げます。
- `label` メソッドで表示用文字列を返します。

</details>
