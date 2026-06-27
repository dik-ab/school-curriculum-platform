---
title: 実務で使う型
section_key: java
section_title: Java基礎
nav_order: 6
description: enum、BigDecimal、LocalDate、LocalDateTime、equals/hashCode/toStringなど、業務アプリでよく使う型を学びます。
---

# 実務で使う型

Javaの基本型を学んだら、次に「業務アプリでよく出る型」を押さえます。

Spring Bootの現場では、金額、日付、状態、ID、ユーザー情報などを扱います。`int` や `String` だけで全部を表そうとすると、バグが入りやすくなります。

> 実務では、型を選ぶことは設計の一部です。金額を `double` にするか `BigDecimal` にするか、状態を `String` にするか `enum` にするかで、バグの入りやすさが変わります。

## enum

`enum` は、決まった選択肢だけを表したいときに使います。

```java
public enum OrderStatus {
    NEW,
    PAID,
    SHIPPED,
    CANCELED
}
```

コードの意味です。

- `public enum OrderStatus` は、注文状態を表す列挙型です。
- `NEW` は、新規注文です。
- `PAID` は、支払い済みです。
- `SHIPPED` は、発送済みです。
- `CANCELED` は、キャンセル済みです。

使う側です。

```java
OrderStatus status = OrderStatus.PAID;

if (status == OrderStatus.PAID) {
    System.out.println("支払い済みです");
}
```

- `OrderStatus.PAID` のように、定義済みの値だけを使えます。
- `"paid"` のような文字列より、タイプミスに強くなります。
- `==` で比較できます。

## BigDecimal

金額計算には、`double` ではなく `BigDecimal` を使うことが多いです。

```java
import java.math.BigDecimal;

BigDecimal price = new BigDecimal("1200");
BigDecimal taxRate = new BigDecimal("0.10");
BigDecimal tax = price.multiply(taxRate);

System.out.println(tax);
```

コードの意味です。

- `import java.math.BigDecimal;` は、`BigDecimal` を使うための読み込みです。
- `new BigDecimal("1200")` は、1200円を正確に表します。
- `new BigDecimal("0.10")` は、10%の税率を正確に表します。
- `price.multiply(taxRate)` は、掛け算です。
- `System.out.println(tax)` は、計算結果を表示します。

`BigDecimal` は、数値を文字列から作るのが基本です。

```java
new BigDecimal("0.1"); // よい
new BigDecimal(0.1);   // 避ける
```

`double` は小数を正確に表せないことがあります。金額では小さな誤差が問題になるため、`BigDecimal` を使います。

## LocalDate と LocalDateTime

日付だけを扱うなら `LocalDate`、日時を扱うなら `LocalDateTime` を使います。

```java
import java.time.LocalDate;
import java.time.LocalDateTime;

LocalDate birthday = LocalDate.of(2000, 4, 1);
LocalDateTime createdAt = LocalDateTime.now();

System.out.println(birthday);
System.out.println(createdAt);
```

コードの意味です。

- `LocalDate` は、年月日だけを表します。
- `LocalDateTime` は、年月日と時刻を表します。
- `LocalDate.of(2000, 4, 1)` は、2000年4月1日を作ります。
- `LocalDateTime.now()` は、現在日時を作ります。

実務では、誕生日、締切日、作成日時、更新日時でよく使います。

## toString

`toString` は、オブジェクトを文字列として表示するときの内容を決めます。

```java
public class User {
    private final String name;
    private final String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "'}";
    }
}
```

コードの意味です。

- `private final String name` は、変更しない名前フィールドです。
- `private final String email` は、変更しないメールアドレスフィールドです。
- コンストラクタで、`name` と `email` を受け取ります。
- `@Override` は、親クラスのメソッドを上書きする印です。
- `toString` は、ログやデバッグ表示で使われます。

## equals と hashCode

オブジェクト同士を「同じ値か」で比較したい場合は、`equals` と `hashCode` が重要です。

初学者のうちは、まず次のルールを覚えてください。

- `String` の比較は `equals`
- 自作クラスを `Set` や `Map` のキーで使うなら `equals` と `hashCode`
- DTOのような値だけを運ぶクラスなら `record` も選択肢

`record` を使うと、`equals`、`hashCode`、`toString` が自動で用意されます。

```java
public record UserDto(String name, String email) {
}
```

- `UserDto` は、データを運ぶための型です。
- `name` と `email` を持ちます。
- `user.name()` のように値を取り出します。
- `equals` や `toString` は自動生成されます。

## 練習問題

### 問題1: 注文状態をenumにする

注文状態として `NEW`、`PAID`、`SHIPPED`、`CANCELED` を持つ `OrderStatus` を作ってください。

**答え:**

```java
public enum OrderStatus {
    NEW,
    PAID,
    SHIPPED,
    CANCELED
}
```

文字列ではなく `enum` にすることで、`"padi"` のようなタイプミスを防げます。

### 問題2: 税込み価格をBigDecimalで計算する

`price = 1000`、`taxRate = 0.10` として、税額を計算してください。

**答え:**

```java
import java.math.BigDecimal;

BigDecimal price = new BigDecimal("1000");
BigDecimal taxRate = new BigDecimal("0.10");
BigDecimal tax = price.multiply(taxRate);

System.out.println(tax);
```

`BigDecimal` は `multiply` で掛け算します。金額では `double` より安全です。
