---
title: コンパイルとは？
parent: TypeScript基礎
nav_order: 2
---

# コンパイルとは？

TypeScriptを使う上で避けて通れないのが「コンパイル」という作業です。少し難しそうに聞こえるかもしれませんが、実はとてもシンプルな概念です。

## コンパイルは「翻訳作業」

一言で言えば、**コンパイルはTypeScriptをJavaScriptに翻訳する作業**です。

### なぜ翻訳が必要なのか？

実は、**ブラウザはTypeScriptを理解できません**。ブラウザが理解できるのはJavaScriptだけです。

```
TypeScriptのコード（.ts） → コンパイル → JavaScriptのコード（.js） → ブラウザで実行
```

たとえて言うなら：
- あなたが**日本語で手紙**を書いた（TypeScriptで書いた）
- でも相手は**英語しか読めない**（ブラウザはJavaScriptしか読めない）
- だから**翻訳機で英語に変換**する必要がある（コンパイルする）

## 実際のコンパイルを見てみよう

### TypeScriptファイル（app.ts）

```typescript
function greet(name: string): string {
  return "Hello, " + name;
}

let userName: string = "太郎";
console.log(greet(userName));
```

このTypeScriptファイルをコンパイルすると...

### JavaScriptファイル（app.js）

```javascript
function greet(name) {
  return "Hello, " + name;
}

var userName = "太郎";
console.log(greet(userName));
```

**何が起きたか？**
- 型の情報（`: string`）が消えた
- `let`が`var`に変わった（設定による）
- でも、ロジック（やっていること）は同じ

型の情報は、**コンパイル時のチェックのためだけ**に使われます。実行時には必要ないので、JavaScriptに変換するときに削除されます。

## distフォルダの役割

TypeScriptプロジェクトでは、よく`dist`フォルダが登場します。

### プロジェクト構成の例

```
myproject/
├── src/           ← TypeScriptファイル（.ts）を置く場所
│   ├── app.ts
│   └── utils.ts
├── dist/          ← コンパイルされたJavaScriptファイル（.js）が出力される場所
│   ├── app.js
│   └── utils.js
├── tsconfig.json  ← TypeScriptの設定ファイル
└── package.json
```

### distフォルダとは？

**dist**は「distribution（配布）」の略で、**実際に配布・実行するファイルを置く場所**です。

- **srcフォルダ**: あなたが書くTypeScriptのコード（開発用）
- **distフォルダ**: コンパイルされたJavaScriptのコード（実行用）

### なぜ分けるのか？

**開発用のファイル**と**実行用のファイル**を分けることで、プロジェクトが整理されます。

```
開発時：
srcフォルダのTypeScriptファイルを編集
  ↓
コンパイル
  ↓
distフォルダにJavaScriptファイルが自動生成

実行時：
distフォルダのJavaScriptファイルを実行
```

たとえて言うなら：
- **srcフォルダ** = 料理のレシピ（開発者が読む）
- **distフォルダ** = 完成した料理（お客さんに提供する）

**重要：** distフォルダの中身やプロジェクト構成の詳細は、今は全て理解できなくても大丈夫です。「そういうものがあるんだな」という程度に留めておいてください。実際に開発を進めていく中で、自然と理解できるようになります。

## コンパイルのメリット

### 1. 実行前にエラーを発見できる

**JavaScript（コンパイルなし）:**
```javascript
function add(a, b) {
  return a + b;
}

let result = add(5, "10");  // エラーにならない
console.log(result);  // "510" と表示される（期待は 15）
```

実行してみて初めて、「あれ、おかしい」と気づきます。

**TypeScript（コンパイルあり）:**
```typescript
function add(a: number, b: number): number {
  return a + b;
}

let result = add(5, "10");  // コンパイル時にエラー！
```

コンパイル時に、「`"10"`は文字列だから、`number`型の引数には渡せないよ」とエラーが出ます。

**つまり、コードを実行する前にバグを見つけられる！**

### 2. 古いブラウザでも動くJavaScriptに変換できる

TypeScriptは、最新のJavaScript機能を使って書けます。でも、コンパイル時に「古いブラウザでも動くJavaScript」に変換できます。

**TypeScript（最新の書き方）:**
```typescript
const greet = (name: string): string => `Hello, ${name}`;
```

**コンパイル後（古いブラウザでも動く）:**
```javascript
var greet = function(name) {
  return "Hello, " + name;
};
```

