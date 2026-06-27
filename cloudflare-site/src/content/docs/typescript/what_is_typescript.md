---
title: TypeScriptとは？
parent: TypeScript基礎
nav_order: 1
---

# TypeScriptとは？

TypeScriptを学ぶ前に、「TypeScriptって結局何なの？」という疑問に答えます。JavaScriptとの違いを具体例で見ていきましょう。

## TypeScriptは「JavaScriptに型をつけたもの」

一言で言えば、**TypeScriptはJavaScriptに「型」という機能を追加した言語**です。

TypeScriptは、JavaScriptの文法を土台にして作られています。つまり、TypeScriptは**JavaScriptのスーパーセット**です。

ただし、JavaScriptとして実行できるコードでも、TypeScriptの型チェックではエラーになることがあります。これは「実行できない」という意味ではなく、「型の観点では危ない」と教えてくれている状態です。

```
JavaScript ⊂ TypeScript
（JavaScriptはTypeScriptに含まれる）
```

## JavaScriptとの違いを見てみよう

### 例1：変数の宣言

**JavaScript:**
```javascript
let age = 25;
age = "25歳";  // OK！エラーにならない
```

JavaScriptでは、最初に数値を入れた変数に、後から文字列を入れてもエラーになりません。

**TypeScript:**
```typescript
let age: number = 25;
age = "25歳";  // エラー！ numberに stringは代入できない
```

TypeScriptでは、`age`は`number`（数値）型だと宣言しているので、文字列を代入しようとするとエラーが出ます。

### なぜこれが良いのか？

JavaScriptの場合、このコードは実行するまでエラーに気づきません。

```javascript
function calculateAge(birthYear) {
  return 2024 - birthYear;
}

let result = calculateAge("1990");  // "1990"は文字列
console.log(result);  // 34 と表示される（たまたま動く）

let result2 = calculateAge("平成2年");  // これは？
console.log(result2);  // NaN（Not a Number）になる
```

TypeScriptなら、コードを書いている段階でエラーを教えてくれます。

```typescript
function calculateAge(birthYear: number): number {
  return 2024 - birthYear;
}

let result = calculateAge("1990");  // エラー！ string は number ではありません
```

VS Code上で赤い波線が表示され、「あ、ここ間違ってる！」と実行前に気づけます。

### 例2：関数の引数と返り値

**JavaScript:**
```javascript
function greet(name) {
  return "Hello, " + name;
}

greet("太郎");        // "Hello, 太郎"
greet(123);          // "Hello, 123"
greet();             // "Hello, undefined"
greet("太郎", "花子"); // "Hello, 太郎"（第2引数は無視される）
```

JavaScriptは、どんな引数を渡しても動いてしまいます。

**TypeScript:**
```typescript
function greet(name: string): string {
  return "Hello, " + name;
}

greet("太郎");        // OK
greet(123);          // エラー！ number は string ではありません
greet();             // エラー！引数が足りません
greet("太郎", "花子"); // エラー！引数が多すぎます
```

TypeScriptは、関数の使い方を厳密にチェックしてくれます。

### 例3：オブジェクトのプロパティ

**JavaScript:**
```javascript
let user = {
  name: "太郎",
  age: 25
};

console.log(user.name);  // "太郎"
console.log(user.email); // undefined（プロパティが存在しない）
```

JavaScriptでは、存在しないプロパティにアクセスしても`undefined`が返るだけで、エラーになりません。

**TypeScript:**
```typescript
let user: { name: string; age: number } = {
  name: "太郎",
  age: 25
};

console.log(user.name);  // "太郎"
console.log(user.email); // エラー！ email プロパティは存在しません
```

TypeScriptは、タイプミスや存在しないプロパティへのアクセスを事前に教えてくれます。

## TypeScriptの3つのメリット

### 1. バグを事前に防げる

実行前にエラーを見つけられるので、バグが大幅に減ります。

**JavaScript:**
- コードを実行して、初めてエラーに気づく
- ユーザーが使っているときにバグが発覚することも

**TypeScript:**
- コードを書いている段階でエラーが分かる
- 型の不一致やプロパティ名の間違いを実行前に発見できる

### 2. コードが読みやすくなる

型があることで、「この変数は何が入っているのか」「この関数は何を受け取って何を返すのか」が一目で分かります。

```typescript
// 型を見れば、何をする関数か分かる
function calculateTotalPrice(price: number, quantity: number): number {
  return price * quantity;
}
```

### 3. エディタの補完機能が強力になる

VS Codeなどのエディタは、型情報を元に強力な補完機能を提供してくれます。

```typescript
let user: { name: string; age: number; email: string } = {
  name: "太郎",
  age: 25,
  email: "taro@example.com"
};

user.  // ← ここで「.」を入力すると、name, age, emailが自動で表示される
```

## TypeScriptのデメリット

正直に言うと、TypeScriptにもデメリットがあります。

### 学習コストがかかる

「型」という新しい概念を学ぶ必要があります。最初は面倒に感じるかもしれません。

### コンパイルが必要

TypeScriptのコードは、そのままブラウザで実行できません。JavaScriptに変換（コンパイル）する必要があります。

### コード量が増える

型を書く分、コード量は増えます。

```javascript
// JavaScript：短い
function add(a, b) {
  return a + b;
}
```

```typescript
// TypeScript：型の分、少し長い
function add(a: number, b: number): number {
  return a + b;
}
```

## でも、メリットの方が圧倒的に大きい

最初は面倒に感じるかもしれませんが、**実際の開発では、TypeScriptのメリットがデメリットを遥かに上回ります**。

特に：
- チームで開発するとき
- 大きなプロジェクトを作るとき
- 長期間メンテナンスするとき

これらの場面では、TypeScriptの威力が発揮されます。

## まとめ

- TypeScriptは、JavaScriptに「型」を追加した言語
- 実行前にエラーを見つけられる
- コードが読みやすく、保守しやすくなる
- 最初は少し面倒だが、慣れれば開発効率が大幅に向上する

次のページでは、TypeScriptの「コンパイル」について詳しく見ていきましょう。
