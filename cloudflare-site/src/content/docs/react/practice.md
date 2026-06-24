---
title: 練習問題
parent: React基礎
nav_order: 8
---

# 練習問題

このセクションの総仕上げです。ここまでに学んだJSX・コンポーネント・props・state・useEffect・フォーム・リスト・API通信を、自分の手で組み合わせて使えるかを確認します。

メインの課題は、**入門編の最終問題で作ったTodoアプリ（素のDOM操作版）を、Reactで作り直す**ことです。同じアプリを2つの方法で作る経験は、「Reactが何を肩代わりしてくれているのか」を体で理解する最良の教材になります。

問題は段階式です。まずウォーミングアップで個々の知識を確認し、メイン課題、最後に発展課題へ進みます。**解答例を見る前に、必ず自分で書いて動かしてください。**エラーと格闘する時間が、いちばん力がつく時間です。

## 学習目標

- React基礎セクションの知識を、見本なしで組み合わせて使える
- 既存のアプリ（素のDOM操作版Todo）をReactの設計に「翻訳」できる
- state設計（何をstateにするか、どこに置くか）を自分で考えられる
- 機能追加（フィルタ、API連携）を既存のReactコードに組み込める

## 準備

[開発環境の構築](/react/setup/)の手順で、練習用のプロジェクトを新しく作ります。

```bash
pnpm create vite@5 react-practice --template react-ts
cd react-practice
pnpm install
pnpm run dev
```