設定次第で、どのバージョンのJavaScriptに変換するか選べます。

### 3. コードの品質が自動的に保たれる

コンパイルが通るということは、少なくとも型の面では正しいコードということです。チーム開発で特に重要です。

## コンパイルの手順

実際にTypeScriptをコンパイルする手順を見てみましょう。

### 準備：TypeScriptのインストール

まず、TypeScriptをインストールします（Node.jsが必要です）。

```bash
npm install -g typescript
```

これで、`tsc`（TypeScript Compiler）コマンドが使えるようになります。

### 手順1：TypeScriptファイルを作成

`app.ts`というファイルを作成します。

```typescript
function greet(name: string): string {
  return "Hello, " + name;
}

console.log(greet("太郎"));
```

### 手順2：コンパイルする

ターミナルで以下のコマンドを実行します。

```bash
tsc app.ts
```

すると、同じディレクトリに`app.js`が生成されます。

```
myproject/
├── app.ts   ← 元のTypeScriptファイル
└── app.js   ← コンパイルされたJavaScriptファイル（新しく生成された）
```

### 手順3：実行する

生成されたJavaScriptファイルを実行します。

```bash
node app.js
```

出力：
```
Hello, 太郎
```

### 自動コンパイル（便利！）

毎回`tsc`コマンドを打つのは面倒です。**ファイルを保存したら自動でコンパイル**されるようにできます。

```bash
tsc --watch
```

または、短く：

```bash
tsc -w
```

このコマンドを実行すると、TypeScriptファイルを保存するたびに自動でコンパイルされます。とても便利なので、開発中はこのモードを使いましょう。

## tsconfig.jsonで設定を管理

プロジェクトが大きくなると、コンパイルの設定を毎回コマンドで指定するのは大変です。そこで、**tsconfig.json**という設定ファイルを使います。

### tsconfig.jsonを作成

```bash
tsc --init
```

このコマンドを実行すると、`tsconfig.json`が自動生成されます。

### 基本的な設定例

```json
{
  "compilerOptions": {
    "target": "ES2020",           // どのバージョンのJavaScriptに変換するか
    "module": "commonjs",          // モジュールの形式
    "outDir": "./dist",            // 出力先（distフォルダに出力）
    "rootDir": "./src",            // ソースコードの場所（srcフォルダ）
    "strict": true,                // 厳格な型チェックを有効化
    "esModuleInterop": true
  },
  "include": ["src/**/*"],         // コンパイル対象（srcフォルダ内の全ファイル）
  "exclude": ["node_modules"]      // コンパイル対象外
}
```

この設定があれば、単に`tsc`と入力するだけで、設定に従ってコンパイルされます。

```bash
tsc
```

または、自動コンパイルモード：

```bash
tsc -w
```

**重要：** tsconfig.jsonの各設定項目の詳細は、今は全て理解できなくても問題ありません。上記の設定をコピーして使えば動きます。「こういう設定ファイルがあるんだな」という程度の理解で大丈夫です。開発を続けていく中で、必要に応じて調べていけば十分です。

## コンパイルエラーが出たら？

コンパイル時にエラーが出ることは**正常**です。むしろ、「実行前にバグを教えてくれている」ので、ありがたいことです。

### エラーの例

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(5, "10");  // エラー！
```

エラーメッセージ：
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**意味：**「文字列型（string）を数値型（number）の引数に渡せないよ」

### エラーの対処法

1. **エラーメッセージをよく読む**
   - どのファイルの何行目でエラーが出ているか
   - 何が問題なのか

2. **型を確認する**
   - 変数や引数の型が正しいか
   - 意図した型を使っているか

3. **分からなければ検索する**
   - エラーメッセージをコピーして検索
   - 同じエラーに遭遇した人の解決策を参考にする

## まとめ

- **コンパイル**は、TypeScriptをJavaScriptに翻訳する作業
- **distフォルダ**は、コンパイルされたJavaScriptファイルを置く場所（実行用）
- **srcフォルダ**は、TypeScriptファイルを置く場所（開発用）
- コンパイルのメリット：
  - 実行前にエラーを発見できる
  - 古いブラウザでも動くコードに変換できる
  - コードの品質が保たれる
- **tsc**コマンドでコンパイル、**tsc -w**で自動コンパイル
- **tsconfig.json**で設定を管理できる
- コンパイルエラーは怖くない、むしろありがたい存在

次のページでは、TypeScriptの「型」について詳しく見ていきましょう。
