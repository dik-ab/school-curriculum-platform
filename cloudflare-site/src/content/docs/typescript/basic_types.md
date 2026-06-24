---
title: TypeScriptの基本型
parent: TypeScript基礎
nav_order: 3
---

# TypeScriptの基本型

TypeScriptの最大の特徴は「型」です。ここでは、TypeScriptで使える基本的な型を、たくさんの例と共に見ていきましょう。

## 型とは？

型とは、「この変数にはどんな種類の値が入るか」を示すラベルのようなものです。

```typescript
let age: number = 25;  // numberは「数値」という型
```

この一行で：
- `age`という変数を作る
- この変数には`number`（数値）しか入れられない
- 最初の値は`25`

## 基本的な3つの型

まずは、最もよく使う3つの型を覚えましょう。

### string（文字列）

文字列を扱う型です。

```typescript
let name: string = "太郎";
let message: string = "こんにちは";
let email: string = 'taro@example.com';  // シングルクォートでもOK
```

**テンプレート文字列も使える：**

```typescript
let firstName: string = "太郎";
let greeting: string = `Hello, ${firstName}!`;  // "Hello, 太郎!"
```

**間違った使い方（エラーになる）：**

```typescript
let name: string = "太郎";
name = 123;  // エラー！ numberはstringに代入できない
```

### number（数値）

数値を扱う型です。整数も小数も同じ`number`型です。

```typescript
let age: number = 25;
let price: number = 1980;
let temperature: number = 36.5;
let negative: number = -10;
```

**計算ももちろんできる：**

```typescript
let a: number = 10;
let b: number = 20;
let sum: number = a + b;  // 30
```

**間違った使い方（エラーになる）：**

```typescript
let age: number = 25;
age = "25歳";  // エラー！ stringはnumberに代入できない
```

### boolean（真偽値）

`true`（真）または`false`（偽）を扱う型です。

```typescript
let isStudent: boolean = true;
let hasLicense: boolean = false;
```

**条件式の結果もboolean：**

```typescript
let age: number = 20;
let isAdult: boolean = age >= 18;  // true
```

**間違った使い方（エラーになる）：**

```typescript
let isStudent: boolean = true;
isStudent = "true";  // エラー！ stringはbooleanに代入できない
```

## 配列の型

複数の値をまとめて扱う配列にも型をつけられます。

### 書き方1：型[]

```typescript
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["太郎", "花子", "次郎"];
let flags: boolean[] = [true, false, true];
```

### 書き方2：Array<型>

```typescript
let numbers: Array<number> = [1, 2, 3, 4, 5];
let names: Array<string> = ["太郎", "花子", "次郎"];
```

どちらの書き方でも同じ意味です。好みで選んでOKですが、`型[]`の方がよく使われます。

### 配列の例

```typescript
// 数値の配列
let scores: number[] = [80, 90, 75];
scores.push(85);  // OK
scores.push("100");  // エラー！ stringは追加できない

// 文字列の配列
let fruits: string[] = ["apple", "banana"];
fruits.push("orange");  // OK
fruits.push(123);  // エラー！ numberは追加できない
```

### 空の配列

```typescript
let numbers: number[] = [];  // 空の配列（後で数値を追加できる）
numbers.push(1);
numbers.push(2);
// numbers は [1, 2] になる
```

## オブジェクトの型

オブジェクト（連想配列）にも型をつけられます。

### 基本的な書き方

```typescript
let user: { name: string; age: number } = {
  name: "太郎",
  age: 25
};
```

この書き方で：
- `user`はオブジェクト
- `name`プロパティは`string`型
- `age`プロパティは`number`型

### より複雑な例

```typescript
let product: { name: string; price: number; inStock: boolean } = {
  name: "ノートパソコン",
  price: 89800,
  inStock: true
};

console.log(product.name);  // "ノートパソコン"
console.log(product.price);  // 89800
```

### 間違った使い方（エラーになる）

```typescript
let user: { name: string; age: number } = {
  name: "太郎",
  age: 25
};

console.log(user.email);  // エラー！ emailプロパティは定義されていない

user.age = "25歳";  // エラー！ stringはnumberに代入できない
```

### オプショナルなプロパティ

プロパティ名の後ろに`?`をつけると、そのプロパティは省略可能になります。

```typescript
let user: { name: string; age?: number } = {
  name: "太郎"
  // ageは省略してもOK
};

let user2: { name: string; age?: number } = {
  name: "花子",
  age: 20
  // ageを指定してもOK
};
```

## 特殊な型

### any（何でもOK）

`any`は「どんな型でもOK」という型です。

```typescript
let value: any = "文字列";
value = 123;        // OK
value = true;       // OK
value = [1, 2, 3];  // OK
```

