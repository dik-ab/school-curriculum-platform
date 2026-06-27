---
title: 練習問題
parent: Git/GitHub基礎
nav_order: 5
---

# 練習問題

このページは「Git/GitHub基礎」セクションの総仕上げです。これまでの4ページで学んだ内容を、手順書を見ずに自分の力で通して実行できるかを確かめます。

問題は、実際の開発で毎日行う操作を小さなシナリオにしたものです。**まず自力で解き、行き詰まったらヒントを見て、最後に解答例で答え合わせをする**、という順番で進めてください。コマンドを忘れた場合に各ページへ戻って調べるのは「カンニング」ではありません。実務でも調べながら書くのが普通です。ただし、解答例の丸写しだけは避けてください。

## 学習目標

- リポジトリの作成からコミットまでを、手順書なしで実行できる
- ブランチを使った開発とコンフリクトの解消を、自力で完遂できる
- GitHubへのpushとPull Requestの一連の流れを、自力で完遂できる
- 操作に迷ったときに `git status` で状況を把握し、自分で対処できる

## 準備

この練習では、これまでの `git-practice` とは別に、新しいプロジェクトを使います。**架空のカフェの紹介サイト**を題材に、リポジトリ運用を最初から最後まで体験します。HTMLの内容は[フロントエンド基礎](/frontend/html_css/)で学んだ範囲の簡単なものだけです。

## 問題1: リポジトリの作成と最初のコミット

次の作業を行ってください。

1. `cafe-site` というフォルダを作り、Gitリポジトリにする
2. 以下の2つのファイルを作成する

**`index.html`**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Cafe Mirage</title>
  </head>
  <body>
    <h1>Cafe Mirage</h1>
    <p>静かな路地裏のコーヒー専門店です。</p>
  </body>
</html>
```

**`.gitignore`**

```
.DS_Store
node_modules/
```

3. 2つのファイルを**1つのコミット**として記録する。コミットメッセージは内容が分かるものにする
4. `git log --oneline` で、コミットが1つ記録されていることを確認する

<details markdown="1">
<summary>ヒントを見る</summary>

- リポジトリ化は `git init` です。実行する場所（`cafe-site` の中）に注意してください。
- 複数ファイルをまとめてステージングするには `git add .` が使えます。実行後に `git status` で「2ファイルとも `Changes to be committed` になっているか」を確認しましょう。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

```bash
mkdir cafe-site
cd cafe-site
git init
```

ファイルをVS Codeなどで作成した後:

```bash
git add .
git status
git commit -m "トップページと.gitignoreを追加"
git log --oneline
```

実行結果の例:

```
e1f2a3b (HEAD -> main) トップページと.gitignoreを追加
```

**ポイント:** `.gitignore` は[基本コマンド](/git/basic_commands/)で学んだとおり、不要なファイルをうっかりコミットする前に、**プロジェクトの最初に**用意しておくのが安全です。

</details>

## 問題2: 変更の確認とコミット

メニューの節を追加します。

1. `index.html` の `</body>` の直前に、次の内容を追加する

```html
    <h2>メニュー</h2>
    <ul>
      <li>ブレンドコーヒー</li>
      <li>カフェラテ</li>
    </ul>
```

2. コミットする**前に**、自分の変更内容を行単位で確認する
3. 確認できたらコミットする

<details markdown="1">
<summary>ヒントを見る</summary>

- 変更内容の行単位の確認は `git diff` です。`+` の行が追加した内容として表示されているか確認してください。
- 表示が長い場合は `q` で終了できます。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

```bash
git diff
```

実行結果の例（抜粋）:

```diff
+    <h2>メニュー</h2>
+    <ul>
+      <li>ブレンドコーヒー</li>
+      <li>カフェラテ</li>
+    </ul>
```

追加した5行が `+` で表示されていれば、意図どおりの変更です。

```bash
git add index.html
git commit -m "メニューの節を追加"
```

**ポイント:** 「コミット前に `git diff` で見直す」習慣が問われています。差分を読んで「このコミットには何が含まれるのか」を説明できる状態でコミットするのが理想です。

</details>

## 問題3: ブランチでの開発とマージ

営業時間の情報を、ブランチを使って追加します。

1. `add-hours` という名前のブランチを作成し、切り替える
2. `index.html` のメニューの下（`</body>` の直前）に次を追加してコミットする

```html
    <h2>営業時間</h2>
    <p>10:00〜19:00（水曜定休）</p>
