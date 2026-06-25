---
title: JavaScript基礎
parent: フロントエンド基礎
nav_order: 2
---

# JavaScript基礎

HTML/CSSでWebページの構造とデザインを学んだら、次は**JavaScript**を学びましょう。JavaScriptを使うことで、静的なページに動きをつけ、ユーザーと対話できるWebアプリケーションを作れるようになります。

このページでは、外部教材で文法を補いながら、このカリキュラム内でも**ReactとTypeScriptへ進むために必ず必要なJavaScriptの考え方**を整理します。

## このページのゴール

- 変数、条件分岐、配列、オブジェクト、関数を読める
- `map`、`filter`、`find` を使って配列を扱える
- DOMを取得して、クリックなどのイベントに反応できる
- `fetch`、`Promise`、`async/await` の役割を説明できる
- エラーを見て、どこで何が失敗したかを切り分けられる
- TypeScriptとReactで出てくるコードに抵抗がなくなる

## TypeScriptへの第一歩

JavaScriptを学ぶことは、今後このコースで使用することになる**TypeScript**という言語の先駆けになります。

TypeScriptはJavaScriptを少し発展させたもので、**これさえ理解してしまえばWebサービスは全てこの言語だけで理解が可能**です。現代の多くのWebサービスやアプリケーションがTypeScriptで構築されており、習得すれば非常に強力なスキルとなります。

そのためにも、**JavaScriptの構文に慣れておくことは今後の学習を支える上でとても大切**です。JavaScriptの基礎をしっかり理解しておけば、TypeScriptへの移行はスムーズに進められます。

## JavaScriptとは？

JavaScriptは、Webページに**動的な機能**を追加するためのプログラミング言語です。

### JavaScriptでできること

- **ユーザーの操作に反応する**
  ボタンをクリックしたら何かが起こる、フォームに入力したら検証するなど

- **ページの内容を動的に変更する**
  HTMLやCSSをJavaScriptから操作して、ページの見た目や内容をリアルタイムで変更する

- **データを取得・送信する**
  サーバーと通信して、データを取得したり保存したりする（API通信）

- **アニメーションを実装する**
  要素を滑らかに動かしたり、フェードイン・フェードアウトさせたりする

## なぜJavaScriptが重要なのか？

### 1. TypeScriptの基礎となる最重要言語

JavaScriptを学ぶ最大の理由は、**TypeScriptの基礎になる**からです。このコースでは次にTypeScriptを学びますが、JavaScriptをしっかり理解していれば、TypeScriptへの移行は驚くほどスムーズです。

そして、**TypeScriptさえできてしまえば、どんなプログラミング言語にもスムーズに移ることができます**し、**Webシステム全てを作成することができるようになります**。フロントエンド、バックエンド、モバイルアプリまで、TypeScriptの知識があれば全てに対応できます。

つまり、今JavaScriptを学ぶことは、プログラマーとして必要なスキルの土台を築く、最も重要なステップなのです。

### 2. フロントエンド開発の必須スキル

現代のWebアプリケーションのほとんどは、JavaScriptなしでは成り立ちません。静的なWebページだけを作る時代は終わり、今やJavaScriptは**フロントエンド開発者の必須スキル**です。

### 3. フロントエンドからバックエンドまで

JavaScriptは、ブラウザだけでなく、サーバーサイド（Node.js）でも動作します。つまり、JavaScript一つで**フロントエンドもバックエンドも開発できる**のです。

### 4. 豊富なフレームワーク・ライブラリ

React、Next.jsなど、人気のフロントエンドフレームワークはすべてJavaScript（TypeScript）ベースです。JavaScriptの基礎を学ぶことで、これらの最新技術にスムーズに進めます。

### 5. 需要の高さ

JavaScriptは世界中で最も使われているプログラミング言語の一つです。JavaScriptができるエンジニアの需要は非常に高く、キャリアの幅が広がります。

## プログラミングの基本を学ぶ

JavaScriptを学ぶことは、単にWebページに動きをつけるだけではありません。

- **変数**：データを保存する
- **条件分岐**：条件によって処理を変える
- **繰り返し**：同じ処理を何度も実行する
- **関数**：処理をまとめて再利用する

といった、**プログラミングの基本的な考え方**も身につきます。これらの概念は、他のプログラミング言語にも共通するものです。

## JavaScriptの実行方法

JavaScriptを学ぶ上で、実際にコードを動かして確認することが重要です。以下の方法でJavaScriptを実行できます。

