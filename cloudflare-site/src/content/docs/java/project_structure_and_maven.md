---
title: プロジェクト構成とMaven
section_key: java
section_title: Java基礎
nav_order: 3
description: Javaプロジェクトの標準的なフォルダ構成、Maven、pom.xml、依存関係、テスト配置を学びます。
---

# プロジェクト構成とMaven

Hello Worldでは、`Main.java` を1つ作って `javac` と `java` で実行しました。

実務では、Javaファイルが1つだけということはほとんどありません。Spring Bootに進むと、Controller、Service、Repository、DTO、テストコードなど、たくさんのファイルを決まった場所に置きます。

そこで必要になるのが、プロジェクト構成とビルドツールの理解です。

> 実務では、MavenやGradleが「コンパイル」「依存ライブラリの取得」「テスト実行」「アプリの起動」をまとめて面倒見てくれます。最初はMavenだけ押さえれば十分です。

## Mavenとは

Mavenは、Javaプロジェクトを管理するためのビルドツールです。

Mavenが担当することです。

- 必要なライブラリをダウンロードする
- Javaファイルをコンパイルする
- テストを実行する
- アプリケーションをパッケージ化する
- 標準的なフォルダ構成を決める

Spring Bootのプロジェクトでも、`pom.xml` というMavenの設定ファイルをよく見ます。

## 標準的なフォルダ構成

MavenのJavaプロジェクトでは、次の構成がよく使われます。

```text
sample-app/
├── pom.xml
└── src/
    ├── main/
    │   └── java/
    │       └── com/
    │           └── example/
    │               └── Main.java
    └── test/
        └── java/
            └── com/
                └── example/
                    └── MainTest.java
```

それぞれの意味です。

- `pom.xml` は、Mavenの設定ファイルです。
- `src/main/java` は、アプリ本体のJavaコードを置く場所です。
- `src/test/java` は、テストコードを置く場所です。
- `com/example` は、パッケージ名に対応するフォルダです。
- `Main.java` は、本番コードです。
- `MainTest.java` は、テストコードです。

## pom.xmlの最小例

`pom.xml` は、プロジェクトの情報と依存ライブラリを書きます。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>sample-app</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
  </properties>
</project>
```

コードの意味です。

- `<project>` は、Maven設定全体の入れ物です。
- `<modelVersion>` は、Maven設定ファイルの形式です。通常は `4.0.0` です。
- `<groupId>` は、会社や組織を表す名前です。
- `<artifactId>` は、アプリケーションやライブラリの名前です。
- `<version>` は、プロジェクトのバージョンです。
- `<properties>` は、共通設定を書く場所です。
- `<maven.compiler.source>` と `<maven.compiler.target>` は、Java 21でコンパイルする設定です。

## パッケージとフォルダの対応

次のJavaファイルを考えます。

```java
package com.example;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Maven");
    }
}
```

このファイルは、次の場所に置きます。

```text
src/main/java/com/example/Main.java
```

コードの意味です。

- `package com.example;` は、このクラスが `com.example` パッケージに属することを表します。
- `com.example` は、フォルダでは `com/example` に対応します。
- `public class Main` なので、ファイル名は `Main.java` にします。
- `main` メソッドは、アプリケーションの入口です。

## Spring Bootでどう役に立つか

Spring Bootでは、次のような構成をよく使います。

```text
src/main/java/com/example/app/
├── AppApplication.java
├── controller/
│   └── UserController.java
├── service/
│   └── UserService.java
├── repository/
│   └── UserRepository.java
└── dto/
    └── UserResponse.java
```

それぞれの役割です。

| フォルダ | 役割 |
| --- | --- |
| `controller` | HTTPリクエストを受け取る |
| `service` | 業務ロジックを書く |
| `repository` | データベースとのやり取りを書く |
| `dto` | 画面やAPIに渡すデータの形を書く |

このページではSpring Bootの書き方までは扱いません。まずは「Javaではパッケージとフォルダで責務を分ける」と理解してください。

## 練習問題

### 問題1: パッケージに対応するフォルダ

次のクラスは、どのフォルダに置くべきでしょうか。

```java
package com.school.user;

public class UserService {
}
```

**答え:**

```text
src/main/java/com/school/user/UserService.java
```

`package com.school.user;` が `com/school/user` に対応します。クラス名が `UserService` なので、ファイル名は `UserService.java` です。

### 問題2: フォルダの役割を説明する

`src/main/java` と `src/test/java` の違いを説明してください。

**答え:**

- `src/main/java` は、アプリ本体のコードを置く場所です。
- `src/test/java` は、テストコードを置く場所です。

実務では、本番コードとテストコードを分けることで、どのコードがアプリの動作に使われ、どのコードが検証用なのかを明確にします。
