---
title: Java基礎
section_key: java
section_title: Java基礎
nav_order: 0
description: Javaの使われる場所、開発環境、基本文法、オブジェクト指向、実用型、テスト、Spring Bootへの橋渡し、応用編まで学びます。
---

# Java基礎

Javaは、業務システム、Webアプリケーション、Android、バッチ処理、大規模な社内システムで長く使われている言語です。特に日本の受託開発、SIer、金融、行政、基幹システムでは、JavaとSpring Bootの組み合わせが今でもよく使われます。

このカリキュラムでは、Spring Bootに入る前に必要になるJavaそのものの基礎を学びます。JavaはTypeScriptやPythonよりも書く量が多く感じますが、その分「型」「クラス」「責務分離」「例外」「コレクション」「テスト」の考え方を丁寧に身につけやすい言語です。

## このコースのゴール

このコースのゴールは、Javaで小さなプログラムを書き、クラスを分け、データを扱い、エラーに対応できる状態になることです。

Spring Bootを学ぶと、Controller、Service、Repository、Entity、DTOなどのクラスが出てきます。これらを理解するには、先にJavaの文法とオブジェクト指向の考え方を押さえておく必要があります。

## 身につくこと

- Javaがどこで使われるかを説明できる
- JDK、JRE、JVM、IDEの役割を説明できる
- `javac` と `java` の関係を理解できる
- Mavenの標準的なプロジェクト構成を読める
- 変数、型、演算子、条件分岐、繰り返しを書ける
- `enum`、`BigDecimal`、`LocalDate` など実務でよく使う型を理解できる
- 配列、メソッド、オーバーロードを使える
- クラス、インスタンス、フィールド、コンストラクタを理解できる
- `private`、getter/setter、パッケージで責務を整理できる
- 継承、抽象クラス、インターフェース、多態性の違いを説明できる
- `List`、`Set`、`Map` を使い分けられる
- 例外処理で落ちにくいプログラムを書ける
- JUnitの入口、スタックトレース、デバッグの基本を説明できる
- Controller、Service、Repository、DTO、Entityの役割をJavaクラスとして理解できる
- ラムダ式、Stream、Optional、recordの入口を理解できる

## 学習順

1. [Javaの使われるところと環境構築](/java/environment/)
2. [Hello Worldと実行の流れ](/java/hello_world/)
3. [プロジェクト構成とMaven](/java/project_structure_and_maven/)
4. [変数と基本型](/java/variables_and_types/)
5. [演算子と文字列](/java/operators_and_strings/)
6. [実務で使う型](/java/practical_types/)
7. [条件分岐と繰り返し](/java/control_flow/)
8. [配列](/java/arrays/)
9. [メソッド](/java/methods/)
10. [クラスとオブジェクト](/java/classes_and_objects/)
11. [カプセル化とパッケージ](/java/encapsulation_and_packages/)
12. [継承、抽象クラス、インターフェース](/java/inheritance_and_interfaces/)
13. [コレクション](/java/collections/)
14. [例外処理](/java/exceptions/)
15. [モダンJavaの入口](/java/modern_java/)
16. [テストとデバッグの入口](/java/testing_and_debugging/)
17. [Spring Bootに進む前の橋渡し](/java/spring_boot_bridge/)
18. [Java基礎演習](/java/practice/)
19. [Java総合演習: 英単語クイズ](/java/word_quiz_capstone/)
20. [Java応用: 知っておくと強い言語機能](/java/advanced/)

## 基礎編と応用編の線引き

基礎編では、Spring Bootの普通の開発で早い段階から出会う内容を扱います。クラス、メソッド、コレクション、例外、DTO、Service分割、テストは、Webエンジニアとして避けて通りにくい内容です。

応用編では、知らなくても開発は始められるものの、知っておくとライブラリのコードを読みやすくなったり、設計判断がしやすくなったりする内容を扱います。Genericsの深掘り、enum設計、アノテーション、リフレクション、並行処理、JVMの入口などです。

## 学習環境の考え方

このカリキュラム全体ではVS Codeを中心に進めています。ただしJavaに関しては、Eclipseも使えるようにしておく価値があります。

EclipseはJavaの補完、実行、デバッグ、プロジェクト管理がまとまっており、Java初学者が「どのクラスがどこで動いているか」を確認しやすいです。特にブレークポイントを置いて1行ずつ動きを追う練習には向いています。

一方で、実務ではIntelliJ IDEA、VS Code、Eclipseのどれも使われます。重要なのはIDEそのものではなく、JDKを入れ、Javaファイルを書き、コンパイルし、実行し、エラーを読めることです。

## 参考にした構成

このJava基礎は、手元にある既存Java教材PDFの章立てと、外部のJava学習サイトの構成を確認したうえで、このスクール用に再構成しています。特にPDF側に多く含まれている、テスト、デバッグ、Spring Boot前の責務分離、チーム開発に進む前の読み方を、Webエンジニア向けに段階化しています。外部サイトの本文や画像はコピーせず、必要な概念をこの教材用に書き直しています。

- [一週間で身につくJava言語の基本](https://java.sevendays-study.com/)
- [Dev.java Learn Java](https://dev.java/learn/)
- [Oracle JDK 21 Documentation](https://docs.oracle.com/en/java/javase/21/)
- [Eclipse IDE](https://eclipseide.org/)
- [Eclipse Temurin JDK](https://adoptium.net/temurin/releases/)
