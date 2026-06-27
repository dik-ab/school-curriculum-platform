---
title: 実践練習
parent: TypeScript基礎
nav_order: 7
---

# 実践練習

ここまで学んだTypeScriptの知識を、実際に手を動かして定着させましょう。全ての問題を、**実際にプロジェクトを作成してコードを書き、実行して確認**することをおすすめします。

## 練習の進め方

### 1. プロジェクトを作成

まず、練習用のプロジェクトを作成しましょう。

```bash
mkdir ts-practice
cd ts-practice
npm init -y
npm install --save-dev typescript
npx tsc --init
mkdir src
```

`tsconfig.json`を以下のように設定：

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

### 2. 問題ごとにファイルを作成

各問題用に、`src/exercise01.ts`、`src/exercise02.ts`のようにファイルを作成します。

### 3. コンパイルと実行

```bash
# コンパイル
npx tsc

# 実行（問題番号に応じて変更）
node dist/exercise01.js
```

または、自動コンパイルモードを使って：

```bash
# ターミナル1
npx tsc -w

# ターミナル2
node dist/exercise01.js
```

それでは、練習問題に取り組んでみましょう！

## 問題1：自己紹介プログラム

あなたの情報を変数に格納し、表示するプログラムを作成してください。

**要件：**
- 名前（string型）
- 年齢（number型）
- 学生かどうか（boolean型）
- これらの情報をコンソールに表示

**期待される出力例：**
```
名前: 太郎
年齢: 20歳
学生: はい
```

**ヒント：**

- 変数に型をつけて宣言しましょう
- テンプレート文字列（`` `文字列${変数}` ``）を使うと便利です
- boolean値は、三項演算子で「はい」「いいえ」に変換できます

**解答例：**

**src/exercise01.ts:**

```typescript
const myName: string = "太郎";
const age: number = 20;
const isStudent: boolean = true;

console.log(`名前: ${myName}`);
console.log(`年齢: ${age}歳`);
console.log(`学生: ${isStudent ? "はい" : "いいえ"}`);
```

**実行：**

```bash
npx tsc
node dist/exercise01.js
```

**出力：**
```
名前: 太郎
年齢: 20歳
学生: はい
```

## 問題2：消費税計算プログラム

商品の価格を受け取り、消費税込みの価格を計算する関数を作成してください。

**要件：**
- 関数名：`calculateTax`
- 引数：`price`（number型）
- 返り値：税込み価格（number型）
- 消費税率は10%（0.1）とする

**期待される出力例：**
```
1000円の税込み価格: 1100円
2500円の税込み価格: 2750円
```

**ヒント：**

- 税込み価格 = 元の価格 × 1.1
- 関数の引数と返り値に型をつけましょう

**解答例：**

**src/exercise02.ts:**

```typescript
function calculateTax(price: number): number {
  return price * 1.1;
}

console.log(`1000円の税込み価格: ${calculateTax(1000)}円`);
console.log(`2500円の税込み価格: ${calculateTax(2500)}円`);
```

**実行：**

```bash
npx tsc
node dist/exercise02.js
```

**出力：**
```
1000円の税込み価格: 1100円
2500円の税込み価格: 2750円
```

## 問題3：配列の平均値を計算

数値の配列を受け取り、平均値を返す関数を作成してください。

**要件：**
- 関数名：`average`
- 引数：`numbers`（number[]型）
- 返り値：平均値（number型）

**期待される出力例：**
```
[80, 90, 70]の平均: 80
[100, 85, 92, 88]の平均: 91.25
```

**ヒント：**

- 合計を計算してから、要素数で割ります
- 配列の要素数は`配列.length`で取得できます
- 合計は、ループで計算するか、`reduce`メソッドを使います

**解答例：**

**src/exercise03.ts:**

