---
title: GitHubとPull Request
parent: Git/GitHub基礎
nav_order: 4
---

# GitHubとPull Request

ここまでの3ページで学んだGitの操作は、すべて自分のPCの中で完結していました。このページでは、リポジトリをインターネット上のサービス **GitHub** に置いて共有する方法と、チーム開発の中心となる仕組み **Pull Request（プルリクエスト）** を学びます。

PCが壊れても履歴が残る、他の人と一緒に開発できる、変更を取り込む前にレビューしてもらえる——ローカルだけのGitにこの3つの力を加えるのが、GitHubの役割です。

このページでも、[基本コマンド](/git/basic_commands/)から使っている `git-practice` リポジトリを引き続き使います。

## 学習目標

- リモートリポジトリとローカルリポジトリの関係を説明できる
- GitHub上にリポジトリを作成し、`git push` / `git fetch` / `git pull` でローカルと同期できる
- `git stash` で未コミットの変更を一時退避し、ブランチ切り替えやpull前の整理ができる
- VS Codeのソース管理画面とターミナル操作を使い分けられる
- Pull Requestとは何か、なぜ直接mainにpushせずPRを使うのかを説明できる
- ブランチ作成からPRのマージまでの一連の流れを実行できる

## リモートリポジトリとは

**リモートリポジトリ（remote repository）** とは、ネットワーク上に置かれた、共有用のリポジトリのことです。対して、自分のPCにあるリポジトリを **ローカルリポジトリ（local repository）** と呼びます。

[Gitとは何か](/git/what_is_git/)で触れたとおり、Gitは分散型で、各開発者がローカルに完全な履歴を持ちます。リモートリポジトリは、その履歴をやり取りするための「中央の集合場所」です。ローカルとリモートの間では、主に3つの操作を行います。

- **push（プッシュ）** … ローカルのコミットをリモートへ送る（アップロード）
- **fetch（フェッチ）** … リモートの新しい履歴をローカルに取得する。ただし、作業中のブランチにはまだ混ぜない
- **pull（プル）** … リモートの新しいコミットをローカルへ取り込む（fetch＋マージ）

```mermaid
flowchart TB
    subgraph cloud["GitHub（インターネット上）"]
        R["リモートリポジトリ<br>origin"]
    end
    subgraph pc1["あなたのPC"]
        L1["ローカルリポジトリ"]
    end
    subgraph pc2["チームメイトのPC"]
        L2["ローカルリポジトリ"]
    end
    L1 -- "git push" --> R
    R -- "git fetch<br>git pull" --> L1
    L2 -- "git push" --> R
    R -- "git fetch<br>git pull" --> L2
    style R fill:#e3f2fd,stroke:#1565c0
    style L1 fill:#e8f5e9,stroke:#2e7d32
    style L2 fill:#fff3e0,stroke:#ef6c00
```

各メンバーは自分のローカルでコミットを作り、pushでリモートへ送り、他のメンバーの変更をfetchまたはpullで受け取ります。リモートリポジトリが履歴の「公式な置き場所」として機能するわけです。

**GitHub**は、このリモートリポジトリのホスティング（置き場所の提供）に加えて、ブラウザで履歴を閲覧する機能、後述のPull Request、課題管理（Issues）などを提供するWebサービスです。世界中の開発者が使っており、有名なオープンソースソフトウェア（ReactやTypeScript自体も）の開発はGitHub上で行われています。

## GitHubのセットアップ

### アカウントの作成

