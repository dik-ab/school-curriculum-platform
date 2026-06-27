---
title: クラスとオブジェクト
section_key: java
section_title: Java基礎
nav_order: 10
description: クラス、インスタンス、フィールド、メソッド、コンストラクタ、thisを学びます。
---

# クラスとオブジェクト

Javaはオブジェクト指向の言語です。オブジェクト指向では、データと処理をクラスにまとめます。

例えば、ユーザーを扱うなら、名前やメールアドレスだけでなく、表示名を作る処理なども一緒に持たせられます。

## クラスとは

クラスは、オブジェクトの設計図です。

```java
public class User {
    String name;
    String email;
}
```

`name` と `email` はフィールドです。フィールドは、オブジェクトが持つデータです。

## インスタンスを作る

クラスから実体を作ることを、インスタンス化と呼びます。

```java
User user = new User();
user.name = "Sato";
user.email = "sato@example.com";

System.out.println(user.name);
```

`new User()` によって、`User` クラスのインスタンスが作られます。

## クラスにメソッドを持たせる

クラスには、データだけでなく処理も書けます。

```java
public class User {
    String name;
    String email;

    String displayName() {
        return name + " <" + email + ">";
    }
}
```

呼び出し例です。

```java
User user = new User();
user.name = "Sato";
user.email = "sato@example.com";

System.out.println(user.displayName());
```

結果です。

```text
Sato <sato@example.com>
```

## コンストラクタ

コンストラクタは、インスタンスを作るときに呼ばれる特別なメソッドです。

```java
public class User {
    String name;
    String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    String displayName() {
        return name + " <" + email + ">";
    }
}
```

使う側は次のように書けます。

```java
User user = new User("Sato", "sato@example.com");
System.out.println(user.displayName());
```

コンストラクタを使うと、必要な値を入れ忘れにくくなります。

## this

`this` は、現在のインスタンス自身を表します。

```java
public User(String name, String email) {
    this.name = name;
    this.email = email;
}
```

左側の `this.name` はフィールド、右側の `name` は引数です。

## staticとインスタンス

ここまで `main` メソッドでは `static` を使ってきました。

```java
public static void main(String[] args) {
}
```

`static` は、インスタンスを作らなくても使えるメンバーです。

```java
public class Tax {
    public static double calculate(int price) {
        return price * 1.1;
    }
}
```

呼び出しは次のようになります。

```java
double total = Tax.calculate(1000);
```

ただし、業務アプリでは何でも `static` にするのではなく、状態を持つものはインスタンスとして扱います。

## クラスにする判断

次のような場合は、クラスにまとめる候補です。

- 複数の値がいつもセットで使われる
- そのデータに関係する処理がある
- 意味のある名前をつけたい

例えば、ユーザーを `String name`, `String email`, `int age` のようにバラバラに扱うより、`User` クラスにした方が意味が明確です。

```java
public class User {
    String name;
    String email;
    int age;
}
```

Spring Bootでは、Entity、DTO、Formなどのクラスが多く出てきます。Java基礎の段階で、クラスにデータと処理をまとめる感覚をつかんでおきます。