```typescript
function average(numbers: number[]): number {
  let sum = 0;
  for (let num of numbers) {
    sum += num;
  }
  return sum / numbers.length;
}

console.log(`[80, 90, 70]の平均: ${average([80, 90, 70])}`);
console.log(`[100, 85, 92, 88]の平均: ${average([100, 85, 92, 88])}`);
```

**または、reduceを使った方法：**

```typescript
function average(numbers: number[]): number {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

console.log(`[80, 90, 70]の平均: ${average([80, 90, 70])}`);
console.log(`[100, 85, 92, 88]の平均: ${average([100, 85, 92, 88])}`);
```

**実行：**

```bash
npx tsc
node dist/exercise03.js
```

**出力：**
```
[80, 90, 70]の平均: 80
[100, 85, 92, 88]の平均: 91.25
```

## 問題4：BMI計算プログラム

体重（kg）と身長（m）を受け取り、BMIを計算する関数を作成してください。

**要件：**
- 関数名：`calculateBMI`
- 引数：`weight`（number型、単位：kg）、`height`（number型、単位：m）
- 返り値：BMI（number型）
- BMI = 体重 ÷ (身長 × 身長)

**期待される出力例：**
```
体重70kg、身長1.75mのBMI: 22.86
```

**解答例：**

**src/exercise04.ts:**

```typescript
function calculateBMI(weight: number, height: number): number {
  return weight / (height * height);
}

const weight = 70;
const height = 1.75;
const bmi = calculateBMI(weight, height);

console.log(`体重${weight}kg、身長${height}mのBMI: ${bmi.toFixed(2)}`);
```

**実行：**

```bash
npx tsc
node dist/exercise04.js
```

**出力：**
```
体重70kg、身長1.75mのBMI: 22.86
```

## 問題5：ユーザー情報の管理

ユーザー情報を表すオブジェクト型を定義し、ユーザー情報を整形して表示する関数を作成してください。

**要件：**
- ユーザー情報：`name`（string）、`age`（number）、`email`（string）
- 関数名：`formatUser`
- 引数：ユーザー情報のオブジェクト
- 返り値：整形された文字列（string型）

**期待される出力例：**
```
ユーザー情報: 太郎 (25歳) - taro@example.com
ユーザー情報: 花子 (22歳) - hanako@example.com
```

**ヒント：**

- オブジェクト型は`{ プロパティ名: 型 }`で定義します
- 関数の引数にもオブジェクト型を指定できます

**解答例：**

**src/exercise05.ts:**

```typescript
function formatUser(user: { name: string; age: number; email: string }): string {
  return `ユーザー情報: ${user.name} (${user.age}歳) - ${user.email}`;
}

const user1 = {
  name: "太郎",
  age: 25,
  email: "taro@example.com"
};

const user2 = {
  name: "花子",
  age: 22,
  email: "hanako@example.com"
};

console.log(formatUser(user1));
console.log(formatUser(user2));
```

**実行：**

```bash
npx tsc
node dist/exercise05.js
```

**出力：**
```
ユーザー情報: 太郎 (25歳) - taro@example.com
ユーザー情報: 花子 (22歳) - hanako@example.com
```

## 問題6：成績判定プログラム

点数を受け取り、成績（A, B, C, D, F）を返す関数を作成してください。

**要件：**
- 関数名：`getGrade`
- 引数：`score`（number型、0〜100）
- 返り値：成績（string型）
- 判定基準：
  - 90点以上：A
  - 80点以上90点未満：B
  - 70点以上80点未満：C
  - 60点以上70点未満：D
  - 60点未満：F

**期待される出力例：**
```
95点: A
82点: B
75点: C
65点: D
50点: F
```

**ヒント：**

- `if`文または`if-else`文を使います
- 点数が高い方から順に判定すると簡単です

**解答例：**

**src/exercise06.ts:**

```typescript
function getGrade(score: number): string {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else if (score >= 60) {
    return "D";
  } else {
    return "F";
  }
}

console.log(`95点: ${getGrade(95)}`);
console.log(`82点: ${getGrade(82)}`);
console.log(`75点: ${getGrade(75)}`);
console.log(`65点: ${getGrade(65)}`);
console.log(`50点: ${getGrade(50)}`);
```

