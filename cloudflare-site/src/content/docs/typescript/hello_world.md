---
title: Hello World プロジェクト
parent: TypeScript基礎
nav_order: 5
---

# Hello World プロジェクト

いよいよ、実際にTypeScriptプロジェクトを作成し、「Hello World」を表示してみましょう！この手順を通して、TypeScriptプロジェクトの基本的な構成を理解できます。

## プロジェクトの完成イメージ

最終的に、以下のような構成のプロジェクトを作ります：

```
my-ts-app/
├── src/
│   └── index.ts         ← TypeScriptファイル（あなたが書く）
├── dist/
│   └── index.js         ← コンパイルされたJavaScriptファイル（自動生成）
├── node_modules/        ← 依存パッケージ（自動生成）
├── package.json         ← プロジェクト設定ファイル
└── tsconfig.json        ← TypeScript設定ファイル
```

## 手順1：プロジェクトディレクトリを作成

まず、プロジェクト用のフォルダを作成します。

```bash
mkdir my-ts-app
cd my-ts-app
```

**説明：**
- `mkdir my-ts-app`：「my-ts-app」という名前のフォルダを作成
- `cd my-ts-app`：作成したフォルダに移動

**確認：**

```bash
pwd
```

`/Users/あなたの名前/.../my-ts-app`のように表示されればOKです。

## 手順2：Node.jsプロジェクトとして初期化

次に、このフォルダをNode.jsプロジェクトとして初期化します。

```bash
npm init -y
```

**説明：**
- `npm init`：Node.jsプロジェクトとして初期化するコマンド
- `-y`：全ての質問に「yes」と答える（設定をスキップ）

**何が起きたか？**

`package.json`というファイルが作成されました。このファイルには、プロジェクトの情報や依存パッケージの情報が記録されます。

```json
{
  "name": "my-ts-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## 手順3：TypeScriptをインストール

プロジェクトにTypeScriptをインストールします。

```bash
npm install --save-dev typescript
```

**説明：**
- `npm install`：パッケージをインストールするコマンド
- `--save-dev`：開発時にのみ必要なパッケージとして保存
- `typescript`：TypeScriptパッケージ

**何が起きたか？**

- `node_modules`フォルダが作成され、TypeScriptがインストールされた
- `package.json`に`"devDependencies"`が追加された
- `package-lock.json`が作成された（依存関係を固定するファイル）

**なぜプロジェクトごとにインストールするのか？**

プロジェクトごとにTypeScriptのバージョンを固定できます。これにより、チーム開発でも全員が同じバージョンを使えます。

## 手順4：TypeScript設定ファイルを生成

TypeScriptの設定ファイル（`tsconfig.json`）を作成します。

```bash
npx tsc --init
```

**説明：**
- `npx`：プロジェクトにインストールしたコマンドを実行
- `tsc`：TypeScriptコンパイラ
- `--init`：設定ファイルを自動生成

**何が起きたか？**

`tsconfig.json`というファイルが作成されました。このファイルには、TypeScriptのコンパイル設定が記述されています。

## 手順5：tsconfig.jsonを設定

生成された`tsconfig.json`を開き、以下のように設定します。

**VS Codeで開く：**

```bash
code tsconfig.json
```

**設定内容：**

既存の内容を全て削除し、以下をコピペしてください。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

**各設定の意味：**

- **target**: `"ES2020"`
  - どのバージョンのJavaScriptに変換するか（ES2020 = 2020年版のJavaScript）

- **module**: `"commonjs"`
  - モジュールシステムの形式（Node.jsで使われる形式）

- **outDir**: `"dist"`
  - コンパイル後のJavaScriptファイルの出力先フォルダ

- **rootDir**: `"src"`
  - TypeScriptファイルが置かれるフォルダ

- **strict**: `true`
  - 厳格な型チェックを有効化（推奨）

- **esModuleInterop**: `true`
  - モジュールのインポートを柔軟にする

- **include**: `["src"]`
  - `src`フォルダ内のファイルをコンパイル対象にする

## 手順6：ソースコード用のフォルダを作成

TypeScriptファイルを置く`src`フォルダを作成します。

```bash
mkdir src
```

**確認：**

```bash
ls
```

`src`フォルダが表示されればOKです。

## 手順7：TypeScriptファイルを作成

`src`フォルダ内に`index.ts`ファイルを作成し、コードを書きます。

**ファイルを作成：**

```bash
touch src/index.ts
```

**VS Codeで開く：**

```bash
code src/index.ts
```

**コードを書く：**

```typescript
const greeting: string = "Hello, TypeScript!";
console.log(greeting);
```

**説明：**
- `const greeting: string`：`greeting`という定数を宣言、型は`string`
- `= "Hello, TypeScript!"`：初期値を設定
- `console.log(greeting)`：値をコンソールに表示

ファイルを保存してください（⌘ + S / Ctrl + S）。

## 手順8：TypeScriptをコンパイル

TypeScriptファイルをJavaScriptに変換します。

```bash
npx tsc
```

**何が起きたか？**

`dist`フォルダが自動的に作成され、その中に`index.js`が生成されました。

**確認：**

```bash
ls dist
```

`index.js`が表示されればOKです。

**生成されたJavaScriptを見てみる：**

```bash
cat dist/index.js
```

以下のように表示されます：

```javascript
"use strict";
const greeting = "Hello, TypeScript!";
console.log(greeting);
```

型情報（`: string`）が消えていることに注目してください。型はコンパイル時のチェックにのみ使われるためです。

## 手順9：プログラムを実行

生成されたJavaScriptファイルをNode.jsで実行します。

```bash
node dist/index.js
```

**出力：**

```
Hello, TypeScript!
```

**おめでとうございます！** 初めてのTypeScriptプログラムが動きました！

## コードを変更してみよう

では、コードを少し変更して、再度実行してみましょう。

**src/index.tsを編集：**

```typescript
const greeting: string = "Hello, TypeScript!";
const name: string = "太郎";
const age: number = 25;