```

3. `main` に切り替え、`index.html` に営業時間の節が**ないこと**を確認する
4. `add-hours` を `main` にマージする
5. マージ済みの `add-hours` ブランチを削除する

<details markdown="1">
<summary>ヒントを見る</summary>

- ブランチの作成と切り替えを同時に行うのは `git switch -c ブランチ名` です。
- マージは「取り込む側（`main`）に移動してから `git merge 取り込みたいブランチ名`」の順です。
- ブランチの削除は `git branch -d ブランチ名` です。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

```bash
git switch -c add-hours
```

ファイルを編集した後:

```bash
git add index.html
git commit -m "営業時間の節を追加"

git switch main
cat index.html
```

`main` では営業時間の節が表示されないことが確認できます。ブランチを切り替えると作業ツリーの中身も切り替わるためです。

```bash
git merge add-hours
git branch -d add-hours
```

マージの実行結果に `Fast-forward` と表示されたはずです。枝分かれした後、`main` 側には新しいコミットがなかったため、付箋を先へ動かすだけで合流が完了しました（→ [ブランチとマージ](/git/branch_and_merge/)）。

</details>

## 問題4: コンフリクトの解消

少し難しい問題です。わざとコンフリクトを起こし、自力で解消してください。

1. `main` から `update-greeting-a` ブランチを作り、`<p>静かな路地裏のコーヒー専門店です。</p>` の行を `<p>路地裏にたたずむ自家焙煎コーヒーの店です。</p>` に変更してコミットする
2. `main` に戻り、`update-greeting-b` ブランチを作り、**同じ行**を `<p>静かな路地裏で、一杯ずつ丁寧に淹れています。</p>` に変更してコミットする
3. `main` に戻り、`update-greeting-a` をマージする（これは成功するはずです）
4. 続けて `update-greeting-b` をマージし、コンフリクトを発生させる
5. 両方の文の意図を活かした1文に書き換えて、コンフリクトを解消し、マージを完了させる
6. 2つの作業ブランチを削除する

<details markdown="1">
<summary>ヒントを見る</summary>

- コンフリクトが起きたら、慌てずに `git status` で対象ファイルを確認します。
- ファイルを開くと `<<<<<<< HEAD` / `=======` / `>>>>>>> update-greeting-b` のマーカーがあります。**マーカーの3行も含めて**、最終的にあるべき内容に書き換えます。
- 書き換えたら `git add` → `git commit` でマージ完了です。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

手順1〜3:

```bash
git switch -c update-greeting-a
# 編集してから
git add index.html
git commit -m "紹介文を自家焙煎推しに変更"

git switch main
git switch -c update-greeting-b
# 編集してから
git add index.html
git commit -m "紹介文を丁寧さ推しに変更"

git switch main
git merge update-greeting-a
```

手順4でコンフリクトが発生します:

```bash
git merge update-greeting-b
```

```
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

`index.html` を開くと、該当箇所が次のようになっています。

```
<<<<<<< HEAD
    <p>路地裏にたたずむ自家焙煎コーヒーの店です。</p>
=======
    <p>静かな路地裏で、一杯ずつ丁寧に淹れています。</p>
>>>>>>> update-greeting-b
```

マーカーごと削除し、両方の意図を活かした内容に書き換えます（一例です）。

```html
    <p>路地裏の自家焙煎コーヒー店。一杯ずつ丁寧に淹れています。</p>
```