**実行：**

```bash
npx tsc
node dist/exercise06.js
```

**出力：**
```
95点: A
82点: B
75点: C
65点: D
50点: F
```

## 問題7：FizzBuzz

1から30までの数字を表示するプログラムを作成してください。ただし：
- 3の倍数のときは数字の代わりに「Fizz」
- 5の倍数のときは「Buzz」
- 3と5の両方の倍数のときは「FizzBuzz」

**期待される出力例：**
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
...
```

**ヒント：**

- `for`ループで1から30まで繰り返します
- 割り算の余りは`%`演算子で求められます（例：`15 % 3 === 0`なら3の倍数）
- 3と5の両方の倍数（15の倍数）を最初にチェックすることが重要です

**解答例：**

**src/exercise07.ts:**

```typescript
function fizzBuzz(): void {
  for (let i = 1; i <= 30; i++) {
    if (i % 15 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

fizzBuzz();
```

**実行：**

```bash
npx tsc
node dist/exercise07.js
```

**出力：**
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz
Fizz
22
23
Fizz
Buzz
26
Fizz
28
29
FizzBuzz
```

## 問題8：商品の合計金額計算

商品の配列を受け取り、合計金額を計算する関数を作成してください。

**要件：**
- 商品の型：`{ name: string; price: number; quantity: number }`
- 関数名：`calculateTotal`
- 引数：商品の配列
- 返り値：合計金額（number型）
- 各商品の金額 = 価格 × 数量

**期待される出力例：**
```
合計金額: 1260円
```

**ヒント：**

- 配列をループして、各商品の`price × quantity`を合計します
- `for...of`ループや`reduce`メソッドが使えます

**解答例：**

**src/exercise08.ts:**

```typescript
type Product = {
  name: string;
  price: number;
  quantity: number;
};

function calculateTotal(products: Product[]): number {
  let total = 0;
  for (let product of products) {
    total += product.price * product.quantity;
  }
  return total;
}

const cart: Product[] = [
  { name: "ノート", price: 200, quantity: 3 },
  { name: "ペン", price: 100, quantity: 5 },
  { name: "消しゴム", price: 80, quantity: 2 }
];

console.log(`合計金額: ${calculateTotal(cart)}円`);
```

**または、reduceを使った方法：**

```typescript
function calculateTotal(products: Product[]): number {
  return products.reduce((total, product) => {
    return total + (product.price * product.quantity);
  }, 0);
}
```

**実行：**

```bash
npx tsc
node dist/exercise08.js
```

**出力：**
```
合計金額: 1260円
```

**内訳：**
- ノート: 200円 × 3個 = 600円
- ペン: 100円 × 5本 = 500円
- 消しゴム: 80円 × 2個 = 160円
- 合計: 1260円

## 問題9：最大値・最小値を見つける

数値の配列を受け取り、最大値と最小値を返す関数を作成してください。

**要件：**
- 関数名：`findMinMax`
- 引数：`numbers`（number[]型）
- 返り値：`{ min: number; max: number }`型のオブジェクト

**期待される出力例：**
```
最小値: 10, 最大値: 95
```

**解答例：**

**src/exercise09.ts:**

```typescript
function findMinMax(numbers: number[]): { min: number; max: number } {
  let min = numbers[0];
  let max = numbers[0];

  for (let num of numbers) {
    if (num < min) {
      min = num;
    }
    if (num > max) {
      max = num;
    }
  }

  return { min, max };
}

const scores = [85, 92, 78, 95, 88, 10, 73];
const result = findMinMax(scores);

console.log(`最小値: ${result.min}, 最大値: ${result.max}`);
```

**または、Math.minとMath.maxを使った方法：**

```typescript
function findMinMax(numbers: number[]): { min: number; max: number } {
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}
```

**実行：**

```bash
npx tsc
node dist/exercise09.js
```

**出力：**
```
最小値: 10, 最大値: 95
```

## 問題10：文字列を逆順にする

文字列を受け取り、逆順にした文字列を返す関数を作成してください。

**要件：**
- 関数名：`reverseString`
- 引数：`str`（string型）
- 返り値：逆順の文字列（string型）

**期待される出力例：**
```
"Hello" → "olleH"
"TypeScript" → "tpircSepyT"
```

**ヒント：**

- 文字列を配列に変換（`split("")`）
- 配列を逆順にする（`reverse()`）
- 配列を文字列に戻す（`join("")`）

**解答例：**

**src/exercise10.ts:**

```typescript
function reverseString(str: string): string {
  return str.split("").reverse().join("");
}

console.log(`"Hello" → "${reverseString("Hello")}"`);
console.log(`"TypeScript" → "${reverseString("TypeScript")}"`);
```

**実行：**

```bash
npx tsc
node dist/exercise10.js
```

**出力：**
```
"Hello" → "olleH"
"TypeScript" → "tpircSepyT"
```

## 問題11：入力値の検証と例外処理

文字列を受け取り、1以上100以下の整数なら点数として返す関数を作成してください。不正な値の場合は例外を投げ、呼び出し側でメッセージを表示してください。

**要件：**

- 関数名：`parseScore`
- 引数：`input`（string型）
- 返り値：点数（number型）
- 1以上100以下の整数でない場合は `Error` を投げる
- `try-catch` でエラーメッセージを表示する

**期待される出力例：**
```
点数: 85
点数は1以上100以下の整数で入力してください
```

**ヒント：**

- 文字列から数値への変換は `Number(input)` を使います
- 整数かどうかは `Number.isInteger(value)` で確認できます
- `catch` で受け取った値は `unknown` として扱い、`instanceof Error` で確認しましょう

**解答例：**

**src/exercise11.ts:**

```typescript
function parseScore(input: string): number {
  const score = Number(input);

  if (!Number.isInteger(score) || score < 1 || score > 100) {
    throw new Error("点数は1以上100以下の整数で入力してください");
  }

  return score;
}

for (const input of ["85", "abc"]) {
  try {
    const score = parseScore(input);
    console.log(`点数: ${score}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("不明なエラーが発生しました");
    }
  }
}
```

**実行：**

```bash
npx tsc
node dist/exercise11.js
```

**出力：**
```
点数: 85
点数は1以上100以下の整数で入力してください
```

## おめでとうございます！

全ての練習問題を解き終えたあなたは、TypeScriptの基礎を確実に身につけました！

### 次のステップ

- **より高度な型**：Union型、Intersection型、Genericsなど
- **例外処理の設計**：throwするか、結果を値として返すか
- **インターフェース**：オブジェクトの型をより柔軟に定義
- **クラス**：オブジェクト指向プログラミング
- **モジュール**：コードを分割して管理
- **実践的なプロジェクト**：Webアプリケーション、APIサーバーなど

TypeScriptの基礎を理解すると、Reactのpropsやstate、APIレスポンスの型、Javaなど他の型付き言語の学習にも進みやすくなります。次のステップでは、実際の画面やAPIと組み合わせて使っていきましょう。

## 復習が必要な場合

もし分からないことがあれば、以下のページに戻って復習しましょう：

- [TypeScriptとは？](/typescript/what_is_typescript/)
- [コンパイルとは？](/typescript/compile/)
- [TypeScriptの基本型](/typescript/basic_types/)
- [関数と型](/typescript/functions/)
- [Hello World プロジェクト](/typescript/hello_world/)
- [例外処理とエラーハンドリング](/typescript/error_handling/)
- [TypeScript応用: ライブラリの型を読めるようになる](/typescript/advanced/)

**何度も読み返すことで、理解が深まります。** 焦らず、自分のペースで進めましょう。