console.log(greeting);
console.log(`私の名前は${name}です。`);
console.log(`年齢は${age}歳です。`);
```

**再コンパイル：**

```bash
npx tsc
```

**実行：**

```bash
node dist/index.js
```

**出力：**

```
Hello, TypeScript!
私の名前は太郎です。
年齢は25歳です。
```

## 自動コンパイルモードを使おう

毎回`npx tsc`を実行するのは面倒です。ファイルを保存したら自動でコンパイルされるようにしましょう。

**新しいターミナルを開いて実行：**

```bash
npx tsc --watch
```

または、短く：

```bash
npx tsc -w
```

すると、以下のように表示されます：

```
[午後3:45:12] Starting compilation in watch mode...
[午後3:45:15] Found 0 errors. Watching for file changes.
```

**これで、`src/index.ts`を保存するたびに自動でコンパイルされます！**

試しに、`src/index.ts`を編集して保存してみてください。ターミナルに「File change detected. Starting incremental compilation...」と表示されるはずです。

**実行は別のターミナルで：**

ターミナルをもう一つ開いて（または分割して）、以下を実行：

```bash
node dist/index.js
```

**watchモードを終了するには：**

Ctrl + C を押します。

## エラーを体験してみよう

わざと型エラーを起こしてみましょう。これにより、TypeScriptの型チェックの威力を実感できます。

**src/index.tsを編集：**

```typescript
const greeting: string = "Hello, TypeScript!";
const age: number = "25";  // エラー！ stringをnumberに代入しようとしている

console.log(greeting);
console.log(age);
```

**VS Code上で赤い波線が表示されます。**

**コンパイルしてみる：**

```bash
npx tsc
```

**エラーメッセージが表示されます：**

```
src/index.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.

2 const age: number = "25";
        ~~~

Found 1 error.
```

**意味：**「文字列型（string）を数値型（number）に代入できないよ」

**修正：**

```typescript
const greeting: string = "Hello, TypeScript!";
const age: number = 25;  // 正しい

console.log(greeting);
console.log(age);
```

これで再度コンパイルすれば、エラーが消えます。

**このように、TypeScriptは実行前にエラーを教えてくれます！**

## よくあるトラブルと対処法

### トラブル1：`tsc: command not found`

**原因：** TypeScriptがインストールされていない

**対処法：**

```bash
npm install --save-dev typescript
```

### トラブル2：`dist`フォルダが作成されない

**原因：** `tsconfig.json`の設定が間違っている

**対処法：** `tsconfig.json`の`"outDir"`が`"dist"`になっているか確認

### トラブル3：`node: No such file or directory`

**原因：** Node.jsがインストールされていない

**対処法：** [Node.jsのインストールガイド](/environment/node/)を参照してNode.jsをインストール

### トラブル4：変更しても反映されない

**原因：** 古い`index.js`が実行されている

**対処法：** `npx tsc`でコンパイルしてから`node dist/index.js`で実行

## package.jsonにスクリプトを追加（便利！）

毎回`npx tsc`や`node dist/index.js`と入力するのは面倒です。`package.json`にショートカットを追加しましょう。

**package.jsonを開いて、`"scripts"`部分を以下のように変更：**

```json
{
  "name": "my-ts-app",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc -w"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**使い方：**

```bash
# コンパイル
npm run build

# 実行
npm run start

# 自動コンパイルモード
npm run dev
```

短くて覚えやすいですね！

## まとめ

**作成したプロジェクト構成：**

```
my-ts-app/
├── src/
│   └── index.ts         ← あなたが書くTypeScriptファイル
├── dist/
│   └── index.js         ← コンパイルされたJavaScriptファイル
├── node_modules/        ← 依存パッケージ
├── package.json         ← プロジェクト情報
├── package-lock.json    ← 依存関係の固定
└── tsconfig.json        ← TypeScript設定
```

**実行の流れ：**

```
1. src/index.ts を編集（TypeScriptで書く）
   ↓
2. npx tsc でコンパイル（または tsc -w で自動コンパイル）
   ↓
3. dist/index.js が生成される
   ↓
4. node dist/index.js で実行
```

**覚えておくコマンド：**

- `npx tsc`：コンパイル
- `npx tsc -w`：自動コンパイルモード
- `node dist/index.js`：実行

**あなたは今、TypeScriptプロジェクトを一から作成できるようになりました！** これは大きな一歩です。

次のページでは、練習問題を通して、ここまで学んだ知識を定着させましょう。