### 1. ブラウザのコンソールで実行する

最も手軽な方法は、ブラウザのコンソールから直接JavaScriptを実行することです。

**[JavaScriptコンソールの使い方](https://www.javadrive.jp/javascript/console/index1.html)**

この方法を使えば、簡単なコードをすぐに試すことができます。実際に手を動かすことで、コードが実行されていることを体感できます。

### 2. VS Codeとブラウザを連携させて実行する

より本格的な開発環境として、VS CodeでJavaScriptファイルを作成し、ブラウザで実行する方法もあります。

**[VS CodeとブラウザでJavaScriptを動かす手順](https://zenn.dev/sdkfz181tiger/articles/e95252e9e98615)**

この方法を使えば、HTMLファイルと一緒にJavaScriptを書いて、実際のWebページとして動作を確認できます。

## 学習教材

以下のZenn本で、JavaScriptの基礎をしっかり学びましょう。この教材は無料で、プログラミング初心者でも理解できるように丁寧に解説されています。

**[JavaScript入門](https://zenn.dev/ojk/books/intro-to-javascript/viewer/js-basic)**

### 学習のポイント

- **コードはコピペでOK、でも全て理解することが大切**
  教材のコードをコピー&ペーストして試すことは全く問題ありません。ただし、コピペしたコードが「何をしているのか」「なぜそうなるのか」を理解することが重要です。一行一行の意味を考え、理解しながら進めましょう。

- **覚えるのではなく、理解すること**
  JavaScriptのメソッドや構文を全て暗記する必要はありません。「こういうことができる」という知識を持っておけば、必要なときに調べて使えます。大切なのは、**どういうものがあるかを一通り学んで知識として持っておくこと**です。

- **ブラウザはGoogle Chromeを使うこと**
  Web開発では、Google Chromeを使うことを強く推奨します。開発者向けのツールが充実しており、JavaScriptのデバッグも簡単に行えます。

- **コンソールで小さなコードから試す**
  最初は簡単なコードをブラウザのコンソールで実行してみましょう。`console.log()`で値を表示するだけでも立派なJavaScriptです。実際に動かすことで理解が深まります。

- **エラーメッセージを読む習慣をつける**
  エラーメッセージは敵ではなく、問題を教えてくれる味方です。デベロッパーツールのコンソールでエラーを確認し、何が問題なのかを理解する習慣をつけましょう。

- **何度も繰り返して慣れる**
  一度読んだだけで理解できなくても大丈夫。何度もコードを書いて、試して、慣れていくことが重要です。プログラミングは反復練習が効果的です。

## 最後に必ず覚えること

ここまでの解説と外部教材を読んだら、最後に次の項目を確認してください。JavaScriptはReact、TypeScript、API通信の土台になるので、ここは少し丁寧に押さえます。

### 1. 変数は `const` を基本にする

JavaScriptでは、値に名前を付けるために変数を使います。基本は `const` です。後から別の値を代入する必要があるときだけ `let` を使います。

```js
const userName = "Taro";
const age = 20;

let count = 0;
count = count + 1;
```

覚える基準は次の通りです。

- `const` - 再代入しない値に使う
- `let` - カウントや入力値など、後で変わる値に使う
- `var` - 古い書き方なので基本的に使わない

ReactやTypeScriptでも、まず `const` を使う癖を付けてください。

### 2. 条件分岐は「状態によって処理を変える」ために使う

```js
const score = 80;

if (score >= 70) {
  console.log("合格です");
} else {
  console.log("再提出です");
}
```

Webアプリでは、条件分岐を頻繁に使います。

- ログインしているならマイページを表示する
- 入力が空ならエラーを表示する
- 読み込み中ならローディングを表示する
- 権限がなければ編集ボタンを隠す

`if` 文は単なる文法ではなく、画面や処理の分岐を作るための基本です。

### 3. オブジェクトは「まとまったデータ」

APIから返ってくるJSON、Reactのprops、フォームの入力値は、ほとんどがオブジェクトとして扱われます。

```js
const user = {
  id: 1,
  name: "Taro",
  email: "taro@example.com"
};

console.log(user.name);
```

`user.name` のように、ドットで中の値を取り出します。TypeScriptでは、このオブジェクトの形に型を付けます。

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

つまり、JavaScriptでオブジェクトを理解しておくと、TypeScriptの型もかなり理解しやすくなります。

### 4. 配列は `map`、`filter`、`find` を優先して覚える

Reactで一覧表示をするとき、配列操作は必ず使います。

```js
const todos = [
  { id: 1, title: "HTMLを学ぶ", done: true },
  { id: 2, title: "JavaScriptを学ぶ", done: false },
  { id: 3, title: "Reactを学ぶ", done: false }
];

const titles = todos.map((todo) => todo.title);
const activeTodos = todos.filter((todo) => !todo.done);
const firstTodo = todos.find((todo) => todo.id === 1);
```

それぞれの役割は次の通りです。

- `map` - 配列の各要素を別の形に変換する
- `filter` - 条件に合う要素だけを残す
- `find` - 条件に合う最初の1件を取り出す

Todoアプリではタスク一覧、SNSでは投稿一覧、管理画面ではユーザー一覧を扱います。配列操作が読めないと、Reactの画面実装で必ず止まります。

### 5. 関数は処理に名前を付けて再利用するためのもの

```js
function formatUserName(user) {
  return `${user.name}さん`;
}

const label = formatUserName({ name: "Taro" });
console.log(label);
```

関数で覚えるポイントは次の通りです。

- 引数 - 関数に渡す値
- 戻り値 - 関数から返ってくる値
- `return` - 戻り値を返す命令
- 関数名 - その処理が何をするかを表す名前

Reactではコンポーネントも関数として書きます。

```jsx
function UserCard({ user }) {
  return <p>{user.name}</p>;
}
```

そのため、JavaScriptの関数に慣れておくことはReact理解に直結します。

### 6. DOM操作は「HTMLをJavaScriptから触る」こと

```html
<button id="saveButton">保存</button>
<p id="message"></p>

<script>
  const button = document.querySelector("#saveButton");
  const message = document.querySelector("#message");

  button.addEventListener("click", () => {
    message.textContent = "保存しました";
  });
</script>
```

このコードでは、ボタンをクリックしたときに画面の文字を変えています。

- `document.querySelector` - HTML要素を取得する
- `addEventListener` - クリックなどのイベントを受け取る
- `textContent` - 要素の文字を変更する
- `value` - inputに入力された値を取得する

ReactではDOMを直接触る場面は減ります。ただし、「ユーザー操作を受け取る」「状態を変える」「画面が変わる」という流れは同じです。

### 7. 非同期処理はAPI通信の土台

サーバーからデータを取る処理は、すぐには終わりません。そのため `async/await` を使います。

```js
async function loadUser() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  console.log(user.name);
}

loadUser();
```

ここで覚える流れは次の通りです。

1. `fetch` でAPIにリクエストを送る
2. `await` でレスポンスを待つ
3. `response.json()` でJSONをJavaScriptの値に変換する
4. 取得したデータを画面表示や処理に使う

この形は、Reactの[fetchでAPI通信](/react/api_fetch/)でもそのまま使います。

### 8. エラーはコンソールで読む

JavaScriptを書いていると、必ずエラーが出ます。大事なのは、エラーを避けることではなく、読めるようになることです。

まず見る場所はChromeのコンソールです。

- `ReferenceError` - 存在しない変数を使っている
- `TypeError` - 想定と違う型の値を扱っている
- `SyntaxError` - 括弧や記号など、文法が壊れている

エラーが出たら、まず「何行目で」「何がないと言われているのか」「どの値が想定と違うのか」を確認してください。

## JavaScriptを学んだ後は？

JavaScriptの基礎をマスターしたら、以下のようなステップに進めます：

1. **TypeScriptへステップアップ**
   このコースでは次にTypeScriptを学びます。JavaScriptの知識があれば、TypeScriptへの移行はスムーズです。型を使ってより安全なコードを書けるようになります。

2. **DOM操作の習得**
   JavaScriptでHTMLやCSSを操作する方法を学び、動的なWebページを作れるようになります。

3. **非同期処理の理解**
   Promise、async/awaitを使って、API通信などの非同期処理を扱えるようになります。

4. **モダンなフレームワークへ**
   React、Next.jsなどのフレームワークを学び、より大規模なアプリケーションを開発できるようになります。

5. **バックエンドにも挑戦**
   Node.jsでサーバーサイド開発も学べます。JavaScriptの知識があれば、フロントエンドからバックエンドまで一貫して開発できます。

まずは基礎をしっかり固めて、一歩ずつ着実にスキルアップしていきましょう。TypeScriptへの道は、このJavaScriptの学習から始まっています。
