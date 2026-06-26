---
title: Javaの使われるところと環境構築
section_key: java
section_title: Java基礎
nav_order: 1
description: Javaの用途、JDK/JRE/JVMの違い、EclipseとVS Codeの使い分け、最初に入れる環境を整理します。
---

# Javaの使われるところと環境構築

Javaは、長く使われている汎用プログラミング言語です。Webアプリ、業務システム、バッチ処理、Android、データ連携、金融や行政のシステムなど、安定性と保守性が重視される領域で多く使われています。

## Javaが使われるところ

代表的な使われ方は次の通りです。

- Webアプリケーション: Spring Boot、Spring MVC
- 業務システム: 社内管理画面、申請システム、販売管理、在庫管理
- バッチ処理: 夜間集計、CSV取り込み、メール送信、データ同期
- Androidアプリ: Kotlinが主流になっていますが、Javaの知識も役立ちます
- 大規模システム: 型、パッケージ、クラス分割により、チーム開発しやすい

Javaは「少し書く量が多い言語」です。しかし、書く量が多いぶん、どのデータをどのクラスが扱うのかが明確になりやすいです。Spring Bootに進むと、この特徴がそのまま設計の理解につながります。

## JDK、JRE、JVM

Javaの環境構築では、似た言葉が出てきます。

| 用語 | 役割 |
| --- | --- |
| JVM | Javaのプログラムを動かす仮想マシン |
| JRE | Javaを実行するための環境 |
| JDK | Javaを開発するための環境。コンパイラや開発ツールを含む |

学習者が入れるべきものは **JDK** です。JDKを入れると、Javaファイルをコンパイルする `javac` と、コンパイル後のプログラムを実行する `java` コマンドが使えるようになります。

## 推奨バージョン

このカリキュラムでは、LTS版のJavaを使います。迷ったらJava 21 LTSを入れてください。

JDKは次のような配布元から入れられます。

- [Eclipse Temurin JDK](https://adoptium.net/temurin/releases/)
- [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

どちらでも学習はできます。無料で始めやすく、実務でも使われることが多い選択肢として、Eclipse Temurinを推奨します。

## IDEは何を使うべきか

Javaでは、IDEの補助がかなり重要です。候補は主に3つです。

| IDE | 特徴 |
| --- | --- |
| Eclipse | Java学習で使いやすい。デバッグとプロジェクト管理が強い |
| IntelliJ IDEA | 実務でも人気。補完とリファクタリングが強い |
| VS Code | 軽い。カリキュラム全体で使いやすい |

Javaを初めて学ぶなら、Eclipseを入れておくのはかなり良いです。Javaはクラス、パッケージ、メソッドの関係を追う場面が多く、Eclipseのデバッグ機能で1行ずつ確認すると理解しやすいからです。

ただし、このカリキュラムではコマンドラインでも実行できるように進めます。IDEに依存しすぎると、裏側で何が起きているかわからなくなるためです。

## MacでJDKを確認する

ターミナルで次を実行します。

```bash
java -version
javac -version
```

両方ともバージョンが表示されれば、Javaの開発環境が使えます。

Homebrewを使う場合は、次のように入れられます。

```bash
brew install --cask temurin@21
```

インストール後にターミナルを開き直して、もう一度確認します。

```bash
java -version
javac -version
```

## WindowsでJDKを確認する

PowerShellで次を実行します。

```powershell
java -version
javac -version
```

バージョンが表示されない場合は、JDKのインストール、または環境変数 `PATH` の設定ができていない可能性があります。

Windowsでは、Eclipse Temurinのインストーラーを使うと設定しやすいです。

## Eclipseを入れる場合

Eclipseを使う場合は、公式サイトから `Eclipse IDE for Java Developers` を選びます。

- [Eclipse IDE](https://eclipseide.org/)
- [Eclipse IDE Packages](https://www.eclipse.org/downloads/packages/)

最初は次の流れだけできれば十分です。

1. Eclipseを起動する
2. workspaceを選ぶ
3. Java Projectを作る
4. `src` の中にクラスを作る
5. `main` メソッドを書いて実行する
6. ブレークポイントを置いてデバッグ実行する

## 最初に作るフォルダ

この教材では、次のような作業フォルダを作って進めます。

```bash
mkdir -p ~/school/java-basic
cd ~/school/java-basic
```

Javaファイルは1つずつ作りながら確認します。

```bash
touch Main.java
```

次のレッスンで、最初のJavaプログラムを書きます。
