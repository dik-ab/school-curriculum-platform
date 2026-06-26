---
title: Hello Worldと実行の流れ
section_key: java
section_title: Java基礎
nav_order: 2
description: Javaファイルを書き、コンパイルし、実行する流れを学びます。
---

# Hello Worldと実行の流れ

最初に、Javaのプログラムがどのように作られ、どのように動くのかを確認します。

Javaは、書いたファイルをそのまま実行するのではなく、いったんコンパイルしてから実行します。

```text
Main.java
  ↓ javacでコンパイル
Main.class
  ↓ javaで実行
画面に結果が表示される
```

## Main.javaを作る

`Main.java` を作成し、次のコードを書きます。

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

## コンパイルする

ターミナルで次を実行します。

```bash
javac Main.java
```

成功すると、同じフォルダに `Main.class` が作られます。

`Main.class` は、JVMが実行できる形に変換されたファイルです。人間が読むためのファイルではありません。

## 実行する

次を実行します。

```bash
java Main
```

結果は次のようになります。

```text
Hello, Java!
```

ここで `java Main.java` ではなく、`java Main` と書く点に注意してください。実行時はクラス名を指定します。

## コードの意味

```java
public class Main {
}
```

`class` は、Javaのプログラムを入れる基本単位です。ファイル名が `Main.java` の場合、基本的には `public class Main` とクラス名を合わせます。

```java
public static void main(String[] args) {
}
```

`main` メソッドは、Javaプログラムの入口です。Javaはここから処理を始めます。

```java
System.out.println("Hello, Java!");
```

`System.out.println` は、文字を画面に出力する命令です。`println` は出力後に改行します。

## よくあるエラー

### ファイル名とクラス名が違う

`Main.java` に次のように書くとエラーになります。

```java
public class App {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```

`public class App` にするなら、ファイル名は `App.java` にします。

### 大文字と小文字を間違える

Javaは大文字と小文字を区別します。

```java
system.out.println("Hello");
```

これは動きません。正しくは `System` です。

## コメント

コードの中に説明を書く場合は、コメントを使います。

```java
public class Main {
    public static void main(String[] args) {
        // 画面に文字を出力する
        System.out.println("Hello, Java!");
    }
}
```

複数行のコメントは次のように書きます。

```java
/*
  ここは複数行コメントです。
  実行されません。
*/
```

コメントは便利ですが、コードを読めばわかる内容を毎回書く必要はありません。処理の意図や注意点を書くために使います。
