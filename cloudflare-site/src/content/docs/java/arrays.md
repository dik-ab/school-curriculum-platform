---
title: 配列
section_key: java
section_title: Java基礎
nav_order: 6
description: 配列の宣言、代入、参照、ループ処理、多次元配列を学びます。
---

# 配列

配列は、同じ型の値を複数まとめて扱うための仕組みです。

```java
int[] scores = {80, 90, 70};
```

テストの点数、商品ID、日別アクセス数など、同じ種類のデータをまとめたいときに使います。

## 配列を作る

最初から値を入れる場合は、次のように書きます。

```java
int[] scores = {80, 90, 70};
```

あとから値を入れる場合は、要素数を指定します。

```java
int[] scores = new int[3];

scores[0] = 80;
scores[1] = 90;
scores[2] = 70;
```

配列の番号は `0` から始まります。

```java
System.out.println(scores[0]); // 80
System.out.println(scores[1]); // 90
System.out.println(scores[2]); // 70
```

## 配列の長さ

配列の長さは `length` で取得します。

```java
int[] scores = {80, 90, 70};

System.out.println(scores.length); // 3
```

配列をループで処理する場合は、`length` を使います。

```java
int[] scores = {80, 90, 70};

for (int i = 0; i < scores.length; i++) {
    System.out.println(scores[i]);
}
```

## 合計と平均

配列の値を集計してみます。

```java
int[] scores = {80, 90, 70};
int total = 0;

for (int score : scores) {
    total += score;
}

double average = (double) total / scores.length;

System.out.println("合計: " + total);
System.out.println("平均: " + average);
```

`(double) total` としているのは、小数で割り算するためです。

## 範囲外アクセス

存在しない番号にアクセスするとエラーになります。

```java
int[] scores = {80, 90, 70};

System.out.println(scores[3]); // ArrayIndexOutOfBoundsException
```

配列の番号は `0, 1, 2` までです。`3` は存在しません。

## 文字列の配列

文字列も配列にできます。

```java
String[] names = {"Sato", "Suzuki", "Takahashi"};

for (String name : names) {
    System.out.println(name);
}
```

## 多次元配列

表のようなデータを扱う場合は、多次元配列を使えます。

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

System.out.println(matrix[0][0]); // 1
System.out.println(matrix[1][2]); // 6
```

ただし、業務アプリでは多次元配列よりも、クラスやコレクションを使って意味のあるデータ構造にすることが多いです。

## 配列とコレクションの違い

配列は要素数が固定です。

```java
int[] scores = new int[3];
```

あとから要素数を増やしたい場合は、`ArrayList` などのコレクションを使います。コレクションは後のレッスンで扱います。
