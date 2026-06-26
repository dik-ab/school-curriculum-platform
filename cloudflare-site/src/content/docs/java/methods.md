---
title: メソッド
section_key: java
section_title: Java基礎
nav_order: 7
description: メソッドの定義、引数、戻り値、void、オーバーロード、責務分離を学びます。
---

# メソッド

メソッドは、処理に名前をつけて再利用するための仕組みです。

```java
public static int add(int a, int b) {
    return a + b;
}
```

同じ処理を何度も書くのではなく、メソッドに切り出します。

## メソッドの基本形

```java
戻り値の型 メソッド名(引数) {
    処理
}
```

例です。

```java
public static int add(int a, int b) {
    return a + b;
}
```

呼び出すときは次のように書きます。

```java
int result = add(10, 20);
System.out.println(result); // 30
```

## Mainクラスで試す

```java
public class Main {
    public static void main(String[] args) {
        int total = add(10, 20);
        System.out.println(total);
    }

    public static int add(int a, int b) {
        return a + b;
    }
}
```

`main` メソッドから `add` メソッドを呼び出しています。

## 戻り値がないメソッド

結果を返さないメソッドは `void` を使います。

```java
public static void greet(String name) {
    System.out.println("こんにちは、" + name + "さん");
}
```

呼び出し例です。

```java
greet("Sato");
```

## return

`return` は、値を返してメソッドを終了します。

```java
public static boolean isAdult(int age) {
    return age >= 18;
}
```

条件分岐と組み合わせることもできます。

```java
public static String grade(int score) {
    if (score >= 90) {
        return "A";
    }
    if (score >= 70) {
        return "B";
    }
    return "C";
}
```

早めに `return` する書き方は、条件が深くなりすぎるのを防げます。

## オーバーロード

同じ名前でも、引数の型や数が違えば別のメソッドとして定義できます。これをオーバーロードと呼びます。

```java
public static int add(int a, int b) {
    return a + b;
}

public static int add(int a, int b, int c) {
    return a + b + c;
}
```

呼び出し側の引数に応じて、使われるメソッドが変わります。

```java
System.out.println(add(1, 2));    // 3
System.out.println(add(1, 2, 3)); // 6
```

## メソッドに分ける理由

メソッドに分ける理由は、短くするためだけではありません。

- 処理の意味が名前でわかる
- 同じ処理を再利用できる
- テストしやすくなる
- バグが起きたときに範囲を絞りやすい

悪い例です。

```java
double result = price * quantity * 1.1;
```

意図が見えにくいです。

よい例です。

```java
double total = calculateTotalPrice(price, quantity);
```

メソッド名を見るだけで、何をしているかが伝わります。

## 引数を増やしすぎない

引数が多すぎるメソッドは読みにくくなります。

```java
public static void createUser(String name, String email, int age, String address, String phone) {
}
```

このような場合は、後で学ぶクラスを使って、関連する値をまとめます。
