---
title: Java基礎演習
section_key: java
section_title: Java基礎
nav_order: 18
description: Java基礎で学んだ文法を使って、成績管理とユーザー管理の小さなプログラムを作ります。
---

# Java基礎演習

ここまで学んだ内容を使って、小さなプログラムを作ります。

演習では、完璧な設計よりも、文法を自分の手で使えることを重視します。

## 演習1: 年齢判定

`age` の値をもとに、成人か未成年かを表示してください。

条件です。

- `age` が18以上なら `成人です`
- 18未満なら `未成年です`

例です。

```java
int age = 20;
```

出力です。

```text
成人です
```

**解答例:**

```java
public class Main {
    public static void main(String[] args) {
        int age = 20;

        if (age >= 18) {
            System.out.println("成人です");
        } else {
            System.out.println("未成年です");
        }
    }
}
```

- `int age = 20;` で年齢を数値として用意します。
- `age >= 18` で18歳以上か判定します。
- 条件が true なら `成人です`、false なら `未成年です` を表示します。

## 演習2: 点数の評価

`score` の値に応じて評価を表示してください。

| 点数 | 評価 |
| --- | --- |
| 90以上 | A |
| 70以上 | B |
| 50以上 | C |
| 50未満 | D |

メソッドに切り出してください。

```java
public static String grade(int score) {
    // ここに実装
}
```

**解答例:**

```java
public static String grade(int score) {
    if (score >= 90) {
        return "A";
    }
    if (score >= 70) {
        return "B";
    }
    if (score >= 50) {
        return "C";
    }
    return "D";
}
```

- 点数が高い条件から順番に判定します。
- `return` するとメソッドが終了するため、`else` を書かなくても動きます。
- 実務では、評価やステータスの判定をメソッドに切り出すとテストしやすくなります。

## 演習3: 配列の平均点

次の配列の平均点を表示してください。

```java
int[] scores = {80, 90, 70, 60, 100};
```

出力例です。

```text
平均点: 80.0
```

**解答例:**

```java
public class Main {
    public static void main(String[] args) {
        int[] scores = {80, 90, 70, 60, 100};
        int total = 0;

        for (int score : scores) {
            total += score;
        }

        double average = (double) total / scores.length;
        System.out.println("平均点: " + average);
    }
}
```

- `int[] scores` で点数の配列を作ります。
- `total` に合計点を入れます。
- 拡張for文で、点数を1つずつ取り出します。
- `(double) total` により、小数の割り算にします。
- `scores.length` は、配列の要素数です。

## 演習4: Userクラス

`User` クラスを作ってください。

条件です。

- フィールドは `name` と `email`
- フィールドは `private`
- コンストラクタで `name` と `email` を受け取る
- `getName` と `getEmail` を用意する
- `displayName` メソッドで `name <email>` を返す

使用例です。

```java
User user = new User("Sato", "sato@example.com");
System.out.println(user.displayName());
```

出力です。

```text
Sato <sato@example.com>
```

**解答例:**

```java
public class User {
    private final String name;
    private final String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String displayName() {
        return name + " <" + email + ">";
    }
}
```

- `private final` により、外から直接変更できないフィールドにします。
- コンストラクタで、必要な値を受け取ります。
- getterで、外から値を読み取れるようにします。
- `displayName` は、表示用の文字列を作る責務を持ちます。

## 演習5: BankAccountクラス

`BankAccount` クラスを作ってください。

条件です。

- 残高 `balance` は `private`
- 初期残高はコンストラクタで受け取る
- 初期残高が0未満なら `IllegalArgumentException`
- `deposit` で入金する
- `withdraw` で出金する
- 入金額、出金額が0以下なら `IllegalArgumentException`
- 残高不足なら `IllegalArgumentException`
- `getBalance` で残高を取得する

使用例です。

```java
BankAccount account = new BankAccount(1000);
account.deposit(500);
account.withdraw(300);

System.out.println(account.getBalance());
```

出力です。

```text
1200
```

**解答例:**

```java
public class BankAccount {
    private int balance;

    public BankAccount(int balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("初期残高は0円以上にしてください");
        }
        this.balance = balance;
    }

    public void deposit(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("入金額は1円以上にしてください");
        }
        balance += amount;
    }

    public void withdraw(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("出金額は1円以上にしてください");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("残高が不足しています");
        }
        balance -= amount;
    }

    public int getBalance() {
        return balance;
    }
}
```

- `balance` は外から直接変更させないため `private` にします。
- 入金と出金は、必ずメソッド経由にします。
- 不正な金額は例外で止めます。
- 実務では、残高や在庫のような値は「勝手に変更されない」設計が重要です。