解消を完了させ、ブランチを片付けます。

```bash
git add index.html
git commit -m "紹介文の変更をマージ（両案を統合）"
git branch -d update-greeting-a
git branch -d update-greeting-b
```

**ポイント:** コンフリクトは「同じファイルの同じ箇所」を両方の枝が変更したときに起こります。解消とは「マーカーを消して、人間が最終形を決めること」です。マーカーの消し忘れがないか、コミット前に `git diff --staged` で確認するとより安全です。

</details>

## 問題5: GitHubへの公開とPull Request

総仕上げです。`cafe-site` をGitHubに公開し、PR経由で変更を取り込んでください。

1. GitHubに `cafe-site` という名前のリポジトリを作成する（初期化オプションはすべてオフ）
2. ローカルの `cafe-site` にリモートを登録し、`main` をpushする
3. `add-access` ブランチを作成し、`</body>` の直前にアクセス情報を追加してコミットする

```html
    <h2>アクセス</h2>
    <p>みらい市中央区1-2-3 / みらい駅から徒歩5分</p>
```

4. ブランチをpushし、GitHub上でPull Requestを作成する（タイトルと説明も書く）
5. 「Files changed」で差分を確認してからマージし、リモートのブランチを削除する
6. ローカルの `main` を最新化し、ローカルの作業ブランチも削除する

<details markdown="1">
<summary>ヒントを見る</summary>

- リモートの登録は `git remote add origin <URL>`、初回のpushは `git push -u origin main` です。
- 作業ブランチのpushも `-u` 付きで `git push -u origin add-access` とします。実行結果にPR作成用のURLが表示されます。
- マージ後のローカル最新化は「`git switch main` → `git pull`」の順です。

</details>

<details markdown="1">
<summary>解答例を見る</summary>

手順2（URLは自分のものに置き換えてください）:

```bash
git remote add origin https://github.com/your-name/cafe-site.git
git push -u origin main
```

手順3〜4:

```bash
git switch -c add-access
# 編集してから
git add index.html
git commit -m "アクセス情報を追加"
git push -u origin add-access
```

ブラウザでPRを作成します。説明欄には、たとえば「来店希望のお客様向けに、住所と最寄り駅からの所要時間を追加しました」のように、**なぜ・何を**変更したのかを書きます。

手順5〜6: GitHub上で「Files changed」を確認 → 「Merge pull request」→「Delete branch」。その後ローカルで:

```bash
git switch main
git pull
git branch -d add-access
```

**ポイント:** この問題の流れ（main最新化 → ブランチ作成 → コミット → push → PR → マージ → main最新化）は、[GitHubとPull Request](/git/github_and_pr/)で学んだ開発の基本サイクルそのものです。これが手順書なしでできれば、このセクションは合格です。

</details>

## 発展問題（余裕があれば）

解答例は付けません。これまでのページと `git help <コマンド名>` を頼りに挑戦してください。

1. **入門編の成果物をGitHubに公開する。** [入門編最終問題](/final_project/)で作ったプロジェクトをリポジトリ化し、GitHubにpushしてください。`node_modules/` を含めないように注意してください。
2. **履歴の考古学。** `cafe-site` で `git log --oneline` を見て、「紹介文がいつ・なぜ今の文になったのか」を履歴だけから説明してください。コンフリクトを解消したマージコミットが見つかるはずです。
3. **READMEをPRで追加する。** `cafe-site` に、サイトの概要と公開手順を書いた `README.md` をPR経由で追加してください。

## 理解度チェック

最後に、このセクション全体の理解を確認します。

**Q1. 「編集した変更がコミットされるまで」に変更が通過する場所を、コマンド名とともに順に説明してください。**

<details markdown="1">
<summary>解答を見る</summary>

1. **作業ツリー** … ファイルを編集した直後の変更がある場所
2. `git add` で **ステージングエリア** へ … 次のコミットに含める変更を選んで載せる
3. `git commit` で **リポジトリ** へ … 履歴（コミット）として記録される

