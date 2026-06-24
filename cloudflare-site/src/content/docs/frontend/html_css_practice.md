---
title: HTML/CSS 練習問題
parent: フロントエンド基礎
nav_order: 4
---

# HTML/CSS 練習問題

HTML/CSSの基礎を学んだら、実際に手を動かして練習してみましょう。ここでは基本的な練習問題を用意しています。

**重要：** 練習問題は解いても解かなくても構いませんが、**解いた方が理解が深まります**。実際に手を動かすことで、知識が定着し、応用力が身につきます。

わからないことがあれば、**遠慮なく質問を投げてみてください！** 一人で悩むより、質問して解決する方が成長が早いです。

## 練習問題の進め方

### 1. フォルダを作成

まず、練習問題用のフォルダを作成しましょう。

```bash
mkdir html-css-practice
cd html-css-practice
```

### 2. 問題ごとにフォルダを分ける

各問題ごとにフォルダを作成すると整理しやすいです。

```
html-css-practice/
├── exercise01/
│   └── index.html
├── exercise02/
│   └── index.html
├── exercise03/
│   ├── index.html
│   └── style.css
...
```

### 3. Live Previewで確認

VS Codeの「Live Preview」拡張機能を使って、HTMLファイルをブラウザでプレビューしながら作業しましょう。

右クリック → 「Show Preview」で即座に確認できます。

## 問題1：自己紹介ページを作成

基本的なHTML構造を使って、自己紹介ページを作成してください。

**要件：**
- 見出し（`<h1>`）：あなたの名前
- 段落（`<p>`）：自己紹介文
- リンク（`<a>`）：好きなWebサイトへのリンク
- 画像（`<img>`）：好きな画像（ローカルまたはWeb上の画像）

**フォルダ構成：**
```
exercise01/
└── index.html
```

**ヒント：**
- `<!DOCTYPE html>`から始めましょう
- `<html>`、`<head>`、`<body>`の基本構造を忘れずに
- 画像はWeb上の画像のURLを使うか、同じフォルダに画像を置いてください

**動作確認方法：**
1. `index.html`をVS Codeで開く
2. 右クリック → 「Show Preview」
3. ブラウザでプレビューが表示される

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の `practice/html-css/exercise01/` に用意しています。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>自己紹介</title>
</head>
<body>
  <h1>山田太郎</h1>
  <p>こんにちは！私はプログラミングを学んでいる学生です。</p>
  <p>好きなWebサイト：<a href="https://github.com">GitHub</a></p>
  <img src="https://via.placeholder.com/300x200" alt="サンプル画像">
</body>
</html>
```

## 問題2：リストを作成

順序なしリスト（`<ul>`）と順序付きリスト（`<ol>`）を使って、好きなものリストを作成してください。

**要件：**
- 見出し：「好きな食べ物」
- 順序なしリスト（`<ul>`）：好きな食べ物を3つ以上
- 見出し：「今月の目標」
- 順序付きリスト（`<ol>`）：目標を3つ以上

**フォルダ構成：**
```
exercise02/
└── index.html
```

**動作確認方法：**
1. `index.html`をVS Codeで開く
2. 右クリック → 「Show Preview」

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の `practice/html-css/exercise02/` にあります。

以下のコードを参考にしてください：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>リスト</title>
</head>
<body>
  <h2>好きな食べ物</h2>
  <ul>
    <li>ラーメン</li>
    <li>寿司</li>
    <li>カレー</li>
  </ul>

  <h2>今月の目標</h2>
  <ol>
    <li>HTMLをマスターする</li>
    <li>CSSでレイアウトを作れるようになる</li>
    <li>JavaScriptの基礎を学ぶ</li>
  </ol>
</body>
</html>
```

## 問題3：CSSで見た目を整える

HTMLファイルとCSSファイルを分けて、ページの見た目を整えてください。

**要件：**
- HTMLファイル：見出し、段落、リストを含むページ
- CSSファイル：以下のスタイルを適用
  - 背景色を変更
  - 見出しの色を変更
  - 段落のフォントサイズを変更
  - リストのマーカーの色を変更

**フォルダ構成：**
```
exercise03/
├── index.html
└── style.css
```

**ヒント：**
- HTMLファイルの`<head>`内で`<link rel="stylesheet" href="/frontend/style.css/">`を使ってCSSを読み込みます
- CSSでは、要素を選択して`color`や`background-color`、`font-size`などのプロパティを指定します

