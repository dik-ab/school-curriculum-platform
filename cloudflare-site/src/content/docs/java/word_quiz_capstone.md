---
title: "Java総合演習: 英単語クイズ"
section_key: java
section_title: Java基礎
nav_order: 19
description: 要件定義、基本設計、テスト仕様をもとに、英単語登録とクイズ機能を持つ小さなJavaアプリを作ります。
---

# Java総合演習: 英単語クイズ

このページは、Java基礎の総合演習です。

ローカル教材の `java/integrate1` にある要件定義、基本設計、テスト仕様をもとに、英単語を登録してクイズできるコンソールアプリを作ります。

この演習で使う内容です。

- 配列または `List`
- クラス分割
- `Scanner` による入力
- 条件分岐と繰り返し
- 入力チェック
- 例外を起こしにくい設計
- テスト観点の整理

> 実務では、いきなりコードを書き始めるのではなく、要件、設計、テスト観点を読んでから実装します。この演習は、その流れを小さく体験するためのものです。

## 要件

作るものは、英単語学習用のコンソールアプリです。

必須機能です。

- 英単語を登録できる
- 日本語訳を登録できる
- 登録できる単語は最大20個
- 登録した単語でクイズできる
- 正解数を表示できる
- メニューから登録、クイズ、終了を選べる

表示例です。

```text
1: 単語を登録する
2: クイズを受ける
3: 終了する
```

## 最初の設計

最初は、次の3つのクラスに分けます。

| クラス | 役割 |
| --- | --- |
| `Word` | 英単語と日本語訳を持つ |
| `WordBook` | 単語一覧を管理する |
| `Main` | メニュー表示と入力受付を担当する |

Spring Bootに進むと、Controller、Service、Repositoryのように責務を分けます。この演習でも、1つの `Main` に全部書かず、役割で分ける練習をします。

## Wordクラス

```java
public class Word {
    private final String english;
    private final String japanese;

    public Word(String english, String japanese) {
        this.english = english;
        this.japanese = japanese;
    }

    public String getEnglish() {
        return english;
    }

    public boolean isCorrect(String answer) {
        return japanese.equals(answer);
    }
}
```

コードの意味です。

- `Word` は、英単語と日本語訳の組み合わせです。
- `english` は、出題する英単語です。
- `japanese` は、正解となる日本語訳です。
- コンストラクタで、英単語と日本語訳を受け取ります。
- `getEnglish` は、クイズ出題用に英単語を返します。
- `isCorrect` は、受講生の答えが日本語訳と一致するか判定します。

## WordBookクラス

```java
import java.util.ArrayList;
import java.util.List;

public class WordBook {
    private static final int MAX_WORDS = 20;
    private final List<Word> words = new ArrayList<>();

    public void add(String english, String japanese) {
        if (words.size() >= MAX_WORDS) {
            throw new IllegalStateException("登録できる単語は20個までです");
        }
        words.add(new Word(english, japanese));
    }

    public List<Word> getWords() {
        return words;
    }

    public boolean isEmpty() {
        return words.isEmpty();
    }
}
```

コードの意味です。

- `MAX_WORDS` は、登録できる最大件数です。
- `words` は、登録済みの単語一覧です。
- `add` は、英単語と日本語訳を登録します。
- `words.size() >= MAX_WORDS` で、20個を超えないようにします。
- 上限を超えた場合は `IllegalStateException` を投げます。
- `getWords` は、クイズ出題用に単語一覧を返します。
- `isEmpty` は、単語が1つもないかを返します。

## Mainクラス

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        WordBook wordBook = new WordBook();

        while (true) {
            System.out.println("1: 単語を登録する");
            System.out.println("2: クイズを受ける");
            System.out.println("3: 終了する");

            String menu = scanner.nextLine();

            if (menu.equals("1")) {
                registerWord(scanner, wordBook);
            } else if (menu.equals("2")) {
                startQuiz(scanner, wordBook);
            } else if (menu.equals("3")) {
                break;
            } else {
                System.out.println("1-3の数字を入力してください");
            }
        }
    }
}
```

コードの意味です。

- `Scanner` は、コンソール入力を受け取るために使います。
- `WordBook` は、単語一覧を管理します。
- `while (true)` は、終了が選ばれるまでメニューを表示し続けます。
- `scanner.nextLine()` は、入力された1行を読み取ります。
- `"1"` の場合は、単語登録に進みます。
- `"2"` の場合は、クイズに進みます。
- `"3"` の場合は、`break` でループを終了します。
- それ以外は、エラーメッセージを表示します。

## 登録処理

```java
private static void registerWord(Scanner scanner, WordBook wordBook) {
    System.out.println("英単語を入力してください:");
    String english = scanner.nextLine();

    System.out.println("日本語訳を入力してください:");
    String japanese = scanner.nextLine();

    try {
        wordBook.add(english, japanese);
        System.out.println("登録しました");
    } catch (IllegalStateException e) {
        System.out.println(e.getMessage());
    }
}
```

コードの意味です。

- `registerWord` は、単語登録だけを担当するメソッドです。
- `english` に英単語を読み込みます。
- `japanese` に日本語訳を読み込みます。
- `wordBook.add` で単語を登録します。
- 登録上限を超えた場合は、例外メッセージを表示します。

## クイズ処理

```java
private static void startQuiz(Scanner scanner, WordBook wordBook) {
    if (wordBook.isEmpty()) {
        System.out.println("単語が登録されていません");
        return;
    }

    int correctCount = 0;

    for (Word word : wordBook.getWords()) {
        System.out.println(word.getEnglish() + "の意味は？");
        String answer = scanner.nextLine();

        if (word.isCorrect(answer)) {
            System.out.println("正解です！");
            correctCount++;
        } else {
            System.out.println("不正解です");
        }
    }

    System.out.println("クイズ終了！");
    System.out.println(wordBook.getWords().size() + "問中" + correctCount + "問正解でした！");
}
```

コードの意味です。

- 単語がない場合は、メッセージを表示して終了します。
- `correctCount` は、正解数を数える変数です。
- `for` 文で、登録済み単語を順番に出題します。
- `word.getEnglish()` で英単語を表示します。
- `scanner.nextLine()` で解答を受け取ります。
- `word.isCorrect(answer)` で正誤判定します。
- 正解なら `correctCount++` で正解数を増やします。
- 最後に、何問中何問正解かを表示します。

## テスト観点

実装できたら、次を確認します。

| No | 観点 | 入力 | 期待結果 |
| --- | --- | --- | --- |
| 1 | 単語登録 | `apple`、`りんご` | 登録できる |
| 2 | 正解判定 | `apple` に `りんご` と答える | 正解になる |
| 3 | 不正解判定 | `apple` に `みかん` と答える | 不正解になる |
| 4 | 未登録でクイズ | 単語登録前にクイズ | `単語が登録されていません` |
| 5 | 無効メニュー | `4` や `a` | `1-3の数字を入力してください` |
| 6 | 21個目の登録 | 20個登録後に追加 | 上限エラー |

## 発展課題

- `String#isBlank()` を使って、空文字の登録を防ぐ
- `WordBook#getWords()` が直接変更されないようにする
- `WordService` を作り、登録とクイズのロジックを `Main` からさらに分離する
- JUnitで `Word#isCorrect` と `WordBook#add` をテストする

## まとめ

この演習では、要件、設計、実装、テスト観点をつなげました。

小さなコンソールアプリでも、クラス分割、入力チェック、例外処理、テスト観点は必要です。この流れは、Spring BootでWebアプリを作るときにもそのまま使います。
