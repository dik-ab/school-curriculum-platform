---
title: 関数と型
parent: TypeScript基礎
nav_order: 4
---

# 関数と型

関数は、プログラミングで最も重要な概念の一つです。ここでは、JavaScriptの関数を復習し、TypeScriptで関数に型をつける方法を学びましょう。

## JavaScriptの関数（復習）

まずは、JavaScriptでの関数の書き方を復習しましょう。

### 関数の定義と使い方

**定義：**

```javascript
function greet(name) {
  return "Hello, " + name;
}
```

**使い方：**

```javascript
let message = greet("太郎");
console.log(message);
```

**出力：**
```
Hello, 太郎
```

### 関数の仕組み

関数は、以下の要素で構成されています：

```javascript
function 関数名(引数1, 引数2) {
  // 処理
  return 返り値;
}
```

- **関数名**：関数を呼び出すときの名前
- **引数**：関数に渡すデータ
- **返り値**：関数が返すデータ

### JavaScriptの関数の例

**例1：足し算をする関数**

```javascript
function add(a, b) {
  return a + b;
}

let result = add(5, 3);
console.log(result);  // 8
```

**例2：挨拶をする関数**

```javascript
function sayHello(name) {
  return "こんにちは、" + name + "さん！";
}

console.log(sayHello("太郎"));  // "こんにちは、太郎さん！"
console.log(sayHello("花子"));  // "こんにちは、花子さん！"
```

**例3：引数が複数ある関数**

```javascript
function introduce(name, age) {
  return "私は" + name + "です。" + age + "歳です。";
}

console.log(introduce("太郎", 25));  // "私は太郎です。25歳です。"
```

### JavaScriptの問題点

JavaScriptの関数には、型がありません。そのため、間違った型の値を渡してもエラーになりません。

```javascript
function add(a, b) {
  return a + b;
}

console.log(add(5, 3));      // 8（正常）
console.log(add(5, "3"));    // "53"（文字列として連結される）
console.log(add("Hello", 3)); // "Hello3"（意図しない結果）
```

実行してみて初めて、「あれ、おかしい」と気づきます。

## TypeScriptの関数

TypeScriptでは、関数の引数と返り値に型をつけられます。これにより、間違った使い方を**実行前に**防げます。

### 基本的な書き方

```typescript
function 関数名(引数1: 型, 引数2: 型): 返り値の型 {
  // 処理
  return 返り値;
}
```

### 例1：足し算をする関数（TypeScript版）

**定義：**

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

この関数は：
- 引数`a`は`number`型
- 引数`b`は`number`型
- 返り値も`number`型

**使い方：**

```typescript
let result = add(5, 3);
console.log(result);
```

**出力：**
```
8
```

**間違った使い方（エラーになる）：**

```typescript
add(5, "3");      // エラー！ 第2引数はnumberでなければならない
add("Hello", 3);  // エラー！ 第1引数はnumberでなければならない
```

VS Codeで赤い波線が表示され、実行前にエラーに気づけます。

### 例2：挨拶をする関数（TypeScript版）

**定義：**

```typescript
function greet(name: string): string {
  return "Hello, " + name;
}
```

**使い方：**

```typescript
console.log(greet("太郎"));
console.log(greet("花子"));
```

**出力：**
```
Hello, 太郎
Hello, 花子
```

**間違った使い方（エラーになる）：**

```typescript
greet(123);   // エラー！ 引数はstringでなければならない
greet(true);  // エラー！ 引数はstringでなければならない
```

### 例3：複数の引数がある関数

**定義：**

```typescript
function introduce(name: string, age: number): string {
  return `私は${name}です。${age}歳です。`;
}
```

**使い方：**

```typescript
console.log(introduce("太郎", 25));
console.log(introduce("花子", 22));
```

**出力：**
```
私は太郎です。25歳です。
私は花子です。22歳です。
```

**間違った使い方（エラーになる）：**

```typescript
introduce(25, "太郎");     // エラー！ 引数の順序が逆
introduce("太郎", "25");   // エラー！ 第2引数はnumberでなければならない
introduce("太郎");         // エラー！ 引数が足りない
```

## 返り値がない関数

返り値がない関数（値を返さない関数）の場合、`void`型を使います。

**定義：**

```typescript
function printMessage(message: string): void {
  console.log(message);
  // returnがない（または return; だけ）
}
```

**使い方：**

```typescript
printMessage("こんにちは");
printMessage("元気ですか？");
```

**出力：**
```
こんにちは
元気ですか？
```

### void型の意味

`void`は「返り値がない」という意味です。関数が値を返さない場合に使います。

```typescript
function showGreeting(name: string): void {
  console.log("こんにちは、" + name + "さん！");
  // return文がない
}

showGreeting("太郎");  // "こんにちは、太郎さん！"
```

## オプション引数

引数を省略可能にするには、`?`をつけます。

**定義：**

```typescript
function greet(name: string, title?: string): string {
  if (title) {
    return "Hello, " + title + " " + name;
  } else {
    return "Hello, " + name;
  }
}
```

`title?`の`?`は「この引数は省略してもOK」という意味です。

**使い方：**

```typescript
console.log(greet("太郎"));          // 第2引数を省略
console.log(greet("太郎", "Mr."));   // 第2引数を指定
```

**出力：**
```
Hello, 太郎
Hello, Mr. 太郎
```

## デフォルト引数

引数が省略された場合の初期値を設定できます。

**定義：**

```typescript
function greet(name: string, greeting: string = "こんにちは"): string {
  return greeting + "、" + name + "さん！";
}
```

`greeting: string = "こんにちは"`は、「`greeting`が省略されたら`"こんにちは"`を使う」という意味です。

