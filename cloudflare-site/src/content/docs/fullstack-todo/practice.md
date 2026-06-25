---
title: 練習問題
parent: "実践: フルスタックTodoアプリ"
nav_order: 5
---

# 練習問題

[つなぎ込み](/fullstack-todo/integration/)までで、Todoアプリは一通り完成しました。このページでは、完成したアプリに**自力で機能を追加する**練習をします。

写経で動かすことと、自分で設計して追加できることの間には大きな差があります。ここでの課題はすべて「DBのスキーマ → API → 画面」という3層を貫く変更です。1つの機能を足すのに、どの層に何の変更が必要かを**先に紙に書き出してから**実装する癖をつけてください。それがそのまま[SNS開発](/sns/)での開発の進め方になります。

## 学習目標

- 機能追加に必要な変更を、DB・API・画面の3層に分解して列挙できる
- スキーマ変更をマイグレーションとして安全に適用できる
- クエリパラメータを使った絞り込みAPIを設計・実装できる
- 既存のエンドポイント（PATCH）を別のユースケース（編集）に再利用できる

## 取り組み方

- 各課題は「要件 → ヒント → 解答例」の順に並んでいます。**まずヒントを見ずに**、3層それぞれの変更点を書き出してから実装してください
- 行き詰まったらヒントを開き、それでも詰まったら解答例を見て構いません。ただし解答例を見た場合も、**閉じてから自分の手で再実装**してください
- 1つの課題が終わるたびに、curl（API）とブラウザ（画面）の両方で動作確認し、コミットしましょう
- スキーマを変更する課題では、必ず `pnpm exec prisma migrate dev` でマイグレーションを作ります（→ [モデル定義とマイグレーション](/database/schema_and_migration/)）

## 課題1: 期限（dueDate）を追加する

**要件**

- Todoに期限（日付）を任意で設定できるようにする
- 追加フォームに日付の入力欄を設け、未入力でも追加できる
- 一覧で、期限のあるTodoには期限を表示する

<details markdown="1">
<summary>ヒントを見る</summary>

3層の変更点は次のとおりです。

1. **DB** — `schema.prisma` の `Todo` に `dueDate DateTime?` を追加（`?` で省略可能に）し、マイグレーションを実行する
2. **API** — `CreateTodoDto` に `dueDate` を追加する。任意項目なので `@IsOptional()`、日付文字列の検証には `@IsDateString()` が使えます（→ [DTOとバリデーション](/backend/dto_and_validation/)）。Serviceの `create` で `data` に含めるのを忘れずに
3. **画面** — `Todo` 型に `dueDate: string | null` を追加し、`<input type="date">` で入力を受け取り、`createTodo` に渡す。表示は `new Date(todo.dueDate).toLocaleDateString()` が使えます

既存の行がある状態でスキーマに**必須**カラムを足すとマイグレーションが失敗します。`DateTime?`（NULL許容）にしているのはそのためでもあります。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

**`backend/prisma/schema.prisma`**（Todoモデルに1行追加）

```prisma
model Todo {
  id        Int       @id @default(autoincrement())
  title     String    @db.VarChar(100)
  completed Boolean   @default(false)
  dueDate   DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

マイグレーションを実行します。

```bash
pnpm exec prisma migrate dev --name add-due-date
```

**`backend/src/todos/dto/create-todo.dto.ts`**

```typescript
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
```

**`backend/src/todos/todos.service.ts`**（`create` を変更）

```typescript
  create(dto: CreateTodoDto) {
    return this.prisma.todo.create({
      data: {
        title: dto.title,
        dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : null,
      },
    });
  }
