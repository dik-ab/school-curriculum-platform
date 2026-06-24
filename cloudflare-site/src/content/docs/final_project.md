---
title: 入門編最終問題
nav_order: 5
---

# 入門編最終問題

おめでとうございます！ここまで、HTML/CSS、JavaScript、そしてTypeScriptの基礎を学んできました。この最終問題では、これまで学んだ全ての知識を総動員して、実践的なアプリケーションを作成します。

**重要：** これらの問題は必須ではありませんが、**解くことで確実に力がつきます**。実際に手を動かしてアプリを完成させることで、学んだ知識が本物のスキルになります。

わからないことがあれば、**遠慮なく質問を投げてみてください！** プログラミングは、つまずきながら成長するものです。

## 最終問題の進め方

### 1. プロジェクトフォルダを作成

```bash
mkdir final-projects
cd final-projects
```

### 2. 問題ごとにプロジェクトを作成

各問題は独立したプロジェクトとして作成します。TypeScriptを使う問題では、プロジェクトのセットアップから始めましょう。

### 3. 回答コードの確認

全ての問題の回答コードは、[GitHubリポジトリ](https://github.com/dik-ab/curriculum)の`practice/final-projects/`ディレクトリに用意しています。

## 難易度について

- **★☆☆☆☆**：HTML/CSS/JavaScriptの基礎
- **★★☆☆☆**：JavaScriptのDOM操作
- **★★★☆☆**：TypeScriptの基礎を使ったアプリ
- **★★★★☆**：TypeScriptでの実践的なアプリ
- **★★★★★**：総合的な応用力が必要なアプリ

## 問題1：カウンターアプリ ★☆☆☆☆

### 内容

ボタンをクリックすると数値が増減するカウンターアプリを作成してください。

### 要件

- 現在のカウントを表示（初期値は0）
- 「+1」ボタン：カウントを1増やす
- 「-1」ボタン：カウントを1減らす
- 「リセット」ボタン：カウントを0に戻す
- CSSでデザインを整える

### 使用技術

- HTML
- CSS
- JavaScript

### フォルダ構成

```
counter-app/
└── index.html
```

### ヒント

- ボタンのクリックイベントを`addEventListener`で処理
- カウントの値を変数に保持
- `textContent`でカウント表示を更新

### 動作確認方法

1. `index.html`をブラウザで開く
2. 各ボタンをクリックして、カウントが正しく増減するか確認

**回答例：**

[GitHubリポジトリ - counter-app](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/counter-app)

リポジトリをクローンして動作確認：
```bash
git clone https://github.com/dik-ab/curriculum.git
cd curriculum/practice/final-projects/counter-app
```

ブラウザで`index.html`を開いて確認してください。

## 問題2：TODOリストアプリ（TypeScript版）★★★☆☆

### 内容

タスクを追加・削除できるTODOリストアプリをTypeScriptで作成してください。

### 要件

- タスク入力欄とボタンが追加ボタン
- タスクをリスト表示
- 各タスクに「削除」ボタンをつける
- タスクをクリックしたら完了状態にする（取り消し線を表示）
- TypeScriptで型を使って実装
- CSSでデザインを整える

### 使用技術

- HTML
- CSS
- TypeScript

### フォルダ構成

```
todo-app/
├── src/
│   └── index.ts
├── dist/
│   └── index.js（コンパイル後）
├── index.html
├── style.css
├── tsconfig.json
└── package.json
```

### ヒント

- TypeScriptプロジェクトとして初期化（`npm init -y`、`npm install --save-dev typescript`）
- `tsconfig.json`を作成（`npx tsc --init`）
- タスクをオブジェクトの配列として管理（`{ id: number, text: string, completed: boolean }`）
- HTMLファイルで`dist/index.js`を読み込む

### 動作確認方法

1. TypeScriptをコンパイル：`npx tsc`
2. `index.html`をブラウザで開く
3. タスクの追加・削除・完了機能が動作するか確認

**回答例：**

[GitHubリポジトリ - todo-app](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/todo-app)

リポジトリをクローンして動作確認：
```bash
git clone https://github.com/dik-ab/curriculum.git
cd curriculum/practice/final-projects/todo-app
npm install
npx tsc
```

ブラウザで`index.html`を開いて確認してください。

## 問題3：ストップウォッチアプリ ★★★☆☆

### 内容

時間を計測できるストップウォッチアプリをTypeScriptで作成してください。

### 要件

- 経過時間を表示（00:00:00形式）
- 「スタート」ボタン：計測を開始
- 「ストップ」ボタン：計測を停止
- 「リセット」ボタン：時間を0に戻す
- TypeScriptで型を使って実装
- CSSでデザインを整える

### 使用技術

- HTML
- CSS
- TypeScript

### フォルダ構成

```
stopwatch-app/
├── src/
│   └── index.ts
├── dist/
│   └── index.js
├── index.html
├── style.css
├── tsconfig.json
└── package.json
```

### ヒント

- `setInterval`で1秒ごとに時間を更新
- `clearInterval`で計測を停止
- 経過秒数を「時:分:秒」に変換する関数を作成
- ボタンの状態管理（スタート中は「スタート」ボタンを無効化など）

### 動作確認方法

1. TypeScriptをコンパイル：`npx tsc`
2. `index.html`をブラウザで開く
3. ストップウォッチが正しく動作するか確認

**回答例：**

[GitHubリポジトリ - stopwatch-app](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/stopwatch-app)

## 問題4：クイズアプリ ★★★★☆

### 内容

複数の問題を出題し、スコアを記録するクイズアプリをTypeScriptで作成してください。

### 要件

- 複数の問題を配列で管理
- 1問ずつ表示（問題文と選択肢）
- 選択肢をクリックしたら次の問題へ
- 全問終了後、正解数とスコアを表示
- 「もう一度」ボタンで最初から
- TypeScriptで型を使って実装（問題の型定義も作成）
- CSSでデザインを整える

### 使用技術

- HTML
- CSS
- TypeScript

### フォルダ構成

```
quiz-app/
├── src/
│   ├── index.ts
│   └── types.ts（型定義）
├── dist/
│   ├── index.js
│   └── types.js
├── index.html
├── style.css
├── tsconfig.json
└── package.json
```

### ヒント

- 問題の型を定義：`type Question = { question: string; choices: string[]; correctIndex: number }`
- 現在の問題番号を管理
- 正解数をカウント
- すべての問題が終わったら結果画面に切り替え

### 動作確認方法

1. TypeScriptをコンパイル：`npx tsc`
2. `index.html`をブラウザで開く
3. クイズを最後まで進めて、スコアが正しく表示されるか確認

**回答例：**

[GitHubリポジトリ - quiz-app](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/quiz-app)

## 問題5：タイピングゲーム ★★★★★

### 内容

表示された単語を制限時間内に入力するタイピングゲームをTypeScriptで作成してください。

### 要件

- ランダムに単語を表示
- 入力欄に正しく入力したら次の単語へ
- 制限時間（例：60秒）をカウントダウン
- スコア（入力できた単語数）を表示
- ゲーム終了後、結果とリトライボタンを表示
- TypeScriptで型を使って実装
- CSSでデザインを整える

### 使用技術

- HTML
- CSS
- TypeScript

### フォルダ構成

```
typing-game/
├── src/
│   ├── index.ts
│   └── words.ts（単語リスト）
├── dist/
│   ├── index.js
│   └── words.js
├── index.html
├── style.css
├── tsconfig.json
└── package.json
```

### ヒント

- 単語リストを配列で用意
- `setInterval`で1秒ごとに残り時間を減らす
- 入力値とターゲット単語を比較
- タイマーが0になったらゲーム終了
- ゲームの状態（待機中、プレイ中、終了）を管理

### 動作確認方法

1. TypeScriptをコンパイル：`npx tsc`
2. `index.html`をブラウザで開く
3. ゲームをプレイして、正しく動作するか確認

**回答例：**

[GitHubリポジトリ - typing-game](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/typing-game)

## 問題6：電卓アプリ ★★★★★

### 内容

四則演算ができる電卓アプリをTypeScriptで作成してください。

### 要件

- 数字ボタン（0-9）
- 演算子ボタン（+、-、×、÷）
- =ボタン（計算実行）
- Cボタン（クリア）
- ディスプレイ（入力内容と結果を表示）
- TypeScriptで型を使って実装
- CSSで電卓らしいデザイン

### 使用技術

- HTML
- CSS
- TypeScript

### フォルダ構成

```
calculator-app/
├── src/
│   └── index.ts
├── dist/
│   └── index.js
├── index.html
├── style.css
├── tsconfig.json
└── package.json
```

### ヒント

- 現在の入力値、前の値、演算子を変数で管理
- 数字ボタンは文字列として入力値に追加
- 演算子ボタンは現在の入力値を保存して、次の入力を待つ
- =ボタンで計算を実行
- エラーハンドリング（0で割るなど）

### 動作確認方法

1. TypeScriptをコンパイル：`npx tsc`
2. `index.html`をブラウザで開く
3. 色々な計算を試して、正しく動作するか確認

**回答例：**

[GitHubリポジトリ - calculator-app](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects/calculator-app)

## おめでとうございます！

最終問題に挑戦することで、あなたは入門編の全ての内容をマスターしました！

### あなたが身につけたスキル

- **HTML/CSS**：構造とデザインを作成できる
- **JavaScript**：プログラミングの基礎とDOM操作ができる
- **TypeScript**：型を使った安全なコードが書ける
- **実践力**：実際のアプリケーションを作成できる

### 次のステップ

ここまで学んだあなたは、以下のような技術に進む準備ができています：

- **フレームワーク**：React、Next.jsなど
- **バックエンド**：Node.js、Express
- **データベース**：MongoDB、PostgreSQL
- **API開発**：RESTful API、GraphQL

プログラミングの世界は無限に広がっています。自信を持って、次のステップに進んでください！

## 回答コードについて

全ての最終問題の回答コードは、[GitHubリポジトリ](https://github.com/dik-ab/curriculum/tree/main/practice/final-projects)に用意しています。

### リポジトリのクローン方法

```bash
git clone https://github.com/dik-ab/curriculum.git
cd curriculum/practice/final-projects
```

### 各プロジェクトの実行方法

**HTML/CSS/JavaScriptのプロジェクト（counter-appなど）：**
```bash
cd counter-app
```
`index.html`をブラウザで開いて確認

**TypeScriptのプロジェクト（todo-appなど）：**
```bash
cd todo-app
npm install
npx tsc
```
`index.html`をブラウザで開いて確認

## 質問・フィードバック

わからないことがあれば、GitHubのIssuesやDiscussionsで質問してください。あなたの質問が、他の学習者の助けにもなります！

**あなたの学習の旅は、ここから本当に始まります。頑張ってください！**
