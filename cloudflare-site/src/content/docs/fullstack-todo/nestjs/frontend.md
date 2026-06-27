---
title: "フロントエンド: 画面の実装"
parent: Todo NestJS + Prisma版
nav_order: 5
section_key: todo-nestjs
section_title: Todo NestJS + Prisma版
---

# フロントエンド: 画面の実装

このページでは、[セットアップ](/fullstack-todo/nestjs/setup/)で作成した `frontend/` プロジェクトに、Todoアプリの画面を実装します。一覧表示・追加・完了切替・削除の4機能を、[React基礎](/react/)で学んだ `useState` / `useEffect` / `fetch` を組み合わせて作ります。

先に1つ予告しておきます。このページの最後で画面とAPIを繋いで動かすと、**エラーが出ます**。これは手順のミスではなく、別オリジン間の通信に必ず立ちはだかる「CORS」という仕組みによるものです。あえてエラーを体験してから、次の[つなぎ込みのページ](/fullstack-todo/nestjs/integration/)で原因と解決方法をじっくり学びます。

## 学習目標

- APIのレスポンスに対応するTypeScriptの型を定義できる
- API呼び出しを専用のモジュールに分離し、画面のコードと分けられる
- `useState` / `useEffect` でAPIから取得したデータを画面に表示できる
- 追加・完了切替・削除のそれぞれでAPIを呼び、画面の状態を更新できる
- ローディング中・エラー時の表示を実装できる

## 画面の構成と作るファイル

作る画面は1つですが、コードは役割ごとにファイルを分けます。

```
frontend/src/
├── main.tsx          # （既存のまま）エントリポイント
├── App.tsx           # （書き換え）画面全体のコンポーネント
├── App.css           # （書き換え）スタイル
├── types/
│   └── todo.ts       # Todoの型定義
└── api/
    └── todos.ts      # API呼び出し関数（fetchをまとめる）
```

ポイントは `api/todos.ts` の存在です。`fetch` の呼び出しをコンポーネントの中に直接書くこともできますが、**「APIとどう通信するか」と「画面をどう表示するか」は別の関心事**なので、ファイルを分けます。こうすると、コンポーネント側は「`fetchTodos()` を呼べばTodoの配列が返ってくる」とだけ考えればよくなり、URLやヘッダーの詳細を知らなくて済みます。

## Todoの型を定義する

まず、APIが返すJSONに対応する型を定義します。[バックエンド](/fullstack-todo/nestjs/backend/)のcurl確認で見たレスポンスを思い出してください。

```json
{"id":1,"title":"牛乳を買う","completed":false,"createdAt":"2026-06-12T01:23:45.678Z","updatedAt":"2026-06-12T01:23:45.678Z"}
```

これをTypeScriptの型にします。

**`frontend/src/types/todo.ts`**

```typescript
export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
```

**コード解説**

- 各プロパティは、Prismaのモデル定義（[セットアップ](/fullstack-todo/nestjs/setup/)参照）とAPIのレスポンスに対応しています
- `createdAt` / `updatedAt` が `string` であることに注意してください。DB上は日時型ですが、**JSONには日時型が存在しない**ため、APIは `"2026-06-12T01:23:45.678Z"` のようなISO 8601形式の文字列として返します。フロント側で日時として扱いたい場合は `new Date(todo.createdAt)` で変換します（今回は表示に使わないのでそのままにします）

フロントとバックでこのように**型の認識を合わせておく**ことが、フルスタック開発の安定性の鍵です。型がずれていると「あるはずのプロパティがundefined」というバグになります。

## API呼び出しモジュールを作る

次に、5つのエンドポイントのうち画面で使う4つ（一覧・作成・更新・削除）を呼び出す関数を作ります。`fetch` の基本は[fetchでAPI通信](/react/api_fetch/)で学んだとおりです。

**`frontend/src/api/todos.ts`**

```typescript
import type { Todo } from '../types/todo';

const API_BASE_URL = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`APIエラー: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/todos`);
  return handleResponse<Todo[]>(res);
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(
  id: number,
  data: { title?: string; completed?: boolean },
): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`APIエラー: ${res.status} ${res.statusText}`);
  }
}
```

