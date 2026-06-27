---
title: 演算子と文字列
section_key: java
section_title: Java基礎
nav_order: 5
description: 算術演算、比較、論理演算、文字列結合、equalsによる比較を学びます。
---

# 演算子と文字列

演算子は、計算や比較をするための記号です。

```java
int total = 100 + 50;
boolean adult = age >= 18;
```

## 算術演算子

| 演算子 | 意味 | 例 |
| --- | --- | --- |
| `+` | 足し算 | `a + b` |
| `-` | 引き算 | `a - b` |
| `*` | 掛け算 | `a * b` |
| `/` | 割り算 | `a / b` |
| `%` | 余り | `a % b` |

```java
int a = 10;
int b = 3;

System.out.println(a + b); // 13
System.out.println(a - b); // 7
System.out.println(a * b); // 30
System.out.println(a / b); // 3
System.out.println(a % b); // 1
```

`int` 同士の割り算は、小数点以下が切り捨てられます。

```java
int result = 10 / 3;
System.out.println(result); // 3
```

小数で計算したい場合は `double` を使います。

```java
double result = 10.0 / 3;
System.out.println(result); // 3.3333333333333335
```

## 代入演算子

変数の値を更新するときに使います。

```java
int count = 0;
count = count + 1;
```

これは次のようにも書けます。

```java
count += 1;
```

1増やすだけなら、インクリメントも使えます。

```java
count++;
```

## 比較演算子

比較の結果は `boolean` になります。

| 演算子 | 意味 |
| --- | --- |
| `==` | 等しい |
| `!=` | 等しくない |
| `>` | より大きい |
| `>=` | 以上 |
| `<` | より小さい |
| `<=` | 以下 |

```java
int age = 20;

System.out.println(age >= 18); // true
System.out.println(age < 18);  // false
```

## 論理演算子

複数の条件を組み合わせるときに使います。

| 演算子 | 意味 |
| --- | --- |
| `&&` | かつ |
| `||` | または |
| `!` | 否定 |

```java
int age = 20;
boolean hasTicket = true;

if (age >= 18 && hasTicket) {
    System.out.println("入場できます");
}
```

`&&` は両方が `true` のときだけ `true` です。`||` はどちらかが `true` なら `true` です。

## 文字列結合

`+` は文字列の結合にも使えます。

```java
String name = "Sato";
int age = 20;

System.out.println(name + "さんは" + age + "歳です");
```

結果は次の通りです。

```text
Satoさんは20歳です
```

## 文字列比較はequalsを使う

Javaで文字列の中身を比較するときは、基本的に `equals` を使います。

```java
String input = "yes";

if (input.equals("yes")) {
    System.out.println("続行します");
}
```

`==` は参照先が同じかどうかを見るため、文字列の中身比較には向きません。

```java
String a = new String("Java");
String b = new String("Java");

System.out.println(a == b);      // false
System.out.println(a.equals(b)); // true
```

`null` の可能性がある場合は、固定文字列側から `equals` を呼ぶと安全です。

```java
String input = null;

if ("yes".equals(input)) {
    System.out.println("続行します");
}
```

## 文字列のよく使うメソッド

```java
String email = " test@example.com ";

System.out.println(email.trim());              // 前後の空白を削除
System.out.println(email.contains("@"));       // 含まれるか
System.out.println(email.startsWith("test"));  // 始まり
System.out.println(email.length());            // 文字数
System.out.println(email.toUpperCase());       // 大文字化
```

業務アプリでは、メールアドレス、名前、住所、検索キーワードなど、文字列処理が頻繁に出てきます。
