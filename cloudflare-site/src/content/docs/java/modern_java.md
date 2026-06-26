---
title: モダンJavaの入口
section_key: java
section_title: Java基礎
nav_order: 13
description: ラムダ式、Stream API、Optional、record、JUnitの入口を学びます。
---

# モダンJavaの入口

Javaは古い言語という印象を持たれがちですが、現在のJavaではラムダ式、Stream API、Optional、recordなど、より簡潔に書くための機能が使えます。

このページでは、Spring Bootに進む前に知っておきたい入口だけ押さえます。

## ラムダ式

ラムダ式は、処理を短く渡すための書き方です。

```java
List<String> names = List.of("Sato", "Suzuki", "Takahashi");

names.forEach(name -> System.out.println(name));
```

`name -> System.out.println(name)` の部分がラムダ式です。

メソッド参照を使うと、さらに短く書けます。

```java
names.forEach(System.out::println);
```

## Stream API

Stream APIは、コレクションの変換、絞り込み、集計を読みやすく書くための仕組みです。

```java
List<String> names = List.of("Sato", "Suzuki", "Takahashi");

List<String> filtered = names.stream()
    .filter(name -> name.startsWith("S"))
    .toList();

System.out.println(filtered);
```

`filter` は条件に合うものだけ残します。

数値の集計もできます。

```java
List<Integer> scores = List.of(80, 90, 70);

int total = scores.stream()
    .mapToInt(score -> score)
    .sum();

System.out.println(total);
```

## map

`map` は、データを別の形に変換します。

```java
List<String> names = List.of("sato", "suzuki");

List<String> upperNames = names.stream()
    .map(name -> name.toUpperCase())
    .toList();

System.out.println(upperNames);
```

結果です。

```text
[SATO, SUZUKI]
```

業務アプリでは、EntityをDTOに変換する場面などでよく使います。

## Optional

`Optional` は、値があるかもしれないし、ないかもしれないことを表す型です。

```java
import java.util.Optional;

Optional<String> name = Optional.of("Sato");

name.ifPresent(value -> System.out.println(value));
```

空の場合は `Optional.empty()` です。

```java
Optional<String> name = Optional.empty();

String displayName = name.orElse("ゲスト");
System.out.println(displayName);
```

`Optional` を使えば、`null` の可能性を明示しやすくなります。ただし、何でもOptionalにすればよいわけではありません。戻り値で「見つからない可能性」を表すときに使うことが多いです。

## record

`record` は、データを運ぶためのクラスを簡潔に書く仕組みです。

```java
public record UserDto(String name, String email) {
}
```

これだけで、コンストラクタ、getter相当のメソッド、`equals`、`hashCode`、`toString` が用意されます。

```java
UserDto user = new UserDto("Sato", "sato@example.com");

System.out.println(user.name());
System.out.println(user.email());
```

DTOのような、値をまとめて運ぶ用途で便利です。

## JUnitの入口

Javaでは、JUnitを使って単体テストを書くことが多いです。

例えば、次のようなクラスがあるとします。

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

JUnitでは、期待する結果をテストとして書きます。

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

テストは、Spring Bootに入ってからさらに重要になります。まずは「メソッドの入力と出力を確認するコード」として理解してください。

## 使いすぎに注意する

StreamやOptionalは便利ですが、初学者が無理に使うと読みにくくなることがあります。

まずは通常の `for`、`if`、メソッド分割を書けるようにします。そのうえで、処理の意図が短く明確になる場面でStreamやOptionalを使います。
