---
title: JavaScript基礎解説
parent: フロントエンド基礎
nav_order: 3
---

# JavaScript基礎解説

外部リンクで学ぶのも良いですが、ここでは基本的なJavaScriptの文法をしっかり解説します。このページを読めば、JavaScriptの基礎が一通り理解できます。

**注意：** このページだけで完璧に理解する必要はありません。「こういうものがあるんだな」という知識を持っておくことが大切です。詳しくは、[JavaScript入門（Zenn）](https://zenn.dev/ojk/books/intro-to-javascript/viewer/js-basic)などの外部教材も併せて学習してください。

## JavaScriptの実行環境を準備

JavaScriptを試すには、以下の2つの方法があります。

### 方法1：ブラウザのコンソール（手軽）

1. Google Chromeを開く
2. 右クリック → 「検証」をクリック
3. 「Console」タブを開く
4. JavaScriptのコードを入力して Enter で実行

### 方法2：HTMLファイルを作成（本格的）

**index.html**を作成：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>JavaScript練習</title>
</head>
<body>
  <h1>JavaScriptの練習</h1>

  <script>
    // ここにJavaScriptを書く
    console.log("Hello, JavaScript!");
  </script>
</body>
</html>
```

このファイルをブラウザで開き、コンソールを開けば結果が表示されます。

## 変数：データを保存する

変数は、データを入れる「箱」のようなものです。

### let - 変更可能な変数

```javascript
let name = "太郎";
console.log(name);  // "太郎"

name = "花子";  // 変更できる
console.log(name);  // "花子"
```

### const - 変更不可の変数（定数）

```javascript
const age = 25;
console.log(age);  // 25

age = 30;  // エラー！ constは変更できない
```

**使い分け：**
- 基本的には`const`を使う
- 後で値を変更する必要がある場合のみ`let`を使う

### var は使わない

古い書き方として`var`もありますが、現代のJavaScriptでは使いません。`let`と`const`を使いましょう。

## データ型：データの種類

JavaScriptには、いくつかのデータ型があります。

### 文字列（string）

```javascript
const greeting = "こんにちは";
const name = "太郎";
const message = "私の名前は" + name + "です";  // 文字列の連結

console.log(message);  // "私の名前は太郎です"
```

**テンプレートリテラル（便利！）：**

```javascript
const name = "太郎";
const age = 25;
const message = `私の名前は${name}で、${age}歳です。`;

console.log(message);  // "私の名前は太郎で、25歳です。"
```

### 数値（number）

```javascript
const price = 1000;
const tax = 100;
const total = price + tax;

console.log(total);  // 1100
```

**算術演算子：**

```javascript
const a = 10;
const b = 3;

console.log(a + b);  // 13（足し算）
console.log(a - b);  // 7（引き算）
console.log(a * b);  // 30（掛け算）
console.log(a / b);  // 3.333...（割り算）
console.log(a % b);  // 1（余り）
```

### 真偽値（boolean）

`true`（真）または`false`（偽）の2つの値しかありません。

```javascript
const isStudent = true;
const hasLicense = false;

console.log(isStudent);  // true
console.log(hasLicense);  // false
```

### 配列（array）

複数の値をまとめて扱います。

```javascript
const fruits = ["りんご", "バナナ", "オレンジ"];

console.log(fruits[0]);  // "りんご"（最初の要素）
console.log(fruits[1]);  // "バナナ"（2番目の要素）
console.log(fruits[2]);  // "オレンジ"（3番目の要素）
```

**注意：** 配列のインデックス（番号）は0から始まります。

**配列の操作：**

```javascript
const numbers = [1, 2, 3];

// 要素を追加
numbers.push(4);
console.log(numbers);  // [1, 2, 3, 4]

// 要素の数を取得
console.log(numbers.length);  // 4
```

### オブジェクト（object）

複数のデータをまとめて、名前をつけて管理します。

```javascript
const user = {
  name: "太郎",
  age: 25,
  isStudent: true
};

console.log(user.name);      // "太郎"
console.log(user.age);       // 25
console.log(user.isStudent); // true
```

**ドット記法とブラケット記法：**

```javascript
const user = { name: "太郎", age: 25 };

// ドット記法
console.log(user.name);  // "太郎"

// ブラケット記法
console.log(user["name"]);  // "太郎"
```

## 条件分岐：条件によって処理を変える

### if文

```javascript
const age = 20;

if (age >= 18) {
  console.log("成人です");
}
```

**出力：**
```
成人です
```

### if-else文

```javascript
const age = 15;

if (age >= 18) {
  console.log("成人です");
} else {
  console.log("未成年です");
}
```

**出力：**
```
未成年です
```

### if-else if-else文

```javascript
const score = 85;

if (score >= 90) {
  console.log("優");
} else if (score >= 80) {
  console.log("良");
} else if (score >= 70) {
  console.log("可");
} else {
  console.log("不可");
}
```

**出力：**
```
良
```

### 比較演算子

```javascript
const a = 10;
const b = 5;

console.log(a > b);   // true（aはbより大きい）
console.log(a < b);   // false（aはbより小さい）
console.log(a >= 10); // true（aは10以上）
console.log(a <= 5);  // false（aは5以下）
console.log(a === 10); // true（aは10と等しい）
console.log(a !== 5);  // true（aは5と等しくない）
```

**注意：** 等価比較には`===`を使います。`==`は使わないようにしましょう（型変換が起こり、予期しない結果になることがあります）。

### 論理演算子

```javascript
const age = 25;
const hasLicense = true;

// &&（かつ）: 両方ともtrueの場合にtrue
if (age >= 18 && hasLicense) {
  console.log("運転できます");
}

// ||（または）: どちらかがtrueの場合にtrue
const isWeekend = false;
const isHoliday = true;

if (isWeekend || isHoliday) {
  console.log("お休みです");
}

// !（否定）: trueとfalseを反転
const isRaining = false;

if (!isRaining) {
  console.log("傘は不要です");
}
```

## 繰り返し：同じ処理を何度も実行する

### for文

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

**出力：**
```
0
1
2
3
4
```

**説明：**
- `let i = 0`：変数`i`を0で初期化
- `i < 5`：iが5未満の間、繰り返す
- `i++`：1回ループするたびに、iを1増やす

### 配列の繰り返し（for...of）

```javascript
const fruits = ["りんご", "バナナ", "オレンジ"];

for (let fruit of fruits) {
  console.log(fruit);
}
```

**出力：**
```
りんご
バナナ
オレンジ
```

### while文

```javascript
let count = 0;

while (count < 3) {
  console.log(count);
  count++;
}
```

**出力：**
```
0
1
2
```

## 関数：処理をまとめて再利用する

関数は、一連の処理をまとめて、名前をつけたものです。

### 関数の定義

```javascript
function greet(name) {
  console.log("こんにちは、" + name + "さん！");
}

greet("太郎");  // "こんにちは、太郎さん！"
greet("花子");  // "こんにちは、花子さん！"
```

### 返り値

関数は、処理結果を返すことができます。

```javascript
function add(a, b) {
  return a + b;
}

const result = add(5, 3);
console.log(result);  // 8
```

### アロー関数（応用）

より短く関数を書く方法です。

```javascript
// 通常の関数
function add(a, b) {
  return a + b;
}

// アロー関数
const add = (a, b) => {
  return a + b;
};

// さらに短く（処理が1行の場合）
const add = (a, b) => a + b;

console.log(add(5, 3));  // 8
```

## DOM操作：HTMLを操作する

JavaScriptの最大の特徴は、HTMLを動的に操作できることです。

### 要素を取得する

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>DOM操作</title>
</head>
<body>
  <h1 id="title">タイトル</h1>
  <p class="text">これは段落です。</p>

  <script>
    // IDで取得
    const title = document.getElementById("title");
    console.log(title);

    // クラス名で取得
    const text = document.querySelector(".text");
    console.log(text);
  </script>
</body>
</html>
```

### 要素の内容を変更する

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>DOM操作</title>
</head>
<body>
  <h1 id="title">元のタイトル</h1>

  <script>
    const title = document.getElementById("title");
    title.textContent = "新しいタイトル";  // 内容を変更
  </script>
</body>
</html>
```

ページを開くと、「新しいタイトル」が表示されます。

### ボタンをクリックしたら処理を実行

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>クリックイベント</title>
</head>
<body>
  <button id="myButton">クリックしてください</button>
  <p id="message"></p>

  <script>
    const button = document.getElementById("myButton");
    const message = document.getElementById("message");

    button.addEventListener("click", function() {
      message.textContent = "ボタンがクリックされました！";
    });
  </script>
</body>
</html>
```

ボタンをクリックすると、メッセージが表示されます。

### スタイルを変更する

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>スタイル変更</title>
</head>
<body>
  <h1 id="title">タイトル</h1>
  <button id="changeColor">色を変える</button>

  <script>
    const title = document.getElementById("title");
    const button = document.getElementById("changeColor");

    button.addEventListener("click", function() {
      title.style.color = "red";  // 文字色を赤に変更
    });
  </script>
</body>
</html>
```

## 実践例：カウンターアプリ

ここまでの知識を組み合わせて、簡単なカウンターアプリを作ってみましょう。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>カウンターアプリ</title>
  <style>
    body {
      text-align: center;
      font-family: Arial, sans-serif;
      padding: 50px;
    }
    #count {
      font-size: 48px;
      margin: 20px 0;
    }
    button {
      font-size: 18px;
      padding: 10px 20px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>カウンターアプリ</h1>
  <div id="count">0</div>
  <button id="increment">+1</button>
  <button id="decrement">-1</button>
  <button id="reset">リセット</button>

  <script>
    let count = 0;
    const countDisplay = document.getElementById("count");
    const incrementButton = document.getElementById("increment");
    const decrementButton = document.getElementById("decrement");
    const resetButton = document.getElementById("reset");

    incrementButton.addEventListener("click", function() {
      count++;
      countDisplay.textContent = count;
    });

    decrementButton.addEventListener("click", function() {
      count--;
      countDisplay.textContent = count;
    });

    resetButton.addEventListener("click", function() {
      count = 0;
      countDisplay.textContent = count;
    });
  </script>
</body>
</html>
```

**動作：**
- 「+1」ボタンをクリックすると、カウントが1増える
- 「-1」ボタンをクリックすると、カウントが1減る
- 「リセット」ボタンをクリックすると、カウントが0に戻る

## さらに学ぶには

このページで基礎を理解したら、以下の教材でさらに深く学びましょう：

- **[JavaScript入門（Zenn）](https://zenn.dev/ojk/books/intro-to-javascript/viewer/js-basic)** - より詳しい解説と豊富な例
- **[MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript)** - 公式リファレンス

## まとめ

- **変数**：`let`（変更可能）、`const`（変更不可）
- **データ型**：文字列、数値、真偽値、配列、オブジェクト
- **条件分岐**：`if`、`else if`、`else`
- **繰り返し**：`for`、`while`、`for...of`
- **関数**：処理をまとめて再利用
- **DOM操作**：JavaScriptでHTMLを動的に操作

これらの基礎を理解すれば、JavaScriptの大部分が理解できます。次は、実際に手を動かして練習問題に取り組んでみましょう！