この3段階の流れは[Gitとは何か](/git/what_is_git/)で学んだ、Git理解の核となるモデルです。

</details>

**Q2. 問題3のマージはコンフリクトせず、問題4のマージはコンフリクトしました。この違いはどこから来ましたか。**

<details markdown="1">
<summary>解答を見る</summary>

問題3では、枝分かれした後に変更があったのは `add-hours` ブランチだけで、`main` 側には新しいコミットがありませんでした。そのためfast-forwardで単純に合流できました。

問題4では、`update-greeting-a` のマージによって `main` 側の紹介文がすでに変わっており、そこへ**同じ行**を別の内容に変更した `update-greeting-b` をマージしようとしました。同じ箇所への異なる変更はGitには自動で統合できないため、コンフリクトとして人間に判断が委ねられました。

</details>

**Q3. チームの新メンバーに「mainに直接pushしないで」と伝えることになりました。理由をどう説明しますか。**

<details markdown="1">
<summary>解答を見る</summary>

説明の例:「`main` は常に動く状態を保つべきブランチです。直接pushすると、誰のチェックも受けていない変更が入ってしまい、バグの混入に気づけません。作業ブランチを切ってPull Requestを作れば、マージ前にレビューで問題を見つけられますし、変更の理由や議論がPRに記録として残るので、後から経緯を追うこともできます。」

「レビューによる品質の担保」と「経緯の記録」の2点が伝えられれば十分です。

</details>

**Q4. 作業中に「自分が今どういう状態にいるのか」分からなくなりました。最初に実行すべきコマンドは何ですか。**

<details markdown="1">
<summary>解答を見る</summary>

`git status` です。現在のブランチ、変更されたファイル、ステージングの状態、コンフリクトの有無まで、現在地の情報が一通り表示されます。多くの場合「次に何をすべきか」のコマンド例まで表示してくれます。

迷ったら `git status`、履歴を知りたければ `git log --oneline`、変更内容を知りたければ `git diff`。この3つの確認コマンドはファイルを一切変更しないので、何度実行しても安全です。

</details>

## セルフレビュー

セクション全体の仕上げとして確認してください。

- [ ] 問題1〜5を、解答例を見ずに（ヒントまでで）完遂できた
- [ ] 作業ツリー・ステージングエリア・リポジトリの図を白紙に描ける
- [ ] 「編集 → status → diff → add → commit」のサイクルが手に馴染んでいる
- [ ] ブランチの作成・切り替え・マージ・削除を、何も見ずに実行できる
- [ ] コンフリクトが起きても、慌てずに解消できる自信がある
- [ ] GitHubへのpushからPRのマージ、ローカルのmain最新化までの開発サイクルを通して実行できる
- [ ] `.gitignore` に書くべきものを、新しいプロジェクトを始めるときに自分で判断できる

## 次のステップ

「Git/GitHub基礎」セクションはこれで完了です。お疲れさまでした。

ここで身につけた開発サイクルは、このカリキュラムの残りすべてで毎日使います。次のセクション[実践: フルスタックTodoアプリ](/fullstack-todo/)からは、新しく作るプロジェクトをすべてGitで管理しながら進めてください（誰かに指示されなくても、です）。コミットの積み重ねがそのまま学習の記録になります。

さらに先の[CI/CD](/cicd/)セクションでは、「GitHubへのpushやPull Requestをきっかけに、テスト・ビルド・デプロイが自動で走る」仕組みをGitHub Actionsで構築します。また、[SNS開発（最終プロジェクト）](/sns/)は、GitHubリポジトリの作成から始まり、PRベースの開発フローで進める実戦そのものです。このセクションの内容が少しでも曖昧なら、今のうちに該当ページへ戻って固めておいてください。

- 前のページ: [GitHubとPull Request](/git/github_and_pr/)
- 次のセクション: [実践: フルスタックTodoアプリ](/fullstack-todo/)
