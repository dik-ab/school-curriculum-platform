---
title: "TypeScript応用: ライブラリの型を読めるようになる"
parent: TypeScript基礎
nav_order: 8
---

# TypeScript応用: ライブラリの型を読めるようになる

このページは応用編です。

React、NestJS、Laravelのようなフレームワークを使ってWebアプリを作るだけなら、ここにある内容を全部覚えていなくても開発はできます。まず必要なのは、基本型、関数、オブジェクト、APIレスポンス、例外処理を読めることです。

それでも応用的な型を知っておくと、次の場面で役に立ちます。

- ReactやUIライブラリの型エラーを読める
- NestJSのDTO、レスポンス型、共通レスポンス型を整理できる
- ライブラリの型定義を見ても怖くなくなる
- 似た型を何度も書かずに、保守しやすい型を作れる

> 実務では、応用型を毎日自作する必要はありません。まずは「読める」ことを目標にしてください。自作は、重複した型が増えて困ったときで十分です。

## 基礎編と応用編の境界

| 分類 | できるようにしたいこと | 例 |
| --- | --- | --- |
| 基礎 | 普通の画面とAPI連携を作る | `type User = { id: number; name: string }` |
| 応用 | 型から別の型を作る、ライブラリ型を読む | `keyof`, `as const`, `satisfies`, Generics |

## typeof と keyof

`typeof` は、値から型を取り出します。

`keyof` は、オブジェクト型のキーだけを取り出します。

```typescript
const user = {
  id: 1,
  name: "Sato",
  role: "admin"
};

type User = typeof user;
type UserKey = keyof User;
```

コードの意味です。

- `const user = { ... }` は、実際のユーザーデータです。
- `type User = typeof user` は、`user` という値から型を作ります。
- `type UserKey = keyof User` は、`"id" | "name" | "role"` というキーのユニオン型を作ります。

実務では、管理画面のテーブルで「どの列を表示するか」を安全に扱うときに使えます。

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

function getValue(user: User, key: keyof User): string | number {
  return user[key];
}

const user: User = {
  id: 1,
  name: "Sato",
  email: "sato@example.com"
};

console.log(getValue(user, "name"));
```

コードの意味です。

- `key: keyof User` により、`key` には `"id"`、`"name"`、`"email"` だけを渡せます。
- `return user[key]` は、指定されたキーの値を返します。
- `getValue(user, "name")` は有効です。
- `getValue(user, "age")` は、`age` が `User` に存在しないので型エラーになります。

## as const

`as const` は、値を「変更しない具体的な値」として扱いたいときに使います。

```typescript
const statuses = ["draft", "published", "archived"] as const;

type Status = typeof statuses[number];
```

コードの意味です。

- `statuses` は、記事の状態一覧です。
- `as const` を付けると、配列の中身がただの `string` ではなく、具体的な `"draft"`、`"published"`、`"archived"` として扱われます。
- `typeof statuses[number]` は、配列の要素型を取り出します。
- `Status` は `"draft" | "published" | "archived"` になります。

実務では、タブ名、ルート名、権限名、ステータス名のように「決まった文字列だけ許可したい」場面で使います。

```typescript
function labelStatus(status: Status): string {
  if (status === "draft") {
    return "下書き";
  }
  if (status === "published") {
    return "公開中";
  }
  return "アーカイブ済み";
}

console.log(labelStatus("draft"));
```

- `status: Status` により、引数は3種類の文字列だけになります。
- `"deleted"` のような未定義の状態は渡せません。
- `if` で状態ごとの表示文言に変換しています。

## satisfies

`satisfies` は、値が必要な型を満たしているか確認しつつ、値の具体性を残したいときに使います。

```typescript
type RouteConfig = Record<string, { path: string; auth: boolean }>;

const routes = {
  home: { path: "/", auth: false },
  users: { path: "/users", auth: true }
} as const satisfies RouteConfig;

type RouteName = keyof typeof routes;
type UsersPath = typeof routes.users.path;
```

コードの意味です。

- `RouteConfig` は、ルート定義の形です。
- `Record<string, ...>` は「文字列キーを持つオブジェクト」を表します。
- `routes` は、実際のルート定義です。
- `satisfies RouteConfig` により、`path` や `auth` の書き忘れを検出できます。
- `as const` により、`"/users"` のような具体的な文字列も残ります。
- `RouteName` は `"home" | "users"` になります。
- `UsersPath` は `string` ではなく `"/users"` になります。

> 実務では、設定オブジェクト、ルーティング、権限定義、メニュー定義で便利です。`as 型` で無理に型を合わせるより、`satisfies` の方が間違いに気づきやすいです。

## Generics

Genericsは「中身の型を後から決める仕組み」です。

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
};

type User = {
  id: number;
  name: string;
};

const response: ApiResponse<User> = {
  data: { id: 1, name: "Sato" },
  status: 200
};
```

コードの意味です。

- `ApiResponse<T>` の `T` は、後から差し込む型です。
- `data: T` は、レスポンスの中身が `T` になるという意味です。
- `ApiResponse<User>` と書くと、`T` が `User` に置き換わります。
- `response.data.name` は安全に使えます。

NestJSやReactでは、`Promise<User>`、`Array<User>`、`UseQueryResult<User>` のような形でGenericsをよく見ます。

