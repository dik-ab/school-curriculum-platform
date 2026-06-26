---
title: 継承、抽象クラス、インターフェース
section_key: java
section_title: Java基礎
nav_order: 10
description: extends、super、オーバーライド、抽象クラス、interface、多態性を学びます。
---

# 継承、抽象クラス、インターフェース

Javaのオブジェクト指向では、クラス同士の関係を表すために、継承、抽象クラス、インターフェースを使います。

ただし、初学者がここで混乱しやすいです。最初から複雑な設計をしようとせず、「共通化したい処理」「同じように扱いたい型」が出てきたときに使うものとして理解します。

## 継承

継承は、既存のクラスを元にして新しいクラスを作る仕組みです。

```java
public class Animal {
    public void eat() {
        System.out.println("食べます");
    }
}
```

```java
public class Dog extends Animal {
    public void bark() {
        System.out.println("ワン");
    }
}
```

`Dog` は `Animal` を継承しているため、`eat` も使えます。

```java
Dog dog = new Dog();
dog.eat();
dog.bark();
```

## オーバーライド

親クラスのメソッドを子クラスで上書きすることを、オーバーライドと呼びます。

```java
public class Animal {
    public void speak() {
        System.out.println("鳴きます");
    }
}
```

```java
public class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("ワン");
    }
}
```

`@Override` をつけると、オーバーライドできていない場合にコンパイルエラーになります。つける習慣を持ってください。

## super

子クラスから親クラスのコンストラクタやメソッドを呼ぶときは `super` を使います。

```java
public class User {
    protected String name;

    public User(String name) {
        this.name = name;
    }
}
```

```java
public class AdminUser extends User {
    public AdminUser(String name) {
        super(name);
    }
}
```

## 抽象クラス

抽象クラスは、そのままインスタンス化せず、子クラスに共通の土台を提供するクラスです。

```java
public abstract class Payment {
    public abstract void pay(int amount);

    public void printReceipt(int amount) {
        System.out.println(amount + "円のレシートを発行しました");
    }
}
```

`abstract` がついたメソッドは、子クラスで実装する必要があります。

```java
public class CreditCardPayment extends Payment {
    @Override
    public void pay(int amount) {
        System.out.println("クレジットカードで" + amount + "円支払いました");
    }
}
```

抽象クラスは、共通のフィールドや共通処理を持たせたい場合に使います。

## インターフェース

インターフェースは、クラスが持つべき振る舞いの約束を定義します。

```java
public interface Notifier {
    void send(String message);
}
```

実装するクラスは `implements` を使います。

```java
public class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("メール送信: " + message);
    }
}
```

```java
public class LineNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("LINE送信: " + message);
    }
}
```

## 多態性

多態性は、具体的なクラスが違っても、同じ型として扱える性質です。

```java
Notifier notifier = new EmailNotifier();
notifier.send("登録が完了しました");
```

`Notifier` 型で受け取れば、`EmailNotifier` にも `LineNotifier` にも差し替えられます。

```java
public class NotificationService {
    private final Notifier notifier;

    public NotificationService(Notifier notifier) {
        this.notifier = notifier;
    }

    public void notify(String message) {
        notifier.send(message);
    }
}
```

この考え方は、Spring BootのDIで非常に重要です。実装を直接固定せず、インターフェースに依存すると、差し替えやテストがしやすくなります。

## 継承より委譲を優先する

継承は便利ですが、使いすぎるとクラス同士の結びつきが強くなります。

単に処理を再利用したいだけなら、別クラスに処理を持たせて呼び出す方がわかりやすいことがあります。これを委譲と呼びます。

```java
public class PriceCalculator {
    public int calculate(int price, int quantity) {
        return price * quantity;
    }
}
```

```java
public class OrderService {
    private final PriceCalculator calculator = new PriceCalculator();

    public int total(int price, int quantity) {
        return calculator.calculate(price, quantity);
    }
}
```

継承は「AはBの一種」と自然に言えるときに使います。処理を借りたいだけなら、委譲を検討します。
