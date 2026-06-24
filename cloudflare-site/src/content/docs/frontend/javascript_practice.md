---
title: JavaScript 練習問題
parent: フロントエンド基礎
nav_order: 5
---

# JavaScript 練習問題

JavaScriptの基礎を学んだら、実際に手を動かして練習してみましょう。段階的に難易度が上がる練習問題を用意しています。

**重要：** 練習問題は解いても解かなくても構いませんが、**解いた方が理解が深まります**。実際にコードを書くことで、プログラミングのスキルが身につきます。

わからないことがあれば、**遠慮なく質問を投げてみてください！**

## 練習問題の進め方

### 1. フォルダを作成

```bash
mkdir javascript-practice
cd javascript-practice
```

### 2. 問題ごとにフォルダを分ける

```
javascript-practice/
├── exercise01/
│   └── index.html
├── exercise02/
│   └── index.html
...
```

### 3. 基本的なHTMLテンプレート

各問題で使用する基本テンプレート：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise</title>
</head>
<body>
  <h1>JavaScript練習</h1>

  <script>
    // ここにJavaScriptを書く
  </script>
</body>
</html>
```

### 4. 動作確認

- Live Previewで開く
- ブラウザのコンソール（F12 → Console）で結果を確認

## 問題1：変数と計算

変数を使って、簡単な計算を行い、結果をコンソールに表示してください。

**要件：**
- 変数`price`に商品の価格（1000円）を代入
- 変数`quantity`に数量（3個）を代入
- 合計金額を計算して、コンソールに「合計：○○円」と表示

**フォルダ構成：**
```
exercise01/
└── index.html
```

**ヒント：**
- `const`または`let`を使って変数を宣言
- `console.log()`で結果を表示
- テンプレートリテラル（`` `文字列${変数}` ``）を使うと便利

**動作確認方法：**
1. `index.html`をブラウザで開く
2. F12キーを押してコンソールを開く
3. 「合計：3000円」と表示されているか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise01/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 1</title>
</head>
<body>
  <h1>JavaScript練習 - 問題1</h1>

  <script>
    const price = 1000;
    const quantity = 3;
    const total = price * quantity;

    console.log(`合計：${total}円`);
  </script>
</body>
</html>
```

## 問題2：条件分岐

年齢を受け取り、成人かどうかを判定して表示してください。

**要件：**
- 変数`age`に年齢を代入
- 18歳以上なら「成人です」、未満なら「未成年です」とコンソールに表示

**フォルダ構成：**
```
exercise02/
└── index.html
```

**ヒント：**
- `if`文と`else`文を使用
- 比較演算子`>=`を使う

**動作確認方法：**
1. ブラウザで開いてコンソールを確認
2. `age`の値を変更して、表示が変わるか試してみる

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise02/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 2</title>
</head>
<body>
  <h1>JavaScript練習 - 問題2</h1>

  <script>
    const age = 20;

    if (age >= 18) {
      console.log("成人です");
    } else {
      console.log("未成年です");
    }
  </script>
</body>
</html>
```

## 問題3：配列と繰り返し

配列に入った数値の合計を計算してください。

**要件：**
- 配列`numbers`に複数の数値を格納
- `for`ループを使って配列の全ての数値を合計
- 結果をコンソールに表示

**フォルダ構成：**
```
exercise03/
└── index.html
```

**ヒント：**
- `for...of`ループを使うと簡単
- 合計用の変数を用意し、ループの中で加算していく

**動作確認方法：**
1. ブラウザで開いてコンソールを確認
2. 配列の値を変更して、合計が正しく計算されるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise03/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 3</title>
</head>
<body>
  <h1>JavaScript練習 - 問題3</h1>

  <script>
    const numbers = [10, 20, 30, 40, 50];
    let sum = 0;

    for (let num of numbers) {
      sum += num;
    }

    console.log(`合計：${sum}`);
  </script>
</body>
</html>
```

## 問題4：関数を作成

名前を受け取り、挨拶文を返す関数を作成してください。

**要件：**
- 関数名：`greet`
- 引数：`name`（名前）
- 返り値：「こんにちは、○○さん！」という文字列
- 関数を呼び出して、結果をコンソールに表示

**フォルダ構成：**
```
exercise04/
└── index.html
```

**ヒント：**
- `function`キーワードで関数を定義
- `return`で値を返す
- テンプレートリテラルを使うと便利

**動作確認方法：**
1. ブラウザで開いてコンソールを確認
2. 異なる名前で関数を呼び出してみる

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise04/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 4</title>
</head>
<body>
  <h1>JavaScript練習 - 問題4</h1>

  <script>
    function greet(name) {
      return `こんにちは、${name}さん！`;
    }

    console.log(greet("太郎"));
    console.log(greet("花子"));
  </script>
</body>
</html>
```

## 問題5：ボタンクリックで文字を変更

ボタンをクリックしたら、画面上の文字が変わるプログラムを作成してください。

**要件：**
- ボタンを1つ配置
- `<p>`タグで初期テキストを表示
- ボタンをクリックしたら、テキストが変わる

**フォルダ構成：**
```
exercise05/
└── index.html
```

**ヒント：**
- `document.getElementById()`で要素を取得
- `addEventListener("click", function() { ... })`でクリックイベントを設定
- `textContent`プロパティでテキストを変更

**動作確認方法：**
1. ブラウザで開く
2. ボタンをクリックして、テキストが変わるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise05/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 5</title>
</head>
<body>
  <h1>JavaScript練習 - 問題5</h1>
  <p id="message">元のテキスト</p>
  <button id="changeButton">クリックしてください</button>

  <script>
    const message = document.getElementById("message");
    const button = document.getElementById("changeButton");

    button.addEventListener("click", function() {
      message.textContent = "テキストが変わりました！";
    });
  </script>
</body>
</html>
```

