---
title: Java基礎演習
section_key: java
section_title: Java基礎
nav_order: 14
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

## 演習3: 配列の平均点

次の配列の平均点を表示してください。

```java
int[] scores = {80, 90, 70, 60, 100};
```

出力例です。

```text
平均点: 80.0
```

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

## 演習9: Streamで絞り込み

`List<User>` から、メールアドレスが `example.com` で終わるユーザーだけを取り出してください。

```java
List<User> filtered = users.stream()
    .filter(user -> user.getEmail().endsWith("example.com"))
    .toList();
```

`for` 文でも実装し、Stream版と比較してください。

## 確認観点

演習が終わったら、次を確認します。

- クラス名とファイル名が一致しているか
- 変数名、メソッド名が意味を表しているか
- フィールドを不用意に `public` にしていないか
- 例外を握りつぶしていないか
- 同じ処理を何度も書いていないか
- `List`、`Set`、`Map` の使い分けを説明できるか