**動作確認方法：**
1. `index.html`をVS Codeで開く
2. 右クリック → 「Show Preview」
3. スタイルが適用されているか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の `practice/html-css/exercise03/` にあります。

以下のコードを参考にしてください：

**index.html:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>CSSスタイリング</title>
  <link rel="stylesheet" href="/frontend/style.css/">
</head>
<body>
  <h1>私のページ</h1>
  <p>これはCSSでスタイルを適用したページです。</p>
  <ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
  </ul>
</body>
</html>
```

**style.css:**
```css
body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  padding: 20px;
}

h1 {
  color: #333;
}

p {
  font-size: 18px;
  color: #666;
}

ul {
  color: #999;
}
```

## 問題4：簡単なカードレイアウト

複数のカードを横並びに表示するレイアウトを作成してください。

**要件：**
- 3つのカード（`<div>`）を作成
- 各カードには見出しと説明文を含める
- CSSで以下を実現：
  - カードを横並びに配置（Flexboxを使用）
  - カードに背景色、padding、borderを設定
  - カード間に適切な間隔を設ける

**フォルダ構成：**
```
exercise04/
├── index.html
└── style.css
```

**ヒント：**
- 親要素に`display: flex;`を設定すると、子要素が横並びになります
- `gap`プロパティで要素間の間隔を設定できます

**動作確認方法：**
1. `index.html`をVS Codeで開く
2. 右クリック → 「Show Preview」
3. カードが横並びになっているか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の `practice/html-css/exercise04/` にあります。

以下のコードを参考にしてください：

**index.html:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>カードレイアウト</title>
  <link rel="stylesheet" href="/frontend/style.css/">
</head>
<body>
  <h1>サービス紹介</h1>
  <div class="card-container">
    <div class="card">
      <h2>サービス1</h2>
      <p>これは最初のサービスです。</p>
    </div>
    <div class="card">
      <h2>サービス2</h2>
      <p>これは2番目のサービスです。</p>
    </div>
    <div class="card">
      <h2>サービス3</h2>
      <p>これは3番目のサービスです。</p>
    </div>
  </div>
</body>
</html>
```

**style.css:**
```css
body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  text-align: center;
  color: #333;
}

.card-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  width: 250px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h2 {
  color: #2c3e50;
  margin-top: 0;
}

.card p {
  color: #666;
}
```

## 問題5：フォームを作成

ユーザー登録フォームを作成してください。

**要件：**
- 名前入力欄（text型）
- メールアドレス入力欄（email型）
- パスワード入力欄（password型）
- 送信ボタン
- CSSで見た目を整える

**フォルダ構成：**
```
exercise05/
├── index.html
└── style.css
```

**ヒント：**
- `<form>`タグで全体を囲みます
- `<input>`タグの`type`属性で入力欄の種類を指定します
- `<label>`タグで各入力欄にラベルをつけると親切です

**動作確認方法：**
1. `index.html`をVS Codeで開く
2. 右クリック → 「Show Preview」
3. フォームが表示され、入力できるか確認

**回答例：**

回答例は、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の `practice/html-css/exercise05/` にあります。

以下のコードを参考にしてください：

**index.html:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ユーザー登録フォーム</title>
  <link rel="stylesheet" href="/frontend/style.css/">
</head>
<body>
  <div class="form-container">
    <h1>ユーザー登録</h1>
    <form>
      <div class="form-group">
        <label for="name">名前：</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="email">メールアドレス：</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="password">パスワード：</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit">登録</button>
    </form>
  </div>
</body>
</html>
```

**style.css:**
```css
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.form-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 400px;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}
```

## おめでとうございます！

HTML/CSSの基本的な練習問題を完了しました！これらの問題を通して：

- HTMLの基本構造
- リストやフォームの作成方法
- CSSでのスタイリング
- Flexboxを使ったレイアウト

を学びました。

## 次のステップ

- **JavaScript基礎解説**を読んで、JavaScriptの基本を学ぶ
- **JavaScript 練習問題**に挑戦して、動的なWebページを作る
- 自分でオリジナルのページを作ってみる

わからないことがあれば、遠慮なく質問してください！一緒に学んでいきましょう。

## 回答コードについて

全ての練習問題の回答コードは、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/html-css/`ディレクトリに用意しています。

リポジトリをクローンして、ローカルで動作確認できます：

```bash
git clone https://github.com/dik-ab/curriculum.git
cd curriculum/practice/html-css/exercise01
```

そして、`index.html`をブラウザで開いて確認してください。