問題ごとにコンポーネントを作り、`App.tsx` で表示を切り替えながら進めると整理しやすいです。区切りのよいところでGitにコミットする習慣も忘れずに（[Git/GitHub基礎](/git//)）。

## ウォーミングアップ

### 問題1：プロフィールカード（props）

次の仕様を満たす `ProfileCard` コンポーネントを作ってください。

- propsとして `name`（文字列）、`age`（数値）、`isStudent`（真偽値）を受け取る
- 名前と年齢を表示する
- `isStudent` が `true` のときだけ「学生」というラベルを表示する
- `App.tsx` から、異なる値で**2枚以上**表示する

<details markdown="1">
<summary>解答例を見る</summary>

**`src/components/ProfileCard.tsx`**

```tsx
type ProfileCardProps = {
  name: string;
  age: number;
  isStudent: boolean;
};

function ProfileCard({ name, age, isStudent }: ProfileCardProps) {
  return (
    <section>
      <h2>{name}</h2>
      <p>{age}歳</p>
      {isStudent && <p>学生</p>}
    </section>
  );
}

export default ProfileCard;
```

**`src/App.tsx`**

```tsx
import ProfileCard from "./components/ProfileCard";

function App() {
  return (
    <div>
      <ProfileCard name="山田太郎" age={20} isStudent={true} />
      <ProfileCard name="佐藤花子" age={28} isStudent={false} />
    </div>
  );
}

export default App;
```

**ポイント**

- props型を `type` で定義することで、渡し忘れや型違いをエディタが検出してくれます（[propsとstate](/react/props_and_state/)）
- 「あるときだけ表示」は `&&` の出番です。`isStudent` はbooleanなので、そのまま左辺に置けます（[フォームとリスト](/react/forms_and_lists/)）

</details>

### 問題2：偶数カウンター（state）

[propsとstate](/react/props_and_state/)で作ったカウンターを、次の仕様で拡張してください。

- 「+1」ボタンと「リセット」ボタンがある
- カウントが**偶数のとき**だけ「偶数です」と表示する（0も偶数とします）
- カウントが10以上になったら、「+1」ボタンを**無効化**する（ヒント：buttonの `disabled` 属性に式を渡せます）

<details markdown="1">
<summary>解答例を見る</summary>

**`src/components/EvenCounter.tsx`**

```tsx
import { useState } from "react";

function EvenCounter() {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <p>カウント：{count}</p>
      {count % 2 === 0 && <p>偶数です</p>}
      <button onClick={() => setCount(count + 1)} disabled={count >= 10}>
        +1
      </button>
      <button onClick={() => setCount(0)}>リセット</button>
    </div>
  );
}

export default EvenCounter;
```

**ポイント**

- `disabled={count >= 10}` — 属性にも `{ }` で式を渡せます。条件付きレンダリングと同じ発想で「条件付き属性」が書けます
- 「画面の見た目（偶数表示・ボタンの有効無効）はすべて `count` から計算できる」ことに注目してください。**stateは `count` 1つで足ります**。「偶数かどうか」を別のstateにするのは冗長で、不整合のもとです

</details>

### 問題3：秒数タイマー（useEffect）

マウントしてからの経過秒数を表示する `Timer` コンポーネントを作ってください。

- 1秒ごとに「経過時間：N秒」の表示が増えていく
- アンマウント時にタイマーが正しく停止する（クリーンアップ）
- `App.tsx` に「タイマーを表示/非表示」ボタンを置き、非表示にしてもコンソールにエラーが出ないことを確認する

<details markdown="1">
<summary>解答例を見る</summary>

**`src/components/Timer.tsx`**

```tsx
import { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return <p>経過時間：{seconds}秒</p>;
}

export default Timer;
```

**`src/App.tsx`**

```tsx
import { useState } from "react";
import Timer from "./components/Timer";

function App() {
  const [visible, setVisible] = useState<boolean>(true);

  return (
    <div>
      <button onClick={() => setVisible(!visible)}>
        タイマーを{visible ? "非表示" : "表示"}
      </button>
      {visible && <Timer />}
    </div>
  );
}

export default App;
```

**ポイント**

- `setSeconds((prev) => prev + 1)` — set関数には「前の値を受け取って新しい値を返す関数」も渡せます。useEffect内のように「最新のstateが手元にない」場面では、この**更新関数形式**が安全です（`setSeconds(seconds + 1)` だと、依存配列が `[]` のため `seconds` が初期値0のまま固定され、1で止まってしまいます）
- `{visible && <Timer />}` で非表示にすると `Timer` はアンマウントされ、クリーンアップが実行されます。クリーンアップを消すとタイマーが動き続けることは、intervalのコールバックに `console.log` を仕込み、非表示にした後もコンソールへ出力が続くことで確認できます（[フック（useEffect）](/react/hooks/)）

</details>

## メイン課題：TodoアプリのReact化

いよいよ本番です。[入門編最終問題](/final_project/)で作ったTodoアプリを、Reactで作り直します。

### 仕様（入門編と同じ）

1. テキストボックスにタスクを入力し、「追加」ボタンで一覧に追加できる
2. 空文字（スペースだけを含む）は追加できない
3. タスクの文字をクリックすると、完了/未完了が切り替わる（完了は打ち消し線で表示）
4. 「削除」ボタンでそのタスクを削除できる
5. 追加後、入力欄は空に戻る

### 取り組み方

いきなりコードを書かず、次の順で考えてください。これはReact開発の標準的な思考手順です。

1. **stateを洗い出す**：画面で「時間とともに変わるもの」は何か
2. **コンポーネントを分ける**：どんな部品の木にするか
3. **データの流れを決める**：stateをどこに置き、子へ何をpropsで渡すか
4. 実装する

**ヒント1（state）**：変わるものは「タスクの配列」「入力中の文字」「次に振るID」の3つです。タスクの型は入門編と同じ `{ id: number; text: string; completed: boolean }` が使えます。

**ヒント2（コンポーネント分割）**：最小なら `TodoApp` 1つでも完成できます。余裕があれば、1件分の表示を `TodoItem` に分けてみましょう。stateは共通の親である `TodoApp` に置きます（stateのリフトアップ）。

**ヒント3（操作の対応表）**：入門編のコードとの対応を意識すると、翻訳作業として進められます。

| 入門編（DOM操作） | React |
|---|---|
| `tasks.push(newTask)` → `renderTasks()` | `setTasks([...tasks, newTask])` |
| `tasks = tasks.filter(...)` → `renderTasks()` | `setTasks(tasks.filter(...))` |
| `task.completed = !task.completed` → `renderTasks()` | `setTasks(tasks.map(...))` で新しい配列を作る |
| `taskInput.value` を読む | stateの `input` を読む（制御コンポーネント） |
| `taskInput.value = ""` | `setInput("")` |
| `li.className = task.completed ? "completed" : ""` | `className={task.completed ? "completed" : ""}` |

完成して動作確認（追加・空入力ガード・完了切り替え・削除）が済んだら、解答例と見比べてください。

<details markdown="1">
<summary>解答例を見る（コンポーネント分割版）</summary>

**`src/components/TodoItem.tsx`**

```tsx
export type Task = {
  id: number;
  text: string;
  completed: boolean;
};

type TodoItemProps = {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

function TodoItem({ task, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={task.completed ? "completed" : ""}>
      <span onClick={() => onToggle(task.id)}>{task.text}</span>
      <button className="delete-btn" onClick={() => onDelete(task.id)}>
        削除
      </button>
    </li>
  );
}

export default TodoItem;
```

**`src/components/TodoApp.tsx`**

```tsx
import { useState } from "react";
import TodoItem, { Task } from "./TodoItem";

function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState<string>("");
  const [nextId, setNextId] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (text === "") {
      return;
    }
    const newTask: Task = { id: nextId, text, completed: false };
    setTasks([...tasks, newTask]);
    setNextId(nextId + 1);
    setInput("");
  };

  const handleToggle = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="container">
      <h1>TODOリスト</h1>
      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="タスクを入力してください"
        />
        <button type="submit">追加</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

**`src/App.tsx`**

```tsx
import TodoApp from "./components/TodoApp";

function App() {
  return <TodoApp />;
}

export default App;
```

**コード解説**

- `export type Task = ...` — タスクの型を `TodoItem.tsx` で定義して `export` し、親からも `import` して共有しています。「データの形」を1箇所で管理するのは、後の[バックエンド基礎（NestJS）](/backend//)でDTOを学ぶときにもつながる習慣です
- `TodoItem` — 1件分の表示に専念する子コンポーネントです。自分ではstateを持たず、表示用の `task` と、報告用の関数 `onToggle` / `onDelete` をpropsで受け取ります。**単方向データフロー**そのものです
- `handleToggle` の `map` — 「対象のタスクだけ `completed` を反転した**新しいオブジェクト**に差し替えた、**新しい配列**」を作っています。`{ ...task, completed: !task.completed }` はスプレッド構文によるオブジェクトのコピー+上書きです。入門編のように `task.completed = !task.completed` と直接書き換えてはいけません
- `key={task.id}` — 削除や並びの変化があるリストなので、必ずIDをkeyにします。インデックスは不可です（[フォームとリスト](/react/forms_and_lists/)）
- 入門編に約30行あった `renderTasks()` 相当の処理が、**JSXの宣言だけになり消滅**しています。これがこの課題でいちばん感じてほしい変化です

**見た目を整える（任意）**

入門編の `style.css` の内容を `src/index.css` に貼り付ければ、ほぼ同じ見た目になります。ただしCSSのセレクタが `#taskInput` などのID指定になっているため、`#taskInput` → `.input-container input`、`#addButton` → `.input-container button`、`#taskList` → `.container ul` のようにクラス・要素ベースの指定に直すと、上のJSXのままで適用できます。

</details>

### 振り返り：2つのTodoアプリを比べる

完成したら、入門編のコードと並べて、次の観点で見比べてください。

- **再描画のコードはどこへ行ったか**：入門編の `renderTasks()` は、Reactでは存在しません。「stateを変えれば画面が変わる」がそれを置き換えました
- **データの変更方法はどう変わったか**：`push` や直接代入が、スプレッド構文・`map`・`filter` による「新しい配列を作る」操作に変わりました
- **イベント登録はどう変わったか**：`addEventListener` の繰り返しが、JSX内の `onClick` 宣言に変わりました

この対比を自分の言葉で説明できれば、[Reactとは何か](/react/what_is_react/)で学んだ「宣言的UI」を、知識ではなく経験として理解できたことになります。

## 発展課題

メイン課題が完成した人は、機能を追加していきましょう。実務での開発は、ゼロから作るより「動いているコードに機能を足す」ことの方が多いものです。

### 発展1：残りタスク数の表示

一覧の上に「残りタスク：N件」と表示してください。Nは**未完了**のタスクの数です。

<details markdown="1">
<summary>解答例を見る</summary>

`TodoApp` のJSX（`<form>` の下あたり）に次を追加します。

```tsx
<p>残りタスク：{tasks.filter((task) => !task.completed).length}件</p>
```

**ポイント**

- 新しいstateは**不要**です。残り件数は `tasks` から計算できる値（導出値）なので、JSX内の式で求めます。「stateから計算できるものはstateにしない」は重要な設計原則です。もし `remainingCount` というstateを別に作ると、`tasks` を変えるたびに2つを同期させる義務が生まれ、不整合バグの温床になります

</details>

### 発展2：絞り込みフィルタ

「すべて」「未完了」「完了済み」の3つのボタンを追加し、押したボタンに応じて一覧を絞り込んでください。

**ヒント**：「いまどのフィルタが選ばれているか」は時間とともに変わるので、これは新しいstateです。ユニオン型 `"all" | "active" | "completed"` を使うと、TypeScriptが値の打ち間違いを防いでくれます。

<details markdown="1">
<summary>解答例を見る</summary>

**`src/components/TodoApp.tsx`** に追加・変更します。

```tsx
type Filter = "all" | "active" | "completed";
```

```tsx
const [filter, setFilter] = useState<Filter>("all");

const visibleTasks = tasks.filter((task) => {
  if (filter === "active") {
    return !task.completed;
  }
  if (filter === "completed") {
    return task.completed;
  }
  return true;
});
```

JSXのフィルタボタンと一覧部分：

```tsx
<div>
  <button onClick={() => setFilter("all")}>すべて</button>
  <button onClick={() => setFilter("active")}>未完了</button>
  <button onClick={() => setFilter("completed")}>完了済み</button>
</div>
<ul>
  {visibleTasks.map((task) => (
    <TodoItem
      key={task.id}
      task={task}
      onToggle={handleToggle}
      onDelete={handleDelete}
    />
  ))}
</ul>
```

**ポイント**

- stateとして持つのは「選択中のフィルタ」だけです。絞り込み結果 `visibleTasks` は、`tasks` と `filter` から**毎回計算**します（発展1と同じ原則です）
- 元の `tasks` は削らずに残すことが重要です。`setTasks` で絞り込んでしまうと、フィルタを戻したときにデータが消えています
- `useState<Filter>("all")` — ユニオン型のおかげで、`setFilter("done")` のような誤りはコンパイルエラーになります（[基本型](/typescript/basic_types/)のユニオン型の実践です）

</details>

### 発展3：APIから初期データを読み込む

[fetchでAPI通信](/react/api_fetch/)の内容との総合問題です。マウント時に、JSONPlaceholderのTodo API（最初の5件）を初期タスクとして読み込んでください。

```
https://jsonplaceholder.typicode.com/todos?_limit=5
```

このAPIは `{ "userId": 1, "id": 1, "title": "...", "completed": false }` という形のJSONの配列を返します。**自分のアプリの `Task` 型とは項目名が違う**（`title` と `text`）点をどう処理するかも考えどころです。仕様：

- 読み込み中は「読み込み中...」を表示する
- 取得失敗時は「タスクの読み込みに失敗しました」を表示する
- 取得後は、これまでどおり追加・完了切り替え・削除ができる

<details markdown="1">
<summary>解答例を見る</summary>

**`src/components/TodoApp.tsx`** に追加・変更します。

```tsx
import { useState, useEffect } from "react";
import TodoItem, { Task } from "./TodoItem";

type ApiTodo = {
  id: number;
  title: string;
  completed: boolean;
};

function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState<string>("");
  const [nextId, setNextId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos?_limit=5"
        );
        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data: ApiTodo[] = await response.json();
        const loaded: Task[] = data.map((todo) => ({
          id: todo.id,
          text: todo.title,
          completed: todo.completed,
        }));
        setTasks(loaded);
        setNextId(Math.max(...loaded.map((t) => t.id)) + 1);
      } catch (e) {
        setError("タスクの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (error !== null) {
    return <p>{error}</p>;
  }

  // 以降の return は元のまま
  ...
}
```

**コード解説**

- `type ApiTodo` — **APIが返す形**と**アプリ内で使う形（Task）**を別の型として定義し、`map` で変換しています。外部のデータ形式を自分のアプリの都合に合わせて入口で変換するのは、実務でも頻出のパターンです
- `setNextId(Math.max(...) + 1)` — 読み込んだタスクとIDが重複しないよう、最大ID+1から採番を始めます。`key` の重複は描画バグの原因になるため、地味ですが重要な処理です
- ローディング・エラー・成功の3状態管理と早期リターンは、[fetchでAPI通信](/react/api_fetch/)で学んだ型そのままです
- このAPI部分は、[バックエンド基礎（NestJS）](/backend//)で自作する「メモAPI」に**URLを差し替えるだけ**でつなぎ替えられます。次のセクションを終えたら、ぜひ戻ってきて接続してみてください

</details>

### 発展4（挑戦）：データ取得をカスタムフックに切り出す

[フック（useEffect）](/react/hooks/)の最後で紹介したカスタムフックに挑戦します。発展3で書いた「取得・isLoading・error」のロジックを `useTodos` というカスタムフックに切り出し、`TodoApp` 本体を見た目の記述に集中させてください。

<details markdown="1">
<summary>解答例を見る</summary>

**`src/hooks/useTodos.ts`**（新規作成）

```tsx
import { useState, useEffect } from "react";
import { Task } from "../components/TodoItem";

type ApiTodo = {
  id: number;
  title: string;
  completed: boolean;
};

export function useTodos() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/todos?_limit=5"
        );
        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }
        const data: ApiTodo[] = await response.json();
        setTasks(
          data.map((todo) => ({
            id: todo.id,
            text: todo.title,
            completed: todo.completed,
          }))
        );
      } catch (e) {
        setError("タスクの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, setTasks, isLoading, error };
}
```

**`src/components/TodoApp.tsx`** の冒頭はこう変わります。

```tsx
import { useState } from "react";
import TodoItem, { Task } from "./TodoItem";
import { useTodos } from "../hooks/useTodos";

function TodoApp() {
  const { tasks, setTasks, isLoading, error } = useTodos();
  const [input, setInput] = useState<string>("");
  const [nextId, setNextId] = useState<number>(100);

  // handleSubmit / handleToggle / handleDelete と JSX は元のまま
  ...
}
```

**ポイント**

- `useTodos` は `{ tasks, setTasks, isLoading, error }` というオブジェクトを返し、使う側は1行で「取得済みのタスクと通信状態」を手に入れます
- 通信ロジックの変更（URL差し替え、エラーメッセージ変更など）が `useTodos.ts` だけで完結するようになりました。「見た目（コンポーネント）」と「ロジック（フック）」の分離は、[SNS開発](/sns//)で画面が増えたときに効いてきます
- 簡略化のため `nextId` の初期値を100にしてID重複を避けています。厳密にやるなら発展3のように最大ID+1を計算してください

</details>

## 理解度チェック

セクション全体の振り返りです。コードを見ずに答えてみてください。

**Q1. 入門編のTodoアプリにあった `renderTasks()` 関数は、React版には存在しません。その役割は何に置き換わりましたか。**

<details markdown="1">
<summary>解答を見る</summary>

「stateが更新されたらReactがコンポーネントを再実行し、仮想DOMの差分だけを画面に反映する」という**Reactの自動再描画**に置き換わりました。開発者は `setTasks` などのset関数でデータを更新するだけでよく、「いつ・どこを描画し直すか」を考える必要がなくなりました。JSXが「データから画面への変換ルール」を宣言しているため、変換の実行はReactに任せられます。

</details>

**Q2. Todoアプリで「完了状態の切り替え」を実装するとき、`task.completed = !task.completed` と直接書き換えるのではなく、`map` で新しい配列を作りました。なぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

Reactは「set関数に**前回と違う値**が渡されたか」で変更を検知するためです。既存の配列内のオブジェクトを直接書き換えても、配列自体は同じものなので、Reactが変更に気づけず画面が更新されないことがあります。`map` とスプレッド構文（`{ ...task, completed: !task.completed }`）で「変更後の状態を表す新しい配列・新しいオブジェクト」を作って渡すことで、確実に変更が検知されます。

</details>

**Q3. 発展1の「残りタスク数」を、新しいstateとして持つべきでないのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

残りタスク数は `tasks` から `filter(...).length` で**計算できる値（導出値）**だからです。これを別のstateにすると、タスクの追加・削除・完了切り替えのすべての箇所で2つのstateを同期させる必要が生まれ、更新漏れによる不整合（実際は3件なのに「残り2件」と表示される等）の原因になります。「stateは最小限にし、計算できるものは描画時に計算する」が原則です。

</details>

**Q4. このセクションで作ったReact版Todoアプリのデータは、ページを再読み込みすると消えます。理由と、消えなくするために今後学ぶ解決の方向性を述べてください。**

<details markdown="1">
<summary>解答を見る</summary>

データがstateとして**ブラウザのメモリ上にしか存在しない**ためです。再読み込みするとReactアプリは最初から実行され、stateは初期値に戻ります。

解決の方向性は「データをブラウザの外に保存する」ことです。本格的には、[バックエンド基礎（NestJS）](/backend//)で作るAPIサーバーにデータを送って保存し、[データベースとPrisma](/database//)で永続化します。画面を開いたらfetchで読み込み、追加・変更のたびにAPIへ送る——この形が、SNS開発で実際に使う構成です。

</details>

## セルフレビュー

セクション修了の最終チェックです。すべてにチェックがつけば、React基礎は合格です。

- [ ] ウォーミングアップ3問を、解答例を見ずに解けた
- [ ] TodoアプリのReact化を、ヒントの対応表程度の参照で完成させられた
- [ ] state設計（何をstateにするか・どこに置くか・導出値はstateにしない）を自分で判断できた
- [ ] 配列のstateを、スプレッド構文・map・filterで正しく更新できた
- [ ] propsで関数を渡し、子から親へ報告する単方向データフローを実装できた
- [ ] 発展3で、ローディング・エラーを含むAPI連携を組み込めた
- [ ] 入門編のDOM操作版とReact版の違いを、「宣言的UI」「仮想DOM」「単方向データフロー」という言葉を使って人に説明できる

## 次のステップ

React基礎セクションはこれで修了です。素のDOM操作で作ったアプリをReactで作り直したことで、「Reactが何を解決しているのか」を実感を持って説明できるようになったはずです。

次のセクションは[バックエンド基礎（NestJS）](/backend//)です。[fetchでAPI通信](/react/api_fetch/)と発展課題3で「使う側」として触れたAPIを、今度は**自分で作ります**。バックエンド章を終えたら、ぜひこのTodoアプリに戻ってきて、JSONPlaceholderのURLを自作APIに差し替えてみてください。フロントエンドとバックエンドが自分のコードでつながる瞬間が、[SNS開発](/sns//)への第一歩です。
