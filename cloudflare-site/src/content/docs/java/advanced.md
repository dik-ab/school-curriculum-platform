---
title: "Java応用: 知っておくと強い言語機能"
section_key: java
section_title: Java基礎
nav_order: 20
description: Generics、enum設計、アノテーション、リフレクション、Stream/Optionalの使いどころ、並行処理、JVMの入口を学びます。
---

# Java応用: 知っておくと強い言語機能

このページは応用編です。

Spring BootでWebアプリを作り始めるだけなら、ここにある内容を全部理解していなくても進めます。まずは、クラス、メソッド、コレクション、例外、DTO、Service分割、テストを優先してください。

一方で、Javaの応用知識があると、次の場面で役に立ちます。

- Spring Bootやライブラリのコードを読める
- 型エラーやDIエラーの原因を追いやすい
- 重複した処理を共通化できる
- StreamやOptionalを使いすぎず、適切に判断できる
- パフォーマンスや並行処理の話を怖がらずに聞ける

> 応用編は「全部暗記する場所」ではありません。実務で出会ったときに、どの概念の話か分かる状態を目指します。

## 基礎と応用の線引き

| 分類 | 目的 | 例 |
| --- | --- | --- |
| 基礎 | Spring Bootの普通の開発を始める | クラス、List、例外、DTO、JUnit |
| 応用 | ライブラリや設計判断を深く理解する | Generics、アノテーション、リフレクション、並行処理 |

## Genericsを少し深く見る

Genericsは、型を後から指定できる仕組みです。

```java
public class ApiResponse<T> {
    private final T data;

    public ApiResponse(T data) {
        this.data = data;
    }

    public T getData() {
        return data;
    }
}
```

コードの意味です。

- `ApiResponse<T>` の `T` は、後から決める型です。
- `private final T data` は、レスポンスの中身です。
- コンストラクタで `data` を受け取ります。
- `getData` は、`T` 型のデータを返します。

使う側です。

```java
ApiResponse<UserResponse> response =
    new ApiResponse<>(new UserResponse(1, "Sato", "sato@example.com"));

UserResponse user = response.getData();
```

- `ApiResponse<UserResponse>` と書くと、`T` が `UserResponse` になります。
- `new ApiResponse<>(...)` の `<>` は、右辺の型推論です。
- `getData()` の戻り値は `UserResponse` になります。

Spring Bootでは、共通レスポンス型、ページング結果、RepositoryなどでGenericsをよく見ます。

## enumに振る舞いを持たせる

`enum` は、定数の一覧だけではありません。メソッドを持たせることもできます。

```java
public enum UserRole {
    ADMIN("管理者"),
    MEMBER("一般ユーザー");

    private final String label;

    UserRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```

コードの意味です。

- `ADMIN("管理者")` は、管理者ロールと表示名です。
- `MEMBER("一般ユーザー")` は、一般ユーザーロールと表示名です。
- `private final String label` は、表示名を保持します。
- `UserRole(String label)` は、enumのコンストラクタです。
- `getLabel` は、表示名を返します。

実務では、権限、注文状態、支払い方法、通知種別などで使います。

## アノテーション

アノテーションは、クラスやメソッドに追加情報を付ける仕組みです。

```java
@Override
public String toString() {
    return "User";
}
```

コードの意味です。

- `@Override` は、親クラスやインターフェースのメソッドを上書きしていることを表します。
- `toString` の名前や引数を間違えると、コンパイルエラーで気づけます。

Spring Bootでは、次のようなアノテーションをよく見ます。

```java
@RestController
@RequestMapping("/users")
public class UserController {
}
```

ここでは詳細に入りません。まずは「アノテーションはフレームワークに情報を伝える印」と理解してください。

## リフレクション

リフレクションは、実行時にクラスやメソッドの情報を調べる仕組みです。

```java
Class<?> clazz = UserResponse.class;

System.out.println(clazz.getSimpleName());
```

コードの意味です。

- `UserResponse.class` は、`UserResponse` クラスそのものの情報です。
- `Class<?>` は、クラス情報を表す型です。
- `getSimpleName()` は、クラス名だけを返します。

Spring BootやJacksonのようなライブラリは、アノテーションやフィールド情報を読むためにリフレクションを使います。自分で頻繁に書くものではありませんが、仕組みを知っているとフレームワークの動きが理解しやすくなります。

## StreamとOptionalの使いどころ

Streamは、コレクションの変換や絞り込みに便利です。

```java
List<String> names = users.stream()
    .filter(user -> user.isActive())
    .map(user -> user.getName())
    .toList();
```

コードの意味です。

- `users.stream()` は、ユーザー一覧をStreamにします。
- `filter` は、有効なユーザーだけ残します。
- `map` は、`User` から名前の `String` に変換します。
- `toList` は、結果をListに戻します。

ただし、複雑な条件が多い場合は、普通の `for` 文の方が読みやすいことがあります。

Optionalは、戻り値で「見つからない可能性」を表すときに使います。

```java
Optional<User> user = userRepository.findById(1);
```

フィールドに `Optional` を持たせたり、何でも `Optional` に包んだりする必要はありません。

## 並行処理の入口

Javaでは、複数の処理を同時に動かす仕組みがあります。

```java
Thread thread = new Thread(() -> {
    System.out.println("別スレッドで実行");
});

thread.start();
```

コードの意味です。

- `new Thread(...)` は、新しいスレッドを作ります。
- `() -> { ... }` は、別スレッドで実行したい処理です。
- `thread.start()` は、スレッドを開始します。

Webアプリでは、複数ユーザーのリクエストが同時に処理されます。最初から並行処理を自作する必要はありませんが、共有データの扱いには注意が必要です。

## JVMとメモリの入口

JavaのプログラムはJVM上で動きます。

知っておくとよい言葉です。

| 用語 | 意味 |
| --- | --- |
| JVM | Javaプログラムを動かす実行環境 |
| ヒープ | オブジェクトが置かれるメモリ領域 |
| GC | 使われなくなったオブジェクトを回収する仕組み |
| スタック | メソッド呼び出しやローカル変数を管理する領域 |

最初は、メモリを細かく操作する必要はありません。大量データ、パフォーマンス問題、メモリエラーに出会ったときに学び直せば十分です。

## 練習問題

### 問題1: 共通レスポンス型を作る

任意の型の `data` と、メッセージ `message` を持つ `ApiResponse<T>` を作ってください。

**答え:**

```java
public class ApiResponse<T> {
    private final T data;
    private final String message;

    public ApiResponse(T data, String message) {
        this.data = data;
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }
}
```

`T` を使うことで、`UserResponse` でも `ProductResponse` でも同じレスポンス型を使えます。

### 問題2: enumに表示名を持たせる

`PaymentStatus` に `UNPAID("未払い")`、`PAID("支払い済み")` を定義し、表示名を返す `getLabel` を作ってください。

**答え:**

```java
public enum PaymentStatus {
    UNPAID("未払い"),
    PAID("支払い済み");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```

状態と表示名を1か所にまとめることで、画面表示の分岐が散らばりにくくなります。

## まとめ

- Genericsは、共通クラスを型安全に使うための仕組み
- enumは、状態や権限を安全に表すのに向いている
- アノテーションは、フレームワークに情報を伝える印
- リフレクションは、実行時にクラス情報を読む仕組み
- StreamとOptionalは便利だが、読みやすさを優先する
- 並行処理やJVMメモリは、必要になったときに深掘りする応用分野