**コード解説**

- `API_BASE_URL` — APIのURLの共通部分を定数にまとめます。接続先が変わったときに1か所だけ直せば済みます
- `handleResponse` — どの関数でも必要な「`res.ok` の確認 → JSONの取り出し」を共通化したヘルパーです。`fetch` は**404や500でも例外を投げない**（通信自体は成功しているため）ので、`res.ok`（ステータスが200番台かどうか）を自分で確認して例外に変換する必要があるのでした（→ [fetchでAPI通信](/react/api_fetch/)）
- `createTodo` — [API設計表](/fullstack-todo/)どおり、`POST /todos` にJSONのボディを送ります。`Content-Type: application/json` ヘッダーを忘れると、NestJS側でボディが解釈されず400エラーになります
- `updateTodo` — PATCHは部分更新なので、引数 `data` は `title` と `completed` のどちらも省略可能な型にしています
- `deleteTodo` — 成功時のレスポンスは204（ボディなし）なので、`res.json()` を呼ばず、戻り値も `Promise<void>` にしています。**ボディのないレスポンスに `res.json()` を呼ぶと実行時エラーになる**ため、ここは要注意です

## 画面コンポーネントを実装する

いよいよ画面本体です。既存の `App.tsx` の内容をすべて消して、次のように書き換えます。

**`frontend/src/App.tsx`**

```tsx
import { useEffect, useState } from 'react';
import type { Todo } from './types/todo';
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api/todos';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos()
      .then((data) => setTodos(data))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (title === '') return;
    try {
      const created = await createTodo(title);
      setTodos([created, ...todos]);
      setNewTitle('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  if (isLoading) {
    return <p className="status">読み込み中...</p>;
  }

  return (
    <main className="container">
      <h1>Todoアプリ</h1>

      {errorMessage !== null && <p className="error">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="やることを入力..."
          maxLength={100}
        />
        <button type="submit">追加</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
              />
              <span className={todo.completed ? 'done' : ''}>
                {todo.title}
              </span>
            </label>
            <button type="button" onClick={() => handleDelete(todo.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p className="status">Todoはありません</p>}
    </main>
  );
}

export default App;
```

長いので、まとまりごとに解説します。

### 状態（state）の設計

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [newTitle, setNewTitle] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

**コード解説**

- `todos` — 画面に表示するTodoの配列。**この画面の主役となるデータ**です。APIから取得した結果を保持し、追加・更新・削除のたびに更新します（→ [propsとstate](/react/props_and_state/)）
- `newTitle` — 入力欄の現在の値。フォームの入力をstateで管理する**制御コンポーネント**のパターンです（→ [フォーム入力](/react/forms_and_lists/)）
- `isLoading` — 初回読み込み中かどうか。`true` の間は「読み込み中...」を表示します
- `errorMessage` — エラーメッセージ。`null` のとき（エラーなし）は何も表示しません。「値がないかもしれない」状態を `string | null` の[ユニオン型](/typescript/basic_types/)で表しています

### 初回読み込み（useEffect）

```tsx
useEffect(() => {
  fetchTodos()
    .then((data) => setTodos(data))
    .catch((error: Error) => setErrorMessage(error.message))
    .finally(() => setIsLoading(false));
}, []);
```

**コード解説**

- 依存配列が `[]` なので、このエフェクトは**コンポーネントの初回表示時に1回だけ**実行されます（→ [useEffectと依存配列](/react/hooks/)）
- 成功したら `todos` にデータを入れ、失敗したらエラーメッセージを設定します
- `finally` は成功・失敗どちらでも実行されるので、ローディング表示の解除に最適です

### 追加（handleSubmit）