**使い方：**

```typescript
console.log(greet("太郎"));            // 第2引数を省略
console.log(greet("花子", "おはよう")); // 第2引数を指定
```

**出力：**
```
こんにちは、太郎さん！
おはよう、花子さん！
```

## アロー関数（応用）

関数のもう一つの書き方として、**アロー関数**があります。

### 通常の関数

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

### アロー関数

```typescript
const add = (a: number, b: number): number => {
  return a + b;
};
```

### さらに短く書く

処理が1行だけの場合、`{}`と`return`を省略できます。

```typescript
const add = (a: number, b: number): number => a + b;
```

**使い方：**

```typescript
console.log(add(5, 3));   // 8
console.log(add(10, 20)); // 30
```

**出力：**
```
8
30
```

### アロー関数の例

```typescript
// 挨拶する関数
const greet = (name: string): string => "Hello, " + name;

console.log(greet("太郎"));  // "Hello, 太郎"

// 2倍にする関数
const double = (n: number): number => n * 2;

console.log(double(5));   // 10
console.log(double(10));  // 20
```

**注意：** アロー関数は、慣れるまで少し読みにくいかもしれません。最初は通常の`function`を使い、慣れてきたらアロー関数も使ってみましょう。

## 実践的な例

いくつか実践的な関数の例を見てみましょう。

### 例1：税込み価格を計算する関数

**定義：**

```typescript
function calculateTaxIncluded(price: number, taxRate: number = 0.1): number {
  return price * (1 + taxRate);
}
```

**使い方：**

```typescript
console.log(calculateTaxIncluded(1000));       // 税率10%（デフォルト）
console.log(calculateTaxIncluded(1000, 0.08)); // 税率8%
```

**出力：**
```
1100
1080
```

### 例2：配列の合計を計算する関数

**定義：**

```typescript
function sum(numbers: number[]): number {
  let total = 0;
  for (let num of numbers) {
    total += num;
  }
  return total;
}
```

**使い方：**

```typescript
console.log(sum([1, 2, 3, 4, 5]));
console.log(sum([10, 20, 30]));
```

**出力：**
```
15
60
```

### 例3：ユーザー情報を整形する関数

**定義：**

```typescript
function formatUser(name: string, age: number, isStudent: boolean): string {
  let status = isStudent ? "学生" : "社会人";
  return `名前: ${name}, 年齢: ${age}歳, 身分: ${status}`;
}
```

**使い方：**

```typescript
console.log(formatUser("太郎", 20, true));
console.log(formatUser("花子", 25, false));
```

**出力：**
```
名前: 太郎, 年齢: 20歳, 身分: 学生
名前: 花子, 年齢: 25歳, 身分: 社会人
```

## よくある間違いと対処法

### 間違い1：返り値の型が一致しない

```typescript
function add(a: number, b: number): number {
  return a + b + "";  // エラー！ 文字列を返している
}
```

**対処法：** 返り値の型を確認しましょう。`number`型を返すと宣言しているので、数値を返す必要があります。

```typescript
function add(a: number, b: number): number {
  return a + b;  // 正しい
}
```

### 間違い2：引数の型を間違える

```typescript
function greet(name: string): string {
  return "Hello, " + name;
}

greet(123);  // エラー！
```

**対処法：** 引数の型を確認し、正しい型の値を渡しましょう。

```typescript
greet("太郎");  // 正しい
```

### 間違い3：引数の数が合わない

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(5);  // エラー！ 引数が足りない
```

**対処法：** 関数定義を確認し、必要な数の引数を渡しましょう。

```typescript
add(5, 3);  // 正しい
```

## 練習問題

実際に手を動かして試してみましょう。

### 問題1：引き算をする関数

2つの数値を受け取り、引き算した結果を返す関数`subtract`を作成してください。

**答え：**

```typescript
function subtract(a: number, b: number): number {
  return a - b;
}

console.log(subtract(10, 3));  // 7
console.log(subtract(20, 5));  // 15
```

### 問題2：挨拶を表示する関数

名前を受け取り、「こんにちは、〇〇さん！」とコンソールに表示する関数`sayHello`を作成してください（返り値なし）。

**答え：**

```typescript
function sayHello(name: string): void {
  console.log("こんにちは、" + name + "さん！");
}

sayHello("太郎");  // "こんにちは、太郎さん！"
sayHello("花子");  // "こんにちは、花子さん！"
```

### 問題3：最大値を求める関数

2つの数値を受け取り、大きい方を返す関数`max`を作成してください。

**答え：**

```typescript
function max(a: number, b: number): number {
  if (a > b) {
    return a;
  } else {
    return b;
  }
}

console.log(max(10, 20));  // 20
console.log(max(50, 30));  // 50
```

または、三項演算子を使って：

```typescript
function max(a: number, b: number): number {
  return a > b ? a : b;
}
```

## まとめ

- **JavaScriptの関数**：型がないので、間違った使い方をしても実行するまで気づかない
- **TypeScriptの関数**：引数と返り値に型をつけることで、実行前にエラーを防げる
- **書き方**：`function 関数名(引数: 型): 返り値の型 { ... }`
- **void型**：返り値がない関数に使う
- **オプション引数**：`引数?: 型`で省略可能にできる
- **デフォルト引数**：`引数: 型 = 初期値`で初期値を設定できる
- **アロー関数**：`const 関数名 = (引数: 型): 返り値の型 => { ... }`

関数に型をつけることで、コードの安全性と可読性が大幅に向上します。最初は面倒に感じるかもしれませんが、すぐに慣れます。

次のページでは、実際にTypeScriptプロジェクトを作成し、「Hello World」を表示してみましょう！
