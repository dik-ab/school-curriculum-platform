---
title: 例外処理
section_key: java
section_title: Java基礎
nav_order: 14
description: 例外の考え方、try-catch、finally、throws、チェック例外と非チェック例外を学びます。
---

# 例外処理

例外は、プログラム実行中に起きる異常を表す仕組みです。

例えば、存在しないファイルを読もうとした、数値に変換できない文字列を変換しようとした、配列の範囲外にアクセスした、といった場面で例外が発生します。

例外処理の目的は、エラーを隠すことではありません。失敗したときに「どこで止めるか」「ユーザーや呼び出し元に何を伝えるか」「後片付けをどうするか」を明確にすることです。

## 例外が起きる例

```java
String input = "abc";
int number = Integer.parseInt(input);
```

`"abc"` は整数に変換できないため、`NumberFormatException` が発生します。

`NumberFormatException` は `RuntimeException` の一種です。つまり、コンパイル時に必ず `try-catch` を書けと要求される例外ではありません。しかし、ユーザー入力や外部データのように失敗が予想できる場面では、適切に捕まえて処理します。

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

`try` の中で例外が発生した後、その後ろの処理は実行されません。

```java
try {
    System.out.println("変換前");
    int number = Integer.parseInt("abc");
    System.out.println("変換後"); // ここは実行されない
} catch (NumberFormatException e) {
    System.out.println("数値に変換できません");
}
```

## 複数のcatch

例外の種類ごとに処理を分けたい場合は、`catch` を複数書けます。

```java
try {
    int index = Integer.parseInt(args[0]);
    String[] names = {"佐藤", "鈴木", "田中"};
    System.out.println(names[index]);
} catch (NumberFormatException e) {
    System.out.println("番号は整数で入力してください");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("指定できる番号の範囲外です");
}
```

`catch` は上から順に判定されます。親クラスの例外を先に書くと、子クラスの `catch` に到達できません。

悪い例です。

```java
try {
    int number = Integer.parseInt("abc");
} catch (Exception e) {
    System.out.println("何らかのエラー");
} catch (NumberFormatException e) { // コンパイルエラー
    System.out.println("数値変換エラー");
}
```

`NumberFormatException` は `Exception` の一種なので、より具体的な例外を先に書きます。

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

ただし、ファイル、DB接続、ネットワーク接続のような `AutoCloseable` なリソースには、次の `try-with-resources` を優先します。

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

`try` の丸括弧の中で作ったリソースは、処理が成功しても失敗しても自動で `close()` されます。手動で `finally` に `reader.close()` を書くより、閉じ忘れや二重エラーを避けやすくなります。

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

### どちらを使うか

外部要因で失敗する可能性があり、呼び出し元に回復処理を考えてほしい場合は、チェック例外が使われることがあります。例えばファイルが存在しない、読み取り権限がない、ネットワークが切れている、といった失敗です。

一方で、メソッドの使い方が間違っている場合は、非チェック例外を使うことが多いです。例えば `null` を渡してはいけない引数に `null` が渡された、0以上であるべき値に負数が渡された、といった失敗です。

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

## 独自例外

アプリケーション固有の失敗を表したい場合は、独自の例外クラスを作ることがあります。

```java
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}
```

使う側です。

```java
public class BankAccount {
    private int balance;

    public BankAccount(int balance) {
        this.balance = balance;
    }

    public void withdraw(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("出金額は1円以上にしてください");
        }
        if (amount > balance) {
            throw new InsufficientBalanceException("残高が不足しています");
        }
        balance -= amount;
    }
}
```

ただし、何でも独自例外にすればよいわけではありません。まずは標準の例外で意味が伝わるかを考え、業務上の意味をはっきり名前にしたい場合に独自例外を使います。

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

## 実務でよくある判断

- ユーザー入力のミスは、ユーザーに直せるメッセージを返す
- プログラムの使い方のミスは、`IllegalArgumentException` などで早めに止める
- ファイルや通信の失敗は、ログを残し、必要なら呼び出し元に処理を任せる
- `catch (Exception e)` は最後の手段にする
- 何もせずに空の `catch` にしない
- エラーメッセージには、原因を特定できる情報を残す

## 練習問題

### 問題1: 整数入力の変換

文字列を整数に変換する `parseScore` メソッドを作ってください。

**要件:**

- 引数は `String input`
- 整数に変換できる場合は、その数値を返す
- 変換できない場合は `IllegalArgumentException` を投げる
- エラーメッセージは `"点数は整数で入力してください"` にする

**解答例:**

```java
public class ScoreParser {
    public static int parseScore(String input) {
        try {
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("点数は整数で入力してください");
        }
    }
}
```

ここでは `NumberFormatException` をそのまま外に出さず、呼び出し元にとって意味のある `IllegalArgumentException` に変換しています。

### 問題2: 残高不足の独自例外

銀行口座を表す `BankAccount` クラスを作り、残高より大きい金額を出金しようとしたら `InsufficientBalanceException` を投げてください。

**要件:**

- `InsufficientBalanceException` は `RuntimeException` を継承する
- `withdraw(int amount)` で出金する
- `amount <= 0` の場合は `IllegalArgumentException`
- `amount > balance` の場合は `InsufficientBalanceException`

**解答例:**

```java
class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}

class BankAccount {
    private int balance;

    public BankAccount(int balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("初期残高は0円以上にしてください");
        }
        this.balance = balance;
    }

    public void withdraw(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("出金額は1円以上にしてください");
        }
        if (amount > balance) {
            throw new InsufficientBalanceException("残高が不足しています");
        }
        balance -= amount;
    }

    public int getBalance() {
        return balance;
    }
}
```