- `event.preventDefault()` — フォーム送信時のページリロード（ブラウザのデフォルト動作）を止めます（→ [フォーム入力](/react/forms_and_lists/)）
- `title.trim()` — 前後の空白を除去し、空なら送信しません。API側にも `@IsNotEmpty` の検証がありますが、**明らかに無効な入力はフロントでも弾く**ほうが、ユーザーへの反応が速くなります。ただし「フロントの検証は突破できる（curlで直接APIを呼べばよい）ので、本当の守りはAPI側」という役割分担は忘れないでください
- `setTodos([created, ...todos])` — APIが返した**作成済みのTodo**（IDや日時が入っている）を配列の先頭に追加します。スプレッド構文で新しい配列を作っているのは、Reactのstateは直接書き換えず**新しい値で置き換える**のが原則だからです

### 完了切替（handleToggle）と削除（handleDelete）

- `handleToggle` — `PATCH /todos/:id` に `completed` の反転値を送り、APIが返した更新後のTodoで配列内の該当要素だけを差し替えます。`map` で「IDが一致したら新しい値、それ以外はそのまま」という新しい配列を作ります
- `handleDelete` — `DELETE /todos/:id` を呼び、成功したら `filter` で該当要素を除いた新しい配列にします
- どちらも**先にAPIを呼び、成功してから画面を更新**しています。逆にすると、APIが失敗したのに画面では成功して見える、という不整合が起きます

### リスト表示とkey

```tsx
{todos.map((todo) => (
  <li key={todo.id} className="todo-item">
```

**コード解説**

- 配列をJSXに変換する定番の `map` パターンです。`key` には**一意で安定した値**としてDBの `id` を使います。配列のインデックスをkeyにすると、削除時に要素の対応がずれて表示が乱れることがあるのでした（→ [リスト表示とkey](/react/forms_and_lists/)）
- `todo.completed ? 'done' : ''` — 完了済みのTodoにだけ `done` クラスを付ける条件付きレンダリングです。打ち消し線のスタイルはCSS側で定義します

## スタイルを整える

最低限の見た目を整えます。`App.css` の中身をすべて次の内容に置き換え、また `index.css` 由来のデフォルトスタイルと干渉しないよう、`frontend/src/index.css` の中身は空にしてしまって構いません。

**`frontend/src/App.css`**

```css
.container {
  max-width: 480px;
  margin: 40px auto;
  padding: 0 16px;
  font-family: sans-serif;
}

.todo-form {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.todo-form input {
  flex: 1;
  padding: 8px;
  font-size: 16px;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.todo-item .done {
  text-decoration: line-through;
  color: #999;
}

.status {
  color: #666;
  text-align: center;
}

.error {
  color: #b71c1c;
  background: #ffebee;
  padding: 8px 12px;
  border-radius: 4px;
}
```

**コード解説**

- `.todo-form` / `.todo-item` の `display: flex` — 入力欄とボタン、タイトルと削除ボタンを横並びにします（→ [HTML/CSS基礎](/frontend/html_css/)）
- `.done` の `text-decoration: line-through` — 完了済みTodoに打ち消し線を引きます
- `.error` — エラーメッセージを淡い赤の背景で目立たせます

## 動かしてみる — そしてエラーに出会う

それでは3層すべてを起動して、ブラウザで動かしてみましょう。

```bash
# ① DB（fullstack-todo/ で。起動済みなら不要）
docker compose up -d

# ② API（別ターミナル、backend/ で）
pnpm run dev

# ③ フロント（別ターミナル、frontend/ で）
pnpm run dev
```

ブラウザで `http://localhost:5173/` を開くと——「読み込み中...」の後に、**赤いエラーメッセージが表示される**はずです。開発者ツール（F12またはmacOSでは `Cmd + Option + I`）のConsoleタブを開くと、次のようなエラーが出ています。

```
Access to fetch at 'http://localhost:3000/todos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is
present on the requested resource.
```

curlでは完璧に動いたAPIが、ブラウザからは呼べない。これは実装ミスではなく、**ブラウザが意図的にブロックしている**結果です。エラーメッセージにある「CORS policy」が鍵です。

なぜブラウザはこの通信を止めるのか、どうすれば許可できるのか。次のページでじっくり解き明かします。コードはこのままで正しいので、安心してコミットしておきましょう。

```bash
git add .
git commit -m "Todoアプリの画面を実装"
```

## 理解度チェック

**Q1. `fetch` の呼び出しを `api/todos.ts` に分離したことの利点を説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