## Utility Types

TypeScriptには、既存の型から別の型を作る便利な型があります。

```typescript
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type PublicUser = Omit<User, "password">;
type UpdateUserInput = Partial<Pick<User, "name" | "email">>;
```

コードの意味です。

- `User` は、内部で使うユーザー型です。
- `Omit<User, "password">` は、`password` を除いた型を作ります。
- `PublicUser` は、APIレスポンスとして返しやすい型です。
- `Pick<User, "name" | "email">` は、`name` と `email` だけを取り出します。
- `Partial<...>` は、すべてのプロパティを省略可能にします。
- `UpdateUserInput` は、プロフィール更新フォームの入力型として使えます。

## Mapped Types

Mapped Typesは、既存の型のキーを使って新しい型を作る仕組みです。

```typescript
type UserInput = {
  name: string;
  age: number;
};

type FormState<T> = {
  [K in keyof T]: {
    value: T[K];
    error: string | null;
  };
};

type UserFormState = FormState<UserInput>;
```

コードの意味です。

- `UserInput` は、フォームで入力する値の型です。
- `FormState<T>` は、どんな入力型にも使えるフォーム状態の型です。
- `[K in keyof T]` は、`T` のキーを1つずつ取り出します。
- `value: T[K]` は、その項目の値の型をそのまま使います。
- `error: string | null` は、各項目にエラーメッセージを持たせます。
- `UserFormState` は、`name` と `age` それぞれに `value` と `error` を持つ型になります。

## Conditional Types と infer

Conditional Typesは、型の条件分岐です。

`infer` は、型の中から一部を取り出すときに使います。

```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ApiResponse = Promise<{ id: number; name: string }>;

type User = UnwrapPromise<ApiResponse>;
```

コードの意味です。

- `UnwrapPromise<T>` は、Promiseの中身を取り出す型です。
- `T extends Promise<infer U>` は「`T` が `Promise<何か>` なら、その何かを `U` と呼ぶ」という意味です。
- `? U : T` は、Promiseなら中身の `U`、Promiseでなければ `T` を返します。
- `User` は `{ id: number; name: string }` になります。

実務では、自分で複雑なConditional Typesを書くことは少なめです。ただし、ライブラリの型定義ではよく出てくるため、読めるとエラー調査が楽になります。

## Result型

例外処理の応用として、失敗を `throw` せずに値として返す設計があります。

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function parsePositiveNumber(input: string): Result<number> {
  const value = Number(input);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, message: "正の数を入力してください" };
  }

  return { ok: true, value };
}
```

コードの意味です。

- `Result<T>` は、成功と失敗のどちらかを表す型です。
- `{ ok: true; value: T }` は成功です。
- `{ ok: false; message: string }` は失敗です。
- `parsePositiveNumber` は、文字列を正の数に変換します。
- 不正な入力なら例外を投げず、失敗オブジェクトを返します。
- 成功なら `value` に数値を入れて返します。

使う側です。

```typescript
const result = parsePositiveNumber("10");

if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.message);
}
```

- `if (result.ok)` の中では、TypeScriptが成功側だと判断します。
- 成功側では `result.value` を使えます。
- 失敗側では `result.message` を使えます。

フォーム入力のように失敗がよく起きる処理では、Result型の方が扱いやすいことがあります。

## 練習問題

### 問題1: as constからStatus型を作る

次の配列から `Status` 型を作り、`labelStatus` 関数を完成させてください。

```typescript
const statuses = ["draft", "published", "archived"] as const;
```

**解答例:**

```typescript
const statuses = ["draft", "published", "archived"] as const;

type Status = typeof statuses[number];

function labelStatus(status: Status): string {
  if (status === "draft") {
    return "下書き";
  }
  if (status === "published") {
    return "公開中";
  }
  return "アーカイブ済み";
}
```

`typeof statuses[number]` により、配列の要素だけを許可する型を作っています。

### 問題2: satisfiesでルート定義を作る

`RouteConfig` を満たす `routes` を作り、ルート名の型 `RouteName` を作ってください。

**解答例:**

```typescript
type RouteConfig = Record<string, { path: string; auth: boolean }>;

const routes = {
  home: { path: "/", auth: false },
  users: { path: "/users", auth: true }
} as const satisfies RouteConfig;

type RouteName = keyof typeof routes;
```

`satisfies` により、`auth` の書き忘れなどを検出できます。

### 問題3: FormState型を作る

任意の入力型 `T` から、各項目に `value` と `error` を持つ型を作ってください。

**解答例:**

```typescript
type FormState<T> = {
  [K in keyof T]: {
    value: T[K];
    error: string | null;
  };
};
```

`[K in keyof T]` が、元の型のキーを1つずつ新しい型に変換しています。

## まとめ

- 応用型は、最初から全部書ける必要はない
- `keyof`、`typeof`、`as const` は、実務でも使いやすい
- `satisfies` は、設定オブジェクトのミスを減らす
- GenericsやUtility Typesは、React/NestJSの型を読む土台になる
- Mapped Types、Conditional Types、`infer` は、まず読めることを目標にする
- 失敗がよく起きる処理では、Result型のように失敗を値として返す設計もある