```

**コード解説**

- `@IsDateString()` — `"2026-06-30"` のような日付形式の文字列だけを受け付けます
- `new Date(dto.dueDate)` — DTOでは文字列で受け取り、Prismaに渡す際にDate型へ変換します

フロント側は、型とAPIモジュールと画面の3か所です。

**`frontend/src/types/todo.ts`**（1行追加）

```typescript
export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
```

**`frontend/src/api/todos.ts`**（`createTodo` を変更）

```typescript
export async function createTodo(
  title: string,
  dueDate?: string,
): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dueDate ? { title, dueDate } : { title }),
  });
  return handleResponse<Todo>(res);
}
```

**`frontend/src/App.tsx`**（抜粋: stateとフォームと表示）

```tsx
  const [newDueDate, setNewDueDate] = useState('');

  // handleSubmit内
  const created = await createTodo(title, newDueDate || undefined);
  // 成功後に setNewDueDate('');

  // フォームに追加
  <input
    type="date"
    value={newDueDate}
    onChange={(e) => setNewDueDate(e.target.value)}
  />

  // 一覧のtitleの後ろに追加
  {todo.dueDate !== null && (
    <span className="due-date">
      期限: {new Date(todo.dueDate).toLocaleDateString()}
    </span>
  )}
```

**コード解説**

- `newDueDate || undefined` — 未入力（空文字）のときは `dueDate` 自体を送りません。`forbidNonWhitelisted` は有効でも `dueDate` はDTOにあるので問題ありませんが、空文字を送ると `@IsDateString()` で400になるため、未入力なら省略します
- `dueDate` が `null` のTodoでは期限を表示しない、条件付きレンダリングです（→ [条件付きレンダリング](/react/forms_and_lists/)）

</details>

## 課題2: 完了/未完了で絞り込む

**要件**

- `GET /todos?completed=true` のように、クエリパラメータで完了状態の絞り込みができるようにする
- クエリパラメータがない場合は従来どおり全件を返す
- 画面に「すべて / 未完了 / 完了」の切り替えボタンを置き、選択に応じて一覧を絞り込む

<details markdown="1">
<summary>ヒントを見る</summary>

- 「Todoの一部を取得する」のは検索条件の指定なので、新しいURLを作るのではなく**既存の `GET /todos` にクエリパラメータを足す**のがREST的な設計です（→ [HTTPとREST](/backend/http_and_rest/)）
- NestJSでは `@Query('completed')` でクエリパラメータを受け取れます（→ [クエリの受け取り](/backend/controller/)）。**クエリパラメータは常に文字列**で届くため、`"true"` / `"false"` という文字列をbooleanに変換する必要があります
- Prismaの `findMany` は `where: { completed: true }` で絞り込めます（→ [Prisma ClientでCRUD](/database/crud_with_prisma/)）
- 画面側は、絞り込み状態をstateに持ち、`useEffect` の依存配列に入れて「状態が変わったら取得し直す」形にするのが素直です（→ [useEffectと依存配列](/react/hooks/)）

</details>

<details markdown="1">
<summary>解答例を見る</summary>

**`backend/src/todos/todos.controller.ts`**（`findAll` を変更、`Query` をimportに追加）

```typescript
  @Get()
  findAll(@Query('completed') completed?: string) {
    if (completed === 'true') {
      return this.todosService.findAll(true);
    }
    if (completed === 'false') {
      return this.todosService.findAll(false);
    }
    return this.todosService.findAll();
  }
```

**`backend/src/todos/todos.service.ts`**（`findAll` を変更）

```typescript
  findAll(completed?: boolean) {
    return this.prisma.todo.findMany({
      where: completed === undefined ? {} : { completed },
      orderBy: { createdAt: 'desc' },
    });
  }
```

**コード解説**

- Controllerで文字列の `"true"` / `"false"` をbooleanに変換し、それ以外（未指定や変な値）は「絞り込みなし」として扱います。HTTPの事情（クエリは文字列）をControllerで吸収し、Serviceは純粋な `boolean | undefined` だけを扱う、という役割分担です
- `where: {}` は「条件なし＝全件」です

curlで確認します。

```bash
curl "http://localhost:3000/todos?completed=true"
```

フロント側の例です。

**`frontend/src/api/todos.ts`**（`fetchTodos` を変更）

```typescript
export async function fetchTodos(completed?: boolean): Promise<Todo[]> {
  const query = completed === undefined ? '' : `?completed=${completed}`;
  const res = await fetch(`${API_BASE_URL}/todos${query}`);
  return handleResponse<Todo[]>(res);
}
```

**`frontend/src/App.tsx`**（抜粋）

```tsx
  type Filter = 'all' | 'active' | 'done';
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const completed =
      filter === 'all' ? undefined : filter === 'done';
    setIsLoading(true);
    fetchTodos(completed)
      .then((data) => setTodos(data))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [filter]);

  // フォームの下に追加
  <div className="filters">
    <button type="button" onClick={() => setFilter('all')}>すべて</button>
    <button type="button" onClick={() => setFilter('active')}>未完了</button>
    <button type="button" onClick={() => setFilter('done')}>完了</button>
  </div>