「APIとの通信方法」と「画面の表示」という別々の関心事を分離できることです。

コンポーネント側はURLやヘッダーの詳細を知らずに `fetchTodos()` を呼ぶだけでよくなり、コードが読みやすくなります。また、APIのURLが変わったときの修正が1ファイルで済み、複数のコンポーネントから同じAPIを呼ぶときも関数を再利用できます。

</details>

**Q2. APIが404を返したとき、`fetch` 自体は例外を投げません。ではどうやってエラーを検知しますか。**

<details markdown="1">
<summary>解答を見る</summary>

レスポンスの `res.ok` プロパティ（ステータスコードが200〜299なら `true`）を確認します。`false` なら自分で `throw new Error(...)` して例外に変換します。

`fetch` が例外を投げるのは、サーバーに到達できないなど**通信自体が失敗した**ときだけです。404や500は「通信は成功し、サーバーがエラーを返答した」状態なので、`fetch` にとっては成功です。この挙動は[fetchでAPI通信](/react/api_fetch/)で学びました。

</details>

**Q3. `handleToggle` では、APIの呼び出しが成功してから `setTodos` で画面を更新しています。順序を逆（先に画面を更新してからAPIを呼ぶ）にすると、どんな問題が起きますか。**

<details markdown="1">
<summary>解答を見る</summary>

APIの呼び出しが失敗した場合に、画面では完了状態が切り替わったように見えるのに、DBには反映されていないという**画面とデータの不整合**が起きます。ページを再読み込みすると元に戻ってしまい、ユーザーを混乱させます。

なお、先に画面を更新して体感速度を上げ、失敗したら巻き戻す「楽観的更新（オプティミスティックアップデート）」という上級テクニックも存在しますが、失敗時の巻き戻し処理が必要になるため、まずは「成功してから更新」を基本にしましょう。

</details>

**Q4. リストの `key` に `todo.id` を使い、配列のインデックスを使わないのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

`key` はReactが「どの要素がどれか」を識別するための目印で、**一意で安定した値**である必要があるからです。

インデックスをkeyにすると、先頭の要素を削除したときに残りの要素のインデックスがすべてずれ、Reactが要素の対応を誤認して表示の乱れや状態の混線が起きることがあります。DBの `id` は要素自体に紐づいた不変の値なので、この問題が起きません。詳細は[リスト表示とkey](/react/forms_and_lists/)を参照してください。

</details>

**Q5. 入力チェック（空文字の拒否）はフロントとAPIの両方で行っています。APIでの検証を省略してはいけないのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

フロントエンドの検証は簡単に突破できるからです。ブラウザを経由せず、curlなどでAPIを直接呼べば、フロントのチェックは一切働きません。

フロント側の検証は「ユーザーに素早くフィードバックするためのユーザー体験向上策」、API側の検証は「不正なデータからシステムを守る最後の砦」と、役割が異なります。守りとして信頼できるのはAPI側だけです。

</details>

## セルフレビュー

- [ ] APIのレスポンスに対応するTypeScriptの型を自分で定義できる
- [ ] JSONでは日時が文字列になる理由を説明できる
- [ ] `res.ok` の確認がなぜ必要かを説明できる
- [ ] `useState` で配列のstateを持ち、追加（スプレッド）・更新（map）・削除（filter）の3パターンを写経せずに書ける
- [ ] `useEffect` の依存配列 `[]` の意味を説明できる
- [ ] 204レスポンスに `res.json()` を呼んではいけない理由を説明できる
- [ ] CORSエラーのメッセージがコンソールのどこに出るかを確認できた

## 次のステップ

画面は完成しましたが、APIとの間に「CORS」という壁が立ちはだかっています。次の[つなぎ込み: CORSとエラーハンドリング](/fullstack-todo/nestjs/integration/)で、ブラウザがなぜこの通信をブロックするのかを仕組みから理解し、2通りの解決方法を学びます。

ここで作った「型定義 + APIモジュール + コンポーネント」という構成は、[SNS開発](/sns/)のフロントエンドでも一貫して使う設計です。
