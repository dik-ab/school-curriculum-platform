---
title: 変数と基本型
section_key: java
section_title: Java基礎
nav_order: 3
description: Javaの変数宣言、基本型、参照型、型変換、定数を学びます。
---

# 変数と基本型

変数は、値に名前をつけて一時的に保存するためのものです。

Javaでは、変数を使う前に型を決めます。

```java
int age = 25;
String name = "Yamada";
```

`int` は整数、`String` は文字列です。Javaは型を先に決めるため、間違った値を入れようとするとコンパイル時に気づけます。

## 基本型

Javaの代表的な基本型は次の通りです。

| 型 | 内容 | 例 |
| --- | --- | --- |
| `int` | 整数 | `10` |
| `long` | 大きい整数 | `10000000000L` |
| `double` | 小数 | `3.14` |
| `boolean` | 真偽値 | `true`, `false` |
| `char` | 1文字 | `'A'` |

実務でよく使うのは、まず `int`、`long`、`double`、`boolean` です。

```java
int quantity = 3;
long totalPrice = 120000L;
double taxRate = 0.1;
boolean active = true;
char grade = 'A';
```

`char` はシングルクォート、`String` はダブルクォートです。

```java
char initial = 'T';
String name = "Taro";
```

## 参照型

`String` は基本型ではありません。クラスから作られる参照型です。

```java
String message = "Hello";
```

Javaでは、基本型と参照型の違いが重要です。

| 種類 | 例 | 特徴 |
| --- | --- | --- |
| 基本型 | `int`, `boolean` | 値そのものを扱う |
| 参照型 | `String`, `ArrayList` | オブジェクトへの参照を扱う |

参照型は `null` になることがあります。

```java
String nickname = null;
```

`null` は「何も参照していない」という意味です。`null` の扱いを間違えると、`NullPointerException` が発生します。

## 変数名のルール

変数名は、意味がわかる名前にします。

```java
int userAge = 20;
String userName = "Sato";
```

Javaでは、変数名やメソッド名は `camelCase` が基本です。

```java
int totalPrice = 1000;
String emailAddress = "test@example.com";
```

クラス名は `PascalCase` です。

```java
public class UserProfile {
}
```

## 型推論 var

Java 10以降では、ローカル変数で `var` を使えます。

```java
var count = 10;
var message = "Hello";
```

ただし、初学者のうちは型を書いた方が理解しやすいです。`var` は型が明らかな場面でだけ使います。

```java
String message = "Hello"; // 初学者はこちらの方が読みやすい
```

## 定数 final

あとから変更しない値には `final` をつけます。

```java
final double TAX_RATE = 0.1;
```

定数名は大文字とアンダースコアで書くことが多いです。

```java
final int MAX_LOGIN_ATTEMPTS = 5;
```

`final` をつけると再代入できません。

```java
final int max = 10;
// max = 20; // エラー
```

## 型変換

小さい範囲の型から大きい範囲の型へは、自動で変換されます。

```java
int count = 10;
long bigCount = count;
```

逆に、大きい範囲から小さい範囲へ変換する場合は、明示的なキャストが必要です。

```java
double price = 1200.8;
int rounded = (int) price;

System.out.println(rounded); // 1200
```

この場合、小数点以下は切り捨てられます。型変換は値が変わる可能性があるため、意図を確認して使います。

## 文字列から数値へ変換する

画面やファイルから受け取った値は、文字列になることが多いです。数値として扱う場合は変換します。

```java
String input = "100";
int price = Integer.parseInt(input);

System.out.println(price + 50); // 150
```

変換できない文字列を渡すと例外が発生します。

```java
String input = "abc";
int price = Integer.parseInt(input); // NumberFormatException
```

例外処理は後のレッスンで扱います。