```

**コード解説**

- `useEffect` の依存配列を `[]` から `[filter]` に変えています。`filter` が変わるたびにAPIを取得し直します
- 絞り込みはフロントの `todos.filter(...)` でも実現できますが、今回はAPI側で絞り込む練習です。データが何万件もある場合、全件取得してフロントで絞るのは無駄が大きいため、**絞り込みはデータに近い側（API・DB）で行う**のが基本です

</details>

## 課題3: タイトルを編集できるようにする

**要件**

- 各Todoに「編集」ボタンを追加する
- 押すとタイトルが入力欄に変わり、「保存」で確定、「キャンセル」で元に戻る
- 空文字では保存できない

<details markdown="1">
<summary>ヒントを見る</summary>

- **APIの変更は不要**です。`PATCH /todos/:id` はすでに `title` の部分更新に対応しています（[UpdateTodoDto](/fullstack-todo/backend/)を見直してください）。設計段階でPATCHを部分更新として作っておいたことが、ここで効いてきます
- 画面側は「いま編集中のTodoのID」（`number | null`）と「編集中の入力値」の2つをstateに持つのが定石です。`editingId === todo.id` のときだけ入力欄を表示する条件付きレンダリングにします
- 保存時は `updateTodo(id, { title })` を呼び、完了切替と同じく `map` でその1件だけ差し替えます

</details>

<details markdown="1">
<summary>解答例を見る</summary>

**`frontend/src/App.tsx`**（抜粋）

```tsx
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleSave = async (id: number) => {
    const title = editingTitle.trim();
    if (title === '') return;
    try {
      const updated = await updateTodo(id, { title });
      setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  // <li> の中身を編集中かどうかで出し分け
  {editingId === todo.id ? (
    <>
      <input
        type="text"
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        maxLength={100}
      />
      <button type="button" onClick={() => handleSave(todo.id)}>
        保存
      </button>
      <button type="button" onClick={() => setEditingId(null)}>
        キャンセル
      </button>
    </>
  ) : (
    <>
      <label>
        {/* 既存のチェックボックスとタイトル表示 */}
      </label>
      <button type="button" onClick={() => startEdit(todo)}>編集</button>
      <button type="button" onClick={() => handleDelete(todo.id)}>
        削除
      </button>
    </>
  )}
```

**コード解説**

- `editingId` が「どの行が編集モードか」を表します。`null` なら編集中の行はありません
- 編集開始時に現在のタイトルを `editingTitle` にコピーするので、キャンセルしてもデータは変わりません（stateを捨てるだけ）
- API側は一切変更していません。**PATCHを「部分更新」として汎用的に設計しておいた**ため、完了切替とタイトル編集という2つのユースケースを同じエンドポイントで実現できています

</details>

## 課題4: 残り件数を表示する

**要件**

- 一覧の上に「残り 3 件」のように、未完了のTodoの件数を表示する

<details markdown="1">
<summary>ヒントを見る</summary>

- APIもDBも変更不要です。すでに手元にある `todos` 配列から計算できます
- `todos.filter((t) => !t.completed).length` で未完了の件数が得られます。stateを増やす必要はありません。**既存のstateから計算で導ける値は、stateにせず描画のたびに計算する**のがReactの定石です（→ [propsとstate](/react/props_and_state/)）
- 課題2の絞り込みと併用している場合、「完了」表示中は手元に未完了のデータがない点に注意してください。常に正確な件数を出したい場合はAPIに件数取得の仕組みが必要になる、というところまで考えられれば十分です

</details>

## 課題5（チャレンジ）: 完了済みをまとめて削除する

**要件**

- 「完了済みをすべて削除」ボタンを追加する
- API側に、完了済みのTodoを一括削除するエンドポイントを新設する

<details markdown="1">
<summary>ヒントを見る</summary>

- エンドポイントの設計から考えます。「完了済みのTodoたち」という集合に対するDELETEなので、`DELETE /todos/completed` や `DELETE /todos?completed=true` などの設計が考えられます
- `DELETE /todos/completed` を採用する場合、**ルーティングの定義順**に注意してください。NestJSは定義された順にルートを照合するため、`@Delete(':id')` が先にあると `completed` という文字列が `:id` にマッチしてしまい、`ParseIntPipe` が400を返します。`@Delete('completed')` を `@Delete(':id')` より**上**に定義する必要があります
- Prismaには条件に一致する行をまとめて削除する `deleteMany` があります: `this.prisma.todo.deleteMany({ where: { completed: true } })`
- 一括削除に成功したら、フロントは一覧を取得し直すのが簡単で確実です

</details>

## 理解度チェック

**Q1. 課題1で、既存のデータが入っているテーブルに新しいカラムを追加するとき、`DateTime?`（NULL許容）にすると安全なのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

必須（NOT NULL）のカラムを追加すると、**既存の行に入れる値が存在しない**ためマイグレーションが失敗するか、全行に何らかのデフォルト値を強制的に入れることになるからです。

NULL許容にすれば、既存の行は「期限なし（NULL）」のまま、新しいカラムを安全に追加できます。既存データへの影響を考えてスキーマ変更を設計する感覚は、本番運用では特に重要です。

</details>

**Q2. 「完了済みだけを取得する」機能を、`GET /completed-todos` という新しいURLではなく `GET /todos?completed=true` というクエリパラメータで設計するのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

完了済みのTodoも未完了のTodoも、同じ「Todo」というリソースだからです。リソースが同じならURLも同じ `/todos` で表し、**絞り込み条件はクエリパラメータで表現する**のがRESTの考え方です。

`/completed-todos` という別リソースに見えるURLを作ると、絞り込み条件が増えるたびにURLが増殖し、APIの一貫性が失われていきます。

</details>

**Q3. 課題3（タイトル編集）でAPI側の変更が不要だったのは、どんな設計判断のおかげですか。**

<details markdown="1">
<summary>解答を見る</summary>

`PATCH /todos/:id` を「`title` と `completed` のどちらでも、送られた項目だけを更新する**部分更新**」として設計していたおかげです。

もし「完了切替専用」の `PATCH /todos/:id/toggle` のような操作単位のエンドポイントにしていたら、編集機能のために新しいエンドポイントが必要でした。リソースの状態変更を汎用的なPATCHで表現しておくと、新しいユースケースに強いAPIになります。

</details>

## セルフレビュー

- [ ] 機能追加の前に、DB・API・画面それぞれの変更点を書き出してから実装した
- [ ] スキーマ変更を `prisma migrate dev` で適用し、マイグレーションファイルが増えたことを確認した
- [ ] 新しいAPIの動作を、画面より先にcurlで確認した
- [ ] クエリパラメータが文字列で届く理由と、その変換をどの層で行うべきかを説明できる
- [ ] 「stateから計算できる値はstateにしない」を自分の言葉で説明できる
- [ ] 課題ごとにコミットを分けて記録した

## 次のステップ

これで「実践: フルスタックTodoアプリ」のセクションは完了です。3層を自分の手で組み、貫いて変更する経験は、ここから先のすべての土台になります。

次のセクションは[コード品質と開発ツール](/tooling/)です。今回書いたコードを題材に、PrettierとESLintでコードの品質を機械的に保つ方法を学びます。その後の[バックエンドテスト](/testing/)、そして最終プロジェクトの[SNS開発](/sns/)では、このTodoアプリとまったく同じ構成（DBはcompose、APIとフロントは `pnpm run dev`）・同じ開発の進め方（設計 → API → curl確認 → 画面 → つなぎ込み）を、より大きな規模で繰り返します。

> **完成形のコード**: [practice/fullstack-todo](https://github.com/dik-ab/curriculum/tree/main/practice/fullstack-todo)（動作検証済み）。手詰まりになったら参照してください。
