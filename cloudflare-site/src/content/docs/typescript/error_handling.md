---
title: 例外処理とエラーハンドリング
parent: TypeScript基礎
nav_order: 6
---

# 例外処理とエラーハンドリング

プログラムは、いつも期待どおりに動くとは限りません。

例えば、数値に変換できない文字列が渡された、API通信に失敗した、必要なデータが見つからない、といった場面があります。このような失敗に対応するための仕組みが、例外処理とエラーハンドリングです。

TypeScriptの例外処理は、実行時にはJavaScriptの仕組みとして動きます。TypeScriptは型で多くのミスを事前に防げますが、外部から入ってくる値や通信失敗のような問題は実行時に起きます。

## throw

処理を続けられない異常が起きたときは、`throw` で例外を投げます。

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("0で割ることはできません");
  }

  return a / b;
}
```

`throw` が実行されると、その場で通常の処理は止まり、呼び出し元の `catch` に処理が移ります。

## try-catch

例外が起きる可能性のある処理は、`try-catch` で受け止めます。

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("0で割ることはできません");
  }

  return a / b;
}

try {
  const result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.log("計算に失敗しました");
}
```

`try` の中で例外が起きると、例外が起きた後の処理は実行されません。

## catchした値はunknownとして扱う

TypeScriptでは、`catch` で受け取った値を `unknown` として扱うのが安全です。JavaScriptでは `throw "error"` のように、`Error` オブジェクト以外も投げられるからです。

```typescript
try {
  throw new Error("読み込みに失敗しました");
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log("不明なエラーが発生しました");
  }
}
```

`unknown` は「型がまだ分からない値」です。`instanceof Error` で確認してから `message` を使うと、安全に扱えます。

## finally

`finally` は、例外が起きても起きなくても最後に実行されます。

```typescript
function saveLog(message: string): void {
  try {
    console.log("保存開始");
    console.log(message);
  } catch (error: unknown) {
    console.log("保存に失敗しました");
  } finally {
    console.log("保存処理を終了します");
  }
}
```

実務では、ローディング表示を止める、接続を閉じる、一時的な状態を戻す、といった後片付けで使います。

## 入力値の検証

外部から入ってくる値は、型注釈だけでは安全になりません。

```typescript
function parseAge(input: string): number {
  const age = Number(input);

  if (!Number.isInteger(age) || age < 0) {
    throw new Error("年齢は0以上の整数で入力してください");
  }

  return age;
}
```

`input` は `string` 型ですが、その中身が `"20"` なのか `"abc"` なのかは実行するまで分かりません。ユーザー入力、URLパラメータ、APIレスポンス、ファイルの中身は必ず検証します。

## API通信のエラーハンドリング

`fetch` は、404や500のレスポンスでは自動的に例外を投げません。通信自体は成功しているためです。

```typescript
type User = {
  id: number;
  name: string;
};

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error(`ユーザーの取得に失敗しました: ${response.status}`);
  }

  const user = await response.json() as User;
  return user;
}
```

API通信では、少なくとも次の2種類を分けて考えます。

- サーバーからエラーレスポンスが返った: `response.ok` を確認する
- 通信そのものに失敗した: `try-catch` で捕まえる

```typescript
async function showUserName(id: number): Promise<void> {
  try {
    const user = await fetchUser(id);
    console.log(user.name);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("不明なエラーが発生しました");
    }
  }
}
```

## Errorを返すか、throwするか

失敗を表す方法は、大きく2つあります。

1つ目は、例外を投げる方法です。

```typescript
function requireName(name: string): string {
  if (name.trim() === "") {
    throw new Error("名前は必須です");
  }

  return name;
}
```

2つ目は、成功か失敗かを値として返す方法です。

```typescript
type ParseResult =
  | { ok: true; value: number }
  | { ok: false; message: string };

function parsePositiveNumber(input: string): ParseResult {
  const value = Number(input);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, message: "正の数を入力してください" };
  }

  return { ok: true, value };
}
```

基礎編では、まず `throw` と `try-catch` を使えるようになれば十分です。フォーム入力のバリデーションのように、失敗がよく起きる処理では「結果を値として返す」設計もよく使われます。これは応用編で詳しく扱うとよい内容です。

## やってはいけない例

何もせずにエラーを握りつぶすのは避けます。

```typescript
try {
  const result = divide(10, 0);
  console.log(result);
} catch (error) {
}
```

これでは、何が起きたのか分からなくなります。

また、`catch` で受け取った値を確認せずに使うのも危険です。

```typescript
try {
  throw "error";
} catch (error: unknown) {
  // error.message は安全に使えない
}
```

`unknown` の値は、型を確認してから使います。

## 練習問題

### 問題1: 年齢の変換

文字列を受け取り、0以上の整数なら `number` として返す `parseAge` 関数を作ってください。

**要件:**

- 引数は `input: string`
- 返り値は `number`
- 0以上の整数でない場合は `Error` を投げる
- エラーメッセージは `"年齢は0以上の整数で入力してください"`

**解答例:**

```typescript
function parseAge(input: string): number {
  const age = Number(input);

  if (!Number.isInteger(age) || age < 0) {
    throw new Error("年齢は0以上の整数で入力してください");
  }

  return age;
}

try {
  console.log(parseAge("20"));
  console.log(parseAge("abc"));
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

### 問題2: APIレスポンスの確認

`Response` を受け取り、成功していなければ例外を投げる `assertOk` 関数を作ってください。

**要件:**

- 引数は `response: Response`
- 返り値は `void`
- `response.ok` が `false` の場合は `Error` を投げる
- エラーメッセージに `response.status` を含める

**解答例:**

```typescript
function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error(`HTTPエラー: ${response.status}`);
  }
}
```

`fetch` を使うReactアプリでは、このような小さな関数を作っておくと、毎回同じ確認処理を書かずに済みます。

## まとめ

- 失敗した処理を止めたいときは `throw new Error(...)` を使う
- 例外を受け止めるには `try-catch` を使う
- `catch` の値は `unknown` として扱い、`instanceof Error` で確認する
- `fetch` は404や500では自動的に例外を投げない
- エラーを空の `catch` で握りつぶさない
- 入力値やAPIレスポンスは、型注釈だけでなく実行時の検証も必要
