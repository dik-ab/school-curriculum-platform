---
title: 条件分岐と繰り返し
section_key: java
section_title: Java基礎
nav_order: 7
description: if、switch、for、while、break、continueを学びます。
---

# 条件分岐と繰り返し

プログラムは基本的に上から順番に実行されます。ただし、実際のアプリでは「条件によって処理を変える」「同じ処理を繰り返す」場面が多くあります。

## if文

`if` は条件が成り立つ場合だけ処理を実行します。

```java
int age = 20;

if (age >= 18) {
    System.out.println("成人です");
}
```

条件が成り立たない場合の処理は `else` に書きます。

```java
int age = 16;

if (age >= 18) {
    System.out.println("成人です");
} else {
    System.out.println("未成年です");
}
```

条件が複数ある場合は `else if` を使います。

```java
int score = 82;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 70) {
    System.out.println("B");
} else if (score >= 50) {
    System.out.println("C");
} else {
    System.out.println("D");
}
```

## switch文

値によって処理を分ける場合は `switch` が使えます。

```java
String role = "admin";

switch (role) {
    case "admin":
        System.out.println("管理者です");
        break;
    case "user":
        System.out.println("一般ユーザーです");
        break;
    default:
        System.out.println("不明な権限です");
        break;
}
```

`break` を忘れると、次の `case` に処理が流れることがあります。初学者は必ず `break` を書く癖をつけてください。

Javaの新しい書き方では、次のようにも書けます。

```java
String role = "admin";

String label = switch (role) {
    case "admin" -> "管理者";
    case "user" -> "一般ユーザー";
    default -> "不明";
};

System.out.println(label);
```

最初は通常の `switch` を理解してから、新しい書き方を使うとよいです。

## for文

回数が決まっている繰り返しには `for` を使います。

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

結果は次の通りです。

```text
0
1
2
3
4
```

`i < 5` なので、`5` は表示されません。

## while文

条件が成り立つ間、繰り返す場合は `while` を使います。

```java
int count = 0;

while (count < 3) {
    System.out.println(count);
    count++;
}
```

`while` は条件の作り方を間違えると無限ループになります。

```java
while (true) {
    System.out.println("止まりません");
}
```

無限ループが必要な場面もありますが、初学者のうちは条件更新を忘れていないか必ず確認します。

## 拡張for文

配列やコレクションの中身を順番に処理する場合は、拡張for文が使えます。

```java
String[] names = {"Sato", "Suzuki", "Takahashi"};

for (String name : names) {
    System.out.println(name);
}
```

インデックスが不要な場合は、この書き方の方が読みやすいです。

## breakとcontinue

`break` は繰り返しを終了します。

```java
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
```

`continue` は、現在の周回だけをスキップします。

```java
for (int i = 0; i < 5; i++) {
    if (i == 2) {
        continue;
    }
    System.out.println(i);
}
```

結果は `0, 1, 3, 4` です。

## 実務での考え方

条件分岐や繰り返しは、書けるだけでは不十分です。実務では、読みやすい条件にすることが重要です。

```java
if (age >= 18 && hasTicket && !banned) {
    System.out.println("入場できます");
}
```

条件が長くなる場合は、変数に意味を持たせます。

```java
boolean canEnter = age >= 18 && hasTicket && !banned;

if (canEnter) {
    System.out.println("入場できます");
}
```

読みやすい条件は、バグを減らします。
