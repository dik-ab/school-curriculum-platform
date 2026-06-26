---
title: 例外処理
section_key: java
section_title: Java基礎
nav_order: 12
description: 例外の考え方、try-catch、finally、throws、チェック例外と非チェック例外を学びます。
---

# 例外処理

例外は、プログラム実行中に起きる異常を表す仕組みです。

例えば、存在しないファイルを読もうとした、数値に変換できない文字列を変換しようとした、配列の範囲外にアクセスした、といった場面で例外が発生します。

## 例外が起きる例

```java
String input = "abc";
int number = Integer.parseInt(input);
```

`"abc"` は整数に変換できないため、`NumberFormatException` が発生します。

## try-catch

例外に対応するには `try-catch` を使います。

```java
public class Main {
    public static void main(String[] args) {
        String input = "abc";

        try {
            int number = Integer.parseInt(input);
            System.out.println(number);
        } catch (NumberFormatException e) {
            System.out.println("数値に変換できません");
        }
    }
}
```

`try` の中で例外が発生すると、対応する `catch` に処理が移ります。

## finally

`finally` は、例外が発生してもしなくても最後に実行されます。

```java
try {
    System.out.println("処理開始");
} catch (Exception e) {
    System.out.println("エラー");
} finally {
    System.out.println("後片付け");
}
```

ファイルやネットワークなど、最後に閉じる必要がある処理で使われます。

## try-with-resources

ファイルなどのリソースを扱う場合は、try-with-resourcesを使うと自動で閉じられます。

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("sample.txt"))) {
            String line = reader.readLine();
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("ファイルを読めませんでした");
        }
    }
}
```

## throws

メソッド内で例外を処理せず、呼び出し元に任せる場合は `throws` を書きます。

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileLoader {
    public String load(String path) throws IOException {
        return Files.readString(Path.of(path));
    }
}
```

呼び出し側は、`try-catch` する必要があります。

```java
FileLoader loader = new FileLoader();

try {
    String text = loader.load("sample.txt");
    System.out.println(text);
} catch (IOException e) {
    System.out.println("読み込みに失敗しました");
}
```

## チェック例外と非チェック例外

Javaの例外には、大きく2種類あります。

| 種類 | 特徴 | 例 |
| --- | --- | --- |
| チェック例外 | コンパイル時に対応が求められる | `IOException` |
| 非チェック例外 | 実行時に発生する | `NullPointerException`, `IllegalArgumentException` |

チェック例外は、`try-catch` または `throws` が必要です。

非チェック例外は、プログラムのバグや不正な引数を表すことが多いです。

## IllegalArgumentException

引数が不正な場合は、`IllegalArgumentException` を使うことがあります。

```java
public class User {
    private final String name;

    public User(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("名前は必須です");
        }
        this.name = name;
    }
}
```

これは、間違った使い方を早めに検出するための例外です。

## 例外処理の考え方

例外処理では、何でも握りつぶしてはいけません。

悪い例です。

```java
try {
    int number = Integer.parseInt(input);
} catch (Exception e) {
}
```

何が起きたのかわからなくなります。

よい例です。

```java
try {
    int number = Integer.parseInt(input);
    System.out.println(number);
} catch (NumberFormatException e) {
    System.out.println("整数を入力してください");
}
```

例外は「エラーを隠す仕組み」ではなく、「失敗時の処理を明確にする仕組み」です。