## 問題6：入力値を取得して表示

入力欄に名前を入力し、ボタンをクリックしたら挨拶を表示するプログラムを作成してください。

**要件：**
- テキスト入力欄を配置
- ボタンを配置
- ボタンをクリックしたら、入力された名前で挨拶を表示

**フォルダ構成：**
```
exercise06/
└── index.html
```

**ヒント：**
- `<input type="text" id="nameInput">`で入力欄を作成
- `document.getElementById("nameInput").value`で入力値を取得

**動作確認方法：**
1. ブラウザで開く
2. 名前を入力してボタンをクリック
3. 挨拶が表示されるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise06/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 6</title>
</head>
<body>
  <h1>JavaScript練習 - 問題6</h1>
  <input type="text" id="nameInput" placeholder="名前を入力してください">
  <button id="greetButton">挨拶する</button>
  <p id="greeting"></p>

  <script>
    const nameInput = document.getElementById("nameInput");
    const greetButton = document.getElementById("greetButton");
    const greeting = document.getElementById("greeting");

    greetButton.addEventListener("click", function() {
      const name = nameInput.value;
      greeting.textContent = `こんにちは、${name}さん！`;
    });
  </script>
</body>
</html>
```

## 問題7：TODOリストを作成

タスクを追加できる簡単なTODOリストを作成してください。

**要件：**
- テキスト入力欄（タスク入力用）
- 追加ボタン
- タスクのリスト（`<ul>`）
- ボタンをクリックしたら、入力されたタスクをリストに追加

**フォルダ構成：**
```
exercise07/
└── index.html
```

**ヒント：**
- `document.createElement("li")`で新しいリスト項目を作成
- `appendChild()`で要素を追加
- 入力後、入力欄を空にする（`input.value = ""`）

**動作確認方法：**
1. ブラウザで開く
2. タスクを入力して追加ボタンをクリック
3. リストにタスクが追加されるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise07/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 7 - TODOリスト</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    input {
      padding: 10px;
      font-size: 16px;
      width: 300px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    ul {
      list-style: none;
      padding: 0;
      margin-top: 20px;
    }
    li {
      background-color: #f0f0f0;
      padding: 10px;
      margin-bottom: 5px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>TODOリスト</h1>
  <input type="text" id="taskInput" placeholder="タスクを入力してください">
  <button id="addButton">追加</button>
  <ul id="taskList"></ul>

  <script>
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");

    addButton.addEventListener("click", function() {
      const taskText = taskInput.value;

      if (taskText === "") {
        alert("タスクを入力してください");
        return;
      }

      const li = document.createElement("li");
      li.textContent = taskText;
      taskList.appendChild(li);

      taskInput.value = "";
    });
  </script>
</body>
</html>
```

## 問題8：簡単なクイズアプリ

3択クイズを作成してください。

**要件：**
- 問題文を表示
- 3つの選択肢ボタンを配置
- 正解のボタンをクリックしたら「正解！」、不正解なら「不正解」と表示

**フォルダ構成：**
```
exercise08/
└── index.html
```

**ヒント：**
- 3つのボタンにそれぞれイベントリスナーを設定
- 正解・不正解の判定をして、結果を表示

**動作確認方法：**
1. ブラウザで開く
2. 各選択肢をクリックして、正しく判定されるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/exercise08/`にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Exercise 8 - クイズアプリ</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      text-align: center;
    }
    button {
      display: block;
      width: 300px;
      margin: 10px auto;
      padding: 15px;
      font-size: 16px;
      cursor: pointer;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:hover {
      background-color: #45a049;
    }
    #result {
      margin-top: 20px;
      font-size: 24px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>クイズアプリ</h1>
  <p>JavaScriptはどの種類の言語ですか？</p>
  <button id="choice1">コンパイル言語</button>
  <button id="choice2">インタプリタ言語</button>
  <button id="choice3">マークアップ言語</button>
  <p id="result"></p>

  <script>
    const choice1 = document.getElementById("choice1");
    const choice2 = document.getElementById("choice2");
    const choice3 = document.getElementById("choice3");
    const result = document.getElementById("result");

    choice1.addEventListener("click", function() {
      result.textContent = "不正解";
      result.style.color = "red";
    });

    choice2.addEventListener("click", function() {
      result.textContent = "正解！";
      result.style.color = "green";
    });

    choice3.addEventListener("click", function() {
      result.textContent = "不正解";
      result.style.color = "red";
    });
  </script>
</body>
</html>
```

## おめでとうございます！

JavaScriptの基本的な練習問題を完了しました！これらの問題を通して：

- 変数と計算
- 条件分岐と繰り返し
- 関数の定義と使用
- DOM操作の基礎
- イベント処理
- 実践的なアプリケーション

を学びました。

## 次のステップ

- **TypeScript基礎**に進んで、型を使ったより安全なコードを書く
- **入門編最終問題**に挑戦して、HTML/CSS/JavaScriptを総合的に使う
- 自分でオリジナルのアプリを作ってみる

わからないことがあれば、遠慮なく質問してください！

## 回答コードについて

全ての練習問題の回答コードは、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/javascript/`ディレクトリに用意しています。

リポジトリをクローンして、ローカルで動作確認できます：

```bash
git clone https://github.com/dik-ab/curriculum.git
cd curriculum/practice/javascript/exercise01
```

そして、`index.html`をブラウザで開いて確認してください。