## 演習6: Listでユーザー一覧

`List<User>` を作り、複数のユーザーを追加して、全員の表示名を出力してください。

```java
List<User> users = new ArrayList<>();
users.add(new User("Sato", "sato@example.com"));
users.add(new User("Suzuki", "suzuki@example.com"));
```

出力例です。

```text
Sato <sato@example.com>
Suzuki <suzuki@example.com>
```

**解答例:**

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<User> users = new ArrayList<>();
        users.add(new User("Sato", "sato@example.com"));
        users.add(new User("Suzuki", "suzuki@example.com"));

        for (User user : users) {
            System.out.println(user.displayName());
        }
    }
}
```

- `List<User>` は、Userだけを入れられる一覧です。
- `new ArrayList<>()` で、追加できるリストを作ります。
- `users.add(...)` で、ユーザーを追加します。
- 拡張for文で、全ユーザーを順番に表示します。

## 演習7: Notifierインターフェース

次のインターフェースを作ってください。

```java
public interface Notifier {
    void send(String message);
}
```

次に、`EmailNotifier` と `ConsoleNotifier` を作ってください。

```java
public class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("メール: " + message);
    }
}
```

`Notifier` 型で受け取り、実装クラスを差し替えられることを確認します。

```java
Notifier notifier = new EmailNotifier();
notifier.send("登録完了");
```

**解答例:**

```java
public interface Notifier {
    void send(String message);
}
```

```java
public class EmailNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("メール: " + message);
    }
}
```

```java
public class ConsoleNotifier implements Notifier {
    @Override
    public void send(String message) {
        System.out.println("コンソール: " + message);
    }
}
```

```java
Notifier notifier = new EmailNotifier();
notifier.send("登録完了");

notifier = new ConsoleNotifier();
notifier.send("登録完了");
```

- `Notifier` は、通知する機能の約束です。
- `EmailNotifier` と `ConsoleNotifier` は、通知方法の実装です。
- 変数の型を `Notifier` にすると、実装クラスを差し替えられます。
- Spring BootのDIでは、この「インターフェース越しに使う」考え方がよく出ます。

## 演習8: 入力値の変換と例外処理

文字列を整数に変換するメソッドを作ってください。

```java
public static int parseAge(String input) {
    // ここに実装
}
```

条件です。

- 整数に変換できる場合は数値を返す
- 変換できない場合は `IllegalArgumentException` を投げる
- 年齢が0未満の場合も `IllegalArgumentException` を投げる

ヒントです。

```java
try {
    return Integer.parseInt(input);
} catch (NumberFormatException e) {
    throw new IllegalArgumentException("年齢は整数で入力してください");
}
```

**解答例:**

```java
public static int parseAge(String input) {
    try {
        int age = Integer.parseInt(input);
        if (age < 0) {
            throw new IllegalArgumentException("年齢は0以上で入力してください");
        }
        return age;
    } catch (NumberFormatException e) {
        throw new IllegalArgumentException("年齢は整数で入力してください");
    }
}
```

- `Integer.parseInt(input)` で文字列を整数に変換します。
- 変換できない文字列なら `NumberFormatException` が発生します。
- `age < 0` の場合は、年齢として不正なので例外にします。
- 実務では、フォーム入力やCSV取り込みでこのような検証が必要です。

## 演習9: Streamで絞り込み

`List<User>` から、メールアドレスが `example.com` で終わるユーザーだけを取り出してください。

```java
List<User> filtered = users.stream()
    .filter(user -> user.getEmail().endsWith("example.com"))
    .toList();
```

`for` 文でも実装し、Stream版と比較してください。

**解答例:**

```java
List<User> filtered = users.stream()
    .filter(user -> user.getEmail().endsWith("example.com"))
    .toList();
```

`for` 文で書く場合です。

```java
List<User> filtered = new ArrayList<>();

for (User user : users) {
    if (user.getEmail().endsWith("example.com")) {
        filtered.add(user);
    }
}
```

- `stream()` は、ListをStreamとして扱います。
- `filter` は、条件に合う要素だけを残します。
- `endsWith("example.com")` は、メールアドレスの末尾を確認します。
- `toList()` は、結果をListに戻します。
- 条件が複雑なときは、`for` 文の方が読みやすい場合もあります。

## 確認観点

演習が終わったら、次を確認します。

- クラス名とファイル名が一致しているか
- 変数名、メソッド名が意味を表しているか
- フィールドを不用意に `public` にしていないか
- 例外を握りつぶしていないか
- 同じ処理を何度も書いていないか
- `List`、`Set`、`Map` の使い分けを説明できるか
