---
title: コレクション
section_key: java
section_title: Java基礎
nav_order: 13
description: List、Set、Map、ジェネリクス、ArrayList、HashSet、HashMapの使い分けを学びます。
---

# コレクション

コレクションは、複数のデータを扱うためのクラス群です。

配列は要素数が固定ですが、コレクションは要素を追加したり削除したりしやすいです。

## List

`List` は、順番を持つデータの集まりです。重複も許可します。

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();

        names.add("Sato");
        names.add("Suzuki");
        names.add("Sato");

        System.out.println(names.get(0)); // Sato
        System.out.println(names.size()); // 3
    }
}
```

`List<String>` のように、入れる型を指定します。これをジェネリクスと呼びます。

## Listをループする

```java
List<String> names = new ArrayList<>();
names.add("Sato");
names.add("Suzuki");

for (String name : names) {
    System.out.println(name);
}
```

インデックスが必要な場合は通常の `for` を使います。

```java
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}
```

## Set

`Set` は、重複しないデータの集まりです。

```java
import java.util.HashSet;
import java.util.Set;

Set<String> tags = new HashSet<>();

tags.add("java");
tags.add("spring");
tags.add("java");

System.out.println(tags.size()); // 2
```

重複を避けたい場合に使います。例えば、タグ、権限、既読IDなどです。

## Map

`Map` は、キーと値のペアを扱います。

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> scores = new HashMap<>();

scores.put("Sato", 80);
scores.put("Suzuki", 90);

System.out.println(scores.get("Sato")); // 80
```

キーが存在するか確認する場合は `containsKey` を使います。

```java
if (scores.containsKey("Sato")) {
    System.out.println(scores.get("Sato"));
}
```

## List、Set、Mapの使い分け

| 種類 | 特徴 | 使う場面 |
| --- | --- | --- |
| `List` | 順番あり、重複あり | 一覧、検索結果、投稿一覧 |
| `Set` | 重複なし | タグ、権限、ユニークなID |
| `Map` | キーと値 | IDからデータを引く、集計結果 |

最初は、一覧なら `List`、重複を避けたいなら `Set`、キーで取り出したいなら `Map` と覚えてください。

## オブジェクトのList

業務アプリでは、文字列や数値だけでなく、クラスのインスタンスをListに入れます。

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
}
```

```java
List<User> users = new ArrayList<>();
users.add(new User("Sato", "sato@example.com"));
users.add(new User("Suzuki", "suzuki@example.com"));

for (User user : users) {
    System.out.println(user.getName());
}
```

Spring Bootでは、データベースから取得したEntityやDTOを `List` として扱う場面が非常に多いです。

## 変更できないList

固定の一覧を作る場合は、`List.of` を使えます。

```java
List<String> roles = List.of("admin", "user", "guest");
```

このListには後から追加できません。

```java
roles.add("owner"); // UnsupportedOperationException
```

変更されて困るデータには、変更できないコレクションを使う選択肢があります。