[https://github.com/](https://github.com/) にアクセスし、「Sign up」からアカウントを作成してください。ユーザー名は公開され、今後ポートフォリオとしても使われるので、慎重に選びましょう。メールアドレスは、[Gitとは何か](/git/what_is_git/)で `git config` に設定したものと同じにしてください。コミットの作者とGitHubアカウントが正しく結びつきます。

### リポジトリの作成

GitHubにログインしたら、画面右上の「+」→「New repository」を選びます。設定項目は次のとおりです。

- **Repository name** … `git-practice`（ローカルと同じ名前にしておくと分かりやすい）
- **Public / Private** … Publicは全世界に公開、Privateは自分（と招待した人）だけが見られます。練習用なのでどちらでも構いませんが、迷ったらPrivateにしてください。
- **Initialize this repository with** … READMEなどの初期化オプションには**チェックを入れません**。手元にすでにリポジトリがあるためです。

「Create repository」を押すと、空のリモートリポジトリができます。

### 認証の準備

ローカルからGitHubへpushするには、「このpushはアカウントの持ち主本人によるものだ」と証明する認証が必要です。HTTPSでの接続では、初回のpush時に認証を求められます。GitHubはパスワードでの認証を廃止しているため、ブラウザ連携の認証ツール（Git Credential ManagerやGitHub CLI）を使うか、**Personal Access Token（パーソナルアクセストークン）** という専用の文字列を発行してパスワードの代わりに入力します。トークンはGitHubの Settings → Developer settings → Personal access tokens から発行できます。発行したトークンは秘密情報なので、`.env` と同じく誰にも見せないでください。

## push：ローカルの履歴をGitHubへ送る

ローカルの `git-practice` リポジトリに、リモートの場所を登録します。リポジトリ作成直後のGitHubの画面に表示されているURL（`https://github.com/ユーザー名/git-practice.git`）を使います。

```bash
cd ~/git-practice
git remote add origin https://github.com/your-name/git-practice.git
```

**コード解説**

- `git remote add` … リモートリポジトリの場所（URL）に名前を付けて登録するコマンドです。
- `origin`（オリジン） … 登録する名前です。慣習として、メインのリモートには `origin` という名前を付けます。以後「`origin` = GitHub上のあのリポジトリ」として扱えます。
- URLの `your-name` は自分のGitHubユーザー名に置き換えてください。

登録できたら、いよいよpushします。

```bash
git push -u origin main
```

実行結果の例:

```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Writing objects: 100% (15/15), 1.45 KiB | 1.45 MiB/s, done.
To https://github.com/your-name/git-practice.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

**コード解説**

- `git push origin main` … 「`main` ブランチのコミットを `origin` へ送る」という意味です。
- `-u` … 「今後 `main` は `origin` の `main` と対応させる」という紐づけ（上流ブランチの設定）を保存するオプションです。一度 `-u` 付きでpushすれば、次回からは `git push` だけで済みます。

ブラウザでGitHubのリポジトリページを開いて（再読み込みして）みてください。`README.md` の内容と、これまでのコミット履歴がすべて表示されているはずです。あなたのコードがインターネット上にバックアップされた瞬間です。

## fetch / pull / clone：リモートから受け取る

逆方向の操作も覚えておきましょう。

- `git fetch` … リモートにある新しい履歴を取得します。ただし、今開いているファイルや作業中のブランチにはまだ混ぜません。「GitHub側に何か増えていないかを安全に確認する」操作です。

```bash
git fetch
```

- `git pull` … リモートにある新しいコミットをローカルに取り込みます。チーム開発では、他のメンバーのpushを受け取るために毎日使います。一人での開発でも、後述のPRをGitHub上でマージした後、その結果をローカルの `main` に反映するために使います。

```bash
git pull
```

- `git clone` … リモートリポジトリを**まるごとローカルに複製**します。別のPCで開発を始めるときや、他人のリポジトリを手元に持ってくるときに使います。`git init` から始める代わりに、既存のリモートから始めるための入口です。

```bash
git clone https://github.com/your-name/git-practice.git
```

実行すると、現在のフォルダの下に `git-practice` フォルダが作られ、全履歴とともに複製されます（今は実行しなくて構いません）。

### fetchとpullの違い

`git pull` は便利ですが、内部では「`git fetch` でリモートの履歴を取得する」→「取得した履歴を今のブランチへマージする」という2段階の処理をまとめて実行しています。

```mermaid
flowchart LR
    R["GitHub上の<br>origin/main"]
    T["ローカルに保存された<br>origin/main"]
    M["作業中の<br>main"]
    R -- "git fetch<br>取得だけ" --> T
    T -- "git merge<br>作業中のmainへ統合" --> M
    R -- "git pull<br>fetch + merge" --> M
    style R fill:#e3f2fd,stroke:#1565c0
    style T fill:#fff3e0,stroke:#ef6c00
    style M fill:#e8f5e9,stroke:#2e7d32
```

**コード解説**

- `git fetch` … GitHub上の最新状態をローカルの `origin/main` などに保存します。作業中の `main` や作業ファイルは変わりません。
- `git merge origin/main` … 取得済みの `origin/main` を、今いるブランチへ統合します。
- `git pull` … 上の2つをまとめて行います。普段は `pull` で十分ですが、「何が来るか先に見たい」「pullでいきなりコンフリクトしたくない」場合は `fetch` から始めると落ち着いて確認できます。

> 実務では、作業開始時に `git switch main` → `git pull` で最新化することが多いです。一方で、リモートの状況だけ確認したいときや、変更が多そうなときは `git fetch` → `git log --oneline main..origin/main` のように先に差分を見ます。

## stash：作業中の変更を一時退避する

実務では、「まだコミットするほどではない変更が手元にあるが、急ぎで別ブランチへ切り替えたい」という場面があります。たとえば、Todoアプリのフォームを編集中に、`main` の緊急修正を取り込む必要が出たとします。

そのまま `git switch main` や `git pull` を実行すると、未コミットの変更と切り替え先のファイルがぶつかる可能性があります。そこで使うのが **stash（スタッシュ、一時退避）** です。

```bash
git status
git stash push -m "Todoフォームの途中"
git switch main
git pull
git switch add-todo-form
git stash pop
```

**コード解説**

- `git status` … 退避する前に、どのファイルが変更されているか確認します。
- `git stash push -m "Todoフォームの途中"` … 未コミットの変更を名前付きで一時退避し、作業ツリーをきれいな状態に戻します。
- `git switch main` → `git pull` … `main` に移動して、リモートの最新状態を取り込みます。
- `git switch add-todo-form` … 元の作業ブランチに戻ります。
- `git stash pop` … 退避していた変更を作業ツリーに戻します。戻したstashは一覧から消えます。

よく使う関連コマンドも押さえておきましょう。

| コマンド | 使う場面 |
|---|---|
| `git stash list` | 退避中の変更一覧を見る |
| `git stash show -p stash@{0}` | 退避した変更の差分を見る |
| `git stash apply stash@{0}` | stashを残したまま変更だけ戻す |
| `git stash drop stash@{0}` | 不要になったstashを削除する |

> 注意: stashは「仮置き場」であって、共有用の履歴ではありません。作業の区切りがついたら、必ず意味のある単位で `git add` → `git commit` してください。長期間stashに置いたままにすると、何の変更だったか分からなくなります。

## VS CodeでのGit作業

Git操作は、VS Codeのソース管理画面からも行えます。変更ファイルの確認、差分表示、ステージング、コミット、ブランチ切り替え、コンフリクト解消は、画面で見るほうが分かりやすい場面があります。

一方で、ターミナルのコマンドも必ず覚えてください。理由は3つあります。

- エラーが起きたとき、検索や質問では `git status` や `git log` などのコマンド出力を前提に話が進む
- CI/CDやサーバー上の作業では、GUIが使えずコマンドだけで操作する場面がある
- `fetch`、`stash`、細かい差分確認などは、コマンドで実行したほうが意図を明確に残しやすい

つまり、**普段はVS Codeで視覚的に確認し、判断が必要な場面ではターミナルで現在地を確かめる**のがよい使い分けです。特にコンフリクト解消では、VS Codeの3-way merge editorで両方の変更を見比べながら、最後に `git status` で解消済みか確認すると安全です。

参考リンク:

- [VSCodeでのGitの基本操作まとめ - Qiita](https://qiita.com/y-tsutsu/items/2ba96b16b220fb5913be)
- [開発環境を整える(VSCode + Git) - Zenn](https://zenn.dev/ameyo/articles/1b58281341771f)
- [Source Control in VS Code - Visual Studio Code Docs](https://code.visualstudio.com/docs/sourcecontrol/overview)

## Pull Request：レビューを挟んで取り込む

ここからがこのページの本題です。

**Pull Request（プルリクエスト、略してPR）** とは、「このブランチの変更を `main` に取り込んでください（pullしてください）」という**依頼**をGitHub上で作成し、**コードレビューを経てからマージする**仕組みです。

[ブランチとマージ](/git/branch_and_merge/)では、自分のローカルで `git merge` を実行してブランチを取り込みました。チーム開発では、これをそのままやることはほとんどありません。なぜなら、

- **間違いに気づける人が自分しかいない。** マージ前に他の人の目（レビュー）を通すことで、バグや設計の問題を早期に発見できます。
- **変更の経緯が残らない。** PRには「なぜこの変更をするのか」の説明と議論が記録され、後から経緯を追えます。
- **mainを壊すリスクが高い。** 直接pushを禁止してPR経由に限定すれば、`main` には「レビュー済みの変更」しか入らなくなります。

実務では「`main` への直接pushは禁止、すべての変更はPR経由」というルールがごく一般的です。本カリキュラムでも、これ以降の開発はこのスタイルで進めます。

### PRの流れ（全体像）

開発者がPRを作ってからマージされるまでの登場人物のやり取りを、シーケンス図で示します。

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant GH as GitHub
    participant Rev as レビュアー
    Dev->>Dev: ブランチを作成しコミット
    Dev->>GH: git push（ブランチを送る）
    Dev->>GH: Pull Requestを作成（変更の説明を書く）
    GH->>Rev: レビュー依頼を通知
    Rev->>GH: 差分を確認しコメント（修正依頼）
    GH->>Dev: コメントを通知
    Dev->>Dev: 指摘を修正してコミット
    Dev->>GH: git push（修正を送る、PRに自動反映）
    Rev->>GH: 再確認して承認（Approve）
    Dev->>GH: PRをマージ（mainに取り込む）
    GH->>GH: ブランチを削除
    Dev->>Dev: git pull（ローカルのmainを最新化）
```

ポイントは、push済みのブランチに追加のコミットをpushすると**PRの内容も自動で更新される**ことです。「修正依頼 → 修正をpush → 再レビュー」のループを、同じPRの上で何度でも回せます。

### 実際にPRを作ってみる

一人でも、この流れはそのまま練習できます（レビュアーも自分が兼ねます）。

**ステップ1: ブランチを作って変更をコミットする**

```bash
git switch -c add-license-info
```

**`README.md`**（末尾に追加）

```markdown

## ライセンス

このリポジトリは学習目的で作成されています。
```

```bash
git add README.md
git commit -m "READMEにライセンス情報を追加"
```

**ステップ2: ブランチをGitHubへpushする**

```bash
git push -u origin add-license-info
```

実行結果の例:

```
To https://github.com/your-name/git-practice.git
 * [new branch]      add-license-info -> add-license-info
remote:
remote: Create a pull request for 'add-license-info' on GitHub by visiting:
remote:      https://github.com/your-name/git-practice/pull/new/add-license-info
```

親切なことに、実行結果の中に「このブランチでPRを作るならこのURLへ」という案内が表示されます。

**ステップ3: GitHub上でPRを作成する**

表示されたURLをブラウザで開くか、GitHubのリポジトリページに表示される「Compare & pull request」ボタンを押します。PR作成画面では次を確認・入力します。

- **base: main ← compare: add-license-info** … 「`add-license-info` の変更を `main` に取り込む」という方向の指定です。
- **タイトル** … 変更の要約。例:「READMEにライセンス情報を追加」
- **説明欄** … なぜこの変更をするのか、何を変えたのかを書きます。レビュアーはまずここを読むので、コミットメッセージより丁寧に書くのが礼儀です。

「Create pull request」を押すとPRが作成されます。

**ステップ4: 差分を確認する（レビュー）**

PRページの「Files changed」タブを開くと、[基本コマンド](/git/basic_commands/)で学んだ `git diff` と同じ形式で、追加行が緑、削除行が赤で表示されます。チーム開発ではレビュアーがここを読み、行単位でコメントを付けます。今回は自分で差分を見直し、問題がないことを確認してください。

**ステップ5: マージする**

「Conversation」タブに戻り、緑色の「Merge pull request」→「Confirm merge」を押します。これでGitHub上の `main` に変更が取り込まれました。続けて表示される「Delete branch」ボタンで、役目を終えたブランチをリモートから削除しておきましょう。

**ステップ6: ローカルのmainを最新化する**

マージはGitHub上で行われたので、ローカルの `main` はまだ古いままです。取り込みます。

```bash
git switch main
git pull
```

実行結果の例:

```
Updating 3c4d5e6..7f8a9b0
Fast-forward
 README.md | 4 ++++
 1 file changed, 4 insertions(+)
```

ローカルの作業ブランチも削除して、一連の流れは完了です。

```bash
git branch -d add-license-info
```

### 開発の基本サイクル（今後ずっと使う形）

このページまでの内容を合わせると、今後のカリキュラム全体で使う開発サイクルが完成します。

1. `git switch main` → `git pull` で最新の状態から始める
2. `git switch -c 作業ブランチ名` で枝を切る
3. 編集 → `git add` → `git commit` を繰り返す
4. `git push -u origin 作業ブランチ名` で送る
5. GitHubでPRを作成し、レビューを経てマージする
6. ローカルで `git switch main` → `git pull` し、1に戻る

このサイクルが身についていれば、チーム開発の現場にそのまま入っていけます。

## 理解度チェック

**Q1. `git push`、`git fetch`、`git pull` は、それぞれ何をする操作ですか。**

<details markdown="1">
<summary>解答を見る</summary>

- `git push` … **ローカル**リポジトリのコミットを**リモート**リポジトリへ送ります（アップロード方向）。
- `git fetch` … **リモート**リポジトリの新しい履歴をローカルに取得します。ただし、作業中のブランチにはまだ混ぜません。
- `git pull` … **リモート**リポジトリにある新しいコミットを**ローカル**の作業中ブランチへ取り込みます。実質的には `fetch` とマージをまとめて行う操作です。

ローカルが「自分の手元」、リモート（origin）が「GitHub上の共有場所」という位置関係を図で描けるようにしておきましょう。

</details>

**Q2. `git remote add origin <URL>` の `origin` とは何ですか。**

<details markdown="1">
<summary>解答を見る</summary>

リモートリポジトリのURLに付けた**名前（別名）**です。毎回長いURLを入力する代わりに、`git push origin main` のように名前で指定できるようになります。

`origin` という名前自体に特別な機能はなく、慣習としてメインのリモートにこの名前を付けます。

</details>

**Q3. ローカルで `git merge` すれば済むのに、チーム開発ではなぜPull Requestを使うのですか。理由を2つ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

例として次の理由があります（2つ挙げられれば正解です）。

- **マージ前にレビューを挟める。** 他の人の目を通すことで、バグや設計の問題を `main` に入る前に発見できます。
- **変更の経緯が記録に残る。** PRの説明文や議論のコメントが残るため、後から「なぜこの変更が入ったのか」を追跡できます。
- **mainの品質を守れる。** 直接pushを禁止しPR経由に限定すれば、`main` にはレビュー済みの変更しか入りません。

</details>

**Q4. PRにレビューで修正依頼が来ました。修正をPRに反映するには何をすればよいですか。**

<details markdown="1">
<summary>解答を見る</summary>

PRの元になっているローカルの作業ブランチで修正をコミットし、**同じブランチを再度pushする**だけです。push済みブランチへの追加コミットは、開いているPRに自動で反映されます。PRを作り直す必要はありません。

</details>

**Q5. GitHub上でPRをマージした直後、ローカルの `main` で新しい作業を始める前にやるべきことは何ですか。その理由も説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

`git switch main` してから `git pull` を実行し、ローカルの `main` を最新化することです。

PRのマージは**GitHub上（リモート）**で行われたため、ローカルの `main` はマージ前の古い状態のままです。古い `main` から次の作業ブランチを切ると、マージ済みの変更が含まれない状態で作業を始めることになり、後で不要なコンフリクトの原因になります。「作業を始める前に `main` を最新化する」を習慣にしてください。

</details>

**Q6. 未コミットの変更が残っている状態で、急ぎで別ブランチへ切り替えたいときはどうしますか。**

<details markdown="1">
<summary>解答を見る</summary>

まず `git status` で変更内容を確認し、まだコミットしたくない途中作業なら `git stash push -m "作業内容のメモ"` で一時退避します。別ブランチで必要な作業を終えたら、元のブランチへ戻って `git stash pop` で退避した変更を戻します。

ただし、stashは一時置き場です。作業の区切りがついたら、意味のある単位で `git add` → `git commit` してください。

</details>

## セルフレビュー

- [ ] ローカルリポジトリとリモートリポジトリの関係を図で描ける
- [ ] push / fetch / pull / clone の違いを自分の言葉で説明できる
- [ ] `git stash` で未コミットの変更を一時退避し、必要なタイミングで戻せる
- [ ] VS Codeのソース管理画面とターミナルのGitコマンドを使い分けられる
- [ ] GitHubにリポジトリを作成し、ローカルのリポジトリをpushできた
- [ ] `git push -u origin main` の `-u` の意味を説明できる
- [ ] Pull Requestを使う理由（レビュー・記録・mainの保護）を説明できる
- [ ] ブランチ作成からPRのマージ、ローカルのmain最新化までの一連の流れを、何も見ずに実行できる
- [ ] PRの「Files changed」で差分を読み、何が変わるのかを説明できる

## 次のステップ

次のページ「[練習問題](/git/practice/)」で、このセクション全体の総仕上げをします。リポジトリの作成からPRのマージまでを、手順書なしで通して実行できるか確かめましょう。

また、このページで学んだ内容は今後のカリキュラムの大前提です。[CI/CD](/cicd/)のセクションでは「GitHubへのpushやPR作成をきっかけに、テストやビルドが自動実行される」仕組み（GitHub Actions）を作ります。デプロイ自動化は、その後の[AWSデプロイ](/aws/)で同じ仕組みを発展させて扱います。[SNS開発](/sns/)では、GitHub上のリポジトリを起点に、PRベースの開発フローで実際のアプリケーションを作り上げます。

- 前のページ: [ブランチとマージ](/git/branch_and_merge/)
- 次のページ: [練習問題](/git/practice/)
