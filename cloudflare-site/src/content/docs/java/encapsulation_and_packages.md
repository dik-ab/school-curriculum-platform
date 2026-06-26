---
title: カプセル化とパッケージ
section_key: java
section_title: Java基礎
nav_order: 9
description: private、getter/setter、アクセス修飾子、パッケージ、importを学びます。
---

# カプセル化とパッケージ

カプセル化は、オブジェクトの中身を守り、外から不正な状態にされないようにする考え方です。

Javaでは、フィールドを `private` にし、必要な操作だけをメソッドとして公開することが多いです。

## publicフィールドの問題

次のクラスには問題があります。

```java
public class BankAccount {
    public int balance;
}
```

外から自由に書き換えられます。

```java
BankAccount account = new BankAccount();
account.balance = -1000;
```

残高がマイナスになるような不正な状態を防げません。

## privateで隠す

フィールドを `private` にすると、クラスの外から直接触れません。

```java
public class BankAccount {
    private int balance;

    public BankAccount(int balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("初期残高は0以上にしてください");
        }
        this.balance = balance;
    }

    public int getBalance() {
        return balance;
    }
}
```

`balance` は外から直接変更できません。残高を見せる必要がある場合だけ、`getBalance` を用意します。

## setterは必要なときだけ作る

何でもgetter/setterを作ればよいわけではありません。

悪い例です。

```java
public void setBalance(int balance) {
    this.balance = balance;
}
```

これだと、外から残高を好きに書き換えられます。

残高を増やす処理として表現します。

```java
public void deposit(int amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException("入金額は1以上にしてください");
    }
    balance += amount;
}
```

残高を減らす処理も、ルールを入れます。

```java
public void withdraw(int amount) {
    if (amount <= 0) {
        throw new IllegalArgumentException("出金額は1以上にしてください");
    }
    if (amount > balance) {
        throw new IllegalArgumentException("残高不足です");
    }
    balance -= amount;
}
```

カプセル化の目的は、単に `private` をつけることではありません。データを正しい状態に保つことです。

## アクセス修飾子

代表的なアクセス修飾子です。

| 修飾子 | 意味 |
| --- | --- |
| `public` | どこからでもアクセスできる |
| `protected` | 同じパッケージ、または子クラスからアクセスできる |
| 指定なし | 同じパッケージからアクセスできる |
| `private` | 同じクラス内だけアクセスできる |

最初は、フィールドは `private`、外から使わせたいメソッドは `public` と覚えてください。

## パッケージ

パッケージは、クラスを整理するための名前空間です。

```java
package com.example.user;

public class User {
}
```

ファイルの場所もパッケージに合わせます。

```text
src/
  com/
    example/
      user/
        User.java
```

Spring Bootでは、パッケージによる整理が非常に重要です。

```text
com.example.app
  controller
  service
  repository
  entity
  dto
```

このように、役割ごとにパッケージを分けます。

## import

別パッケージのクラスを使う場合は `import` します。

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Sato");
    }
}
```

`java.lang` パッケージは自動で読み込まれるため、`String` や `System` はimport不要です。

## カプセル化の練習観点

クラスを作ったら、次の観点で確認します。

- 外から直接変えられて困るフィールドが `public` になっていないか
- 値のチェックをコンストラクタやメソッドに入れているか
- setterを作る必要が本当にあるか
- クラス名、メソッド名が役割を表しているか