**注意：** `any`を使うと型チェックが無効になるので、TypeScriptの恩恵を受けられません。できるだけ使わないようにしましょう。

### null と undefined

`null`と`undefined`も型として使えます。

```typescript
let value1: null = null;
let value2: undefined = undefined;
```

ただし、実際にはこの書き方はあまり使いません。後述の「ユニオン型」と組み合わせて使うことが多いです。

## ユニオン型（複数の型を許可）

「AまたはB」という型を定義できます。`|`（パイプ）記号を使います。

### 基本的な使い方

```typescript
let value: string | number;

value = "文字列";  // OK
value = 123;       // OK
value = true;      // エラー！ booleanは許可されていない
```

### 実用的な例

```typescript
// IDは数値か文字列のどちらか
let userId: number | string;

userId = 123;      // OK
userId = "abc123"; // OK

// 関数の引数にも使える
function printId(id: number | string) {
  console.log("ID: " + id);
}

printId(123);      // OK
printId("abc123"); // OK
```

### null許可の例

```typescript
let name: string | null = "太郎";
name = null;  // OK（nullを許可している）

// これは便利！値がないかもしれないときに使う
let middleName: string | null = null;  // ミドルネームは無いかもしれない
```

## 型推論（型を書かなくてもOKな場合）

TypeScriptは賢いので、値から型を自動で推測してくれます。

```typescript
// 型を明示的に書く
let age: number = 25;

// 型を書かなくても、25から「これはnumber型だ」と推測してくれる
let age2 = 25;  // 自動的にnumber型になる
```

### 型推論の例

```typescript
let name = "太郎";           // 自動的にstring型
let age = 25;                // 自動的にnumber型
let isStudent = true;        // 自動的にboolean型
let scores = [80, 90, 75];   // 自動的にnumber[]型
```

**でも、明示的に書いた方が分かりやすい場合もあります：**

```typescript
// これは分かりにくい
let userId = 123;

// これは分かりやすい（数値か文字列のどちらも入る可能性があることが明示される）
let userId: number | string = 123;
```

**学習の段階では、型を明示的に書く練習をすることをおすすめします。** 慣れてきたら、型推論を活用しましょう。

## よくある間違いと対処法

### 間違い1：型を間違える

```typescript
let age: number = "25";  // エラー！
```

**対処法：** 値の型を確認しましょう。`"25"`は文字列なので、`string`型です。

```typescript
let age: number = 25;      // 正しい
let ageText: string = "25"; // 正しい
```

### 間違い2：存在しないプロパティにアクセス

```typescript
let user: { name: string; age: number } = {
  name: "太郎",
  age: 25
};

console.log(user.email);  // エラー！
```

**対処法：** オブジェクトの型定義を確認し、存在するプロパティにアクセスしましょう。

### 間違い3：配列に間違った型の値を追加

```typescript
let numbers: number[] = [1, 2, 3];
numbers.push("4");  // エラー！
```

**対処法：** 配列の型を確認し、正しい型の値を追加しましょう。

```typescript
let numbers: number[] = [1, 2, 3];
numbers.push(4);  // 正しい
```

## 練習問題

実際に手を動かして試してみましょう。

### 問題1：基本型

以下の変数を適切な型で宣言してください。

```typescript
// あなたの名前
let myName = ?

// あなたの年齢
let myAge = ?

// 学生かどうか
let isStudent = ?
```

**答え：**

```typescript
let myName: string = "太郎";  // 自分の名前に変えてください
let myAge: number = 25;       // 自分の年齢に変えてください
let isStudent: boolean = true; // 学生ならtrue、そうでなければfalse
```

### 問題2：配列

好きな果物を3つ、配列で宣言してください。

**答え：**

```typescript
let favoriteFruits: string[] = ["りんご", "バナナ", "オレンジ"];
```

### 問題3：オブジェクト

本の情報を持つオブジェクトを作成してください。プロパティは`title`（タイトル）、`author`（著者）、`pages`（ページ数）です。

**答え：**

```typescript
let book: { title: string; author: string; pages: number } = {
  title: "TypeScript入門",
  author: "山田太郎",
  pages: 300
};
```

## まとめ

- **基本型**：`string`（文字列）、`number`（数値）、`boolean`（真偽値）
- **配列型**：`number[]`または`Array<number>`
- **オブジェクト型**：`{ name: string; age: number }`
- **ユニオン型**：`string | number`（AまたはB）
- **any**：何でもOKだが、使わない方が良い
- **型推論**：値から型を自動推測してくれる（でも明示的に書く練習も大切）

型を理解することで、TypeScriptの力を最大限に引き出せます。最初は面倒に感じるかもしれませんが、慣れれば自然に書けるようになります。

次のページでは、「関数」に型をつける方法を学びましょう。
