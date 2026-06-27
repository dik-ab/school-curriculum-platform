---
title: テストとデバッグの入口
section_key: java
section_title: Java基礎
nav_order: 16
description: JUnitの基本、テストの考え方、スタックトレース、ブレークポイント、ログの読み方を学びます。
---

# テストとデバッグの入口

プログラムは、最初から正しく動くとは限りません。

実務では、動作確認を毎回手作業だけで行うと、修正のたびに時間がかかります。そこで、テストコードを書き、エラーが起きたらスタックトレースやデバッガで原因を探します。

> Spring Bootに進むと、ControllerやServiceのテスト、ログ確認、エラー調査が必ず出てきます。ここでは、その前提になる考え方だけ押さえます。

## テストとは

テストは、「ある入力に対して、期待する出力になるか」を確認するコードです。

```java
public class PriceCalculator {
    public int total(int price, int quantity) {
        if (price < 0 || quantity < 0) {
            throw new IllegalArgumentException("price and quantity must be positive");
        }
        return price * quantity;
    }
}
```

コードの意味です。

- `PriceCalculator` は、金額計算を担当するクラスです。
- `total` は、単価と数量を受け取ります。
- `price < 0 || quantity < 0` は、不正な値のチェックです。
- 不正なら `IllegalArgumentException` を投げます。
- 正常なら `price * quantity` を返します。

## JUnitのテスト

JUnitでは、期待する結果をコードで書きます。

```java
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class PriceCalculatorTest {
    @Test
    void totalReturnsPriceTimesQuantity() {
        PriceCalculator calculator = new PriceCalculator();

        int result = calculator.total(100, 3);

        assertEquals(300, result);
    }
}
```

コードの意味です。

- `assertEquals` は、期待値と実際の値が同じか確認します。
- `@Test` は、このメソッドがテストであることを表します。
- `PriceCalculator calculator = new PriceCalculator();` で、テスト対象を作ります。
- `calculator.total(100, 3)` で、実際にメソッドを呼びます。
- `assertEquals(300, result)` で、結果が300であることを確認します。

## 例外のテスト

例外が出ることもテストできます。

```java
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;

class PriceCalculatorTest {
    @Test
    void totalThrowsWhenPriceIsNegative() {
        PriceCalculator calculator = new PriceCalculator();

        assertThrows(IllegalArgumentException.class, () -> {
            calculator.total(-100, 3);
        });
    }
}
```

コードの意味です。

- `assertThrows` は、指定した例外が発生するか確認します。
- `IllegalArgumentException.class` は、期待する例外の種類です。
- `() -> { ... }` は、テストしたい処理を渡すラムダ式です。
- `calculator.total(-100, 3)` は、不正な入力です。

## スタックトレースの読み方

エラーが起きると、次のような表示が出ます。

```text
Exception in thread "main" java.lang.IllegalArgumentException: price and quantity must be positive
    at PriceCalculator.total(PriceCalculator.java:4)
    at Main.main(Main.java:6)
```

読み方です。

- `IllegalArgumentException` は、発生した例外の種類です。
- `price and quantity must be positive` は、例外メッセージです。
- `PriceCalculator.java:4` は、例外が投げられた場所です。
- `Main.java:6` は、そのメソッドを呼び出した場所です。

まず一番上の自分のコードの行を見ます。そこが調査の入口です。

## ブレークポイントで止める

IDEでは、ブレークポイントを置いて、プログラムを途中で止められます。

確認することです。

- 変数に何が入っているか
- if文の条件が true か false か
- どのメソッドから呼ばれたか
- 例外が起きる直前の値は何か

デバッグは「勘で直す」ためではなく、「事実を見て直す」ために使います。

## ログの入口

最初は `System.out.println` でも構いません。

```java
System.out.println("price=" + price);
System.out.println("quantity=" + quantity);
```

ただし実務では、ログライブラリを使って、INFO、WARN、ERRORのように重要度を分けます。Spring Bootに入ると、ログの見方も重要になります。

## 練習問題

### 問題1: 正常系のテストを書く

`PriceCalculator.total(200, 4)` が `800` を返すことをテストしてください。

**答え:**

```java
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class PriceCalculatorTest {
    @Test
    void totalReturns800() {
        PriceCalculator calculator = new PriceCalculator();

        int result = calculator.total(200, 4);

        assertEquals(800, result);
    }
}
```

`assertEquals(800, result)` により、期待値800と実際の戻り値を比較しています。

### 問題2: スタックトレースから原因を読む

次の表示では、どのファイルの何行目で例外が投げられていますか。

```text
Exception in thread "main" java.lang.IllegalArgumentException: name is required
    at User.<init>(User.java:7)
    at Main.main(Main.java:4)
```

**答え:**

`User.java` の7行目です。

`Main.java:4` は、`User` を作ろうとした呼び出し元です。まず `User.java:7` を見て、なぜ `IllegalArgumentException` が投げられたか確認します。
