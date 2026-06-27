---
title: Web全体像
section_key: web-basics
section_title: Web基礎
nav_order: 0
description: ブラウザ、フロントエンド、API、バックエンド、データベース、インフラ、CI/CDの役割を最初に整理します。
---

# Web全体像

Webサービスは、1つの技術だけで動いているわけではありません。ブラウザ、フロントエンド、API、バックエンド、データベース、インフラ、CI/CDが役割分担して動いています。

このページでは、HTML/CSSやJavaScriptに入る前に、Web開発の全体地図を先に押さえます。

<div class="web-map">
  <section class="web-map-stage web-map-stage-user">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H14l1 3h2v2H7v-2h2l1-3H6.5A2.5 2.5 0 0 1 4 13.5v-8Zm2.5-.5a.5.5 0 0 0-.5.5V13.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V5.5a.5.5 0 0 0-.5-.5h-11Z"/></svg>
    </div>
    <h2>ブラウザ</h2>
    <p>ユーザーがWebページを見るためのアプリ。HTML、CSS、JavaScriptを読み込んで画面を表示します。</p>
  </section>

  <div class="web-flow-arrow" aria-hidden="true">request</div>

  <section class="web-map-stage web-map-stage-front">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4V4Zm2 2v3h12V6H6Zm0 5v7h5v-7H6Zm7 0v7h5v-7h-5Z"/></svg>
    </div>
    <h2>フロントエンド</h2>
    <p>画面を作る領域。入力フォーム、ボタン、一覧、状態管理、API通信など、ユーザーが直接触る部分を担当します。</p>
  </section>

  <div class="web-flow-arrow" aria-hidden="true">API</div>

  <section class="web-map-stage web-map-stage-back">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M5 4h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 9h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm2-7v3h2V6H7Zm0 9v3h2v-3H7Z"/></svg>
    </div>
    <h2>バックエンド</h2>
    <p>データ処理、認証、権限、業務ルール、外部サービス連携を担当します。APIとしてフロントエンドから呼ばれます。</p>
  </section>

  <div class="web-flow-arrow" aria-hidden="true">SQL</div>

  <section class="web-map-stage web-map-stage-db">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 3c4.42 0 8 1.34 8 3v12c0 1.66-3.58 3-8 3s-8-1.34-8-3V6c0-1.66 3.58-3 8-3Zm0 2C8.13 5 6 5.9 6 6s2.13 1 6 1 6-.9 6-1-2.13-1-6-1ZM6 9v2c0 .1 2.13 1 6 1s6-.9 6-1V9c-1.46.64-3.6 1-6 1s-4.54-.36-6-1Zm0 5v4c0 .1 2.13 1 6 1s6-.9 6-1v-4c-1.46.64-3.6 1-6 1s-4.54-.36-6-1Z"/></svg>
    </div>
    <h2>データベース</h2>
    <p>ユーザー、投稿、注文、学習進捗などを保存する場所。アプリを再起動してもデータを残す役割があります。</p>
  </section>
</div>

## Webサービスが表示される流れ

<div class="web-sequence">
  <div><strong>1</strong><span>ユーザーがURLを開く</span></div>
  <div><strong>2</strong><span>ブラウザがHTML/CSS/JavaScriptを取得する</span></div>
  <div><strong>3</strong><span>フロントエンドが画面を表示する</span></div>
  <div><strong>4</strong><span>必要に応じてAPIを呼ぶ</span></div>
  <div><strong>5</strong><span>バックエンドがDBや外部サービスとやり取りする</span></div>
  <div><strong>6</strong><span>結果がJSONで返り、画面が更新される</span></div>
</div>

## フロントエンドとは

フロントエンドは、ユーザーが直接見る画面を作る領域です。

<div class="web-concept-grid">
  <section class="web-concept web-concept-front">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M3 5h18v14H3V5Zm2 2v10h14V7H5Zm2 2h5v2H7V9Zm0 4h10v2H7v-2Z"/></svg>
    </div>
    <h3>画面を作る</h3>
    <p>HTMLで構造を作り、CSSで見た目を整え、JavaScript/TypeScriptで動きをつけます。</p>
  </section>
  <section class="web-concept web-concept-front">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M7 4h10v2H7V4Zm-2 4h14v12H5V8Zm2 2v8h10v-8H7Zm2 2h6v2H9v-2Z"/></svg>
    </div>
    <h3>入力を受け取る</h3>
    <p>フォーム、検索、ボタン、チェックボックスなど、ユーザー操作を受け取ります。</p>
  </section>
  <section class="web-concept web-concept-front">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M4 6h16v3H4V6Zm0 5h10v3H4v-3Zm0 5h16v3H4v-3Z"/></svg>
    </div>
    <h3>API結果を表示する</h3>
    <p>バックエンドから返ってきたJSONを、一覧、詳細、通知、エラー表示として画面に反映します。</p>
  </section>
</div>

## APIとは

APIは、フロントエンドとバックエンドが会話するための入口です。

```text
フロントエンド
  ↓ HTTP request
GET /api/posts
  ↓
バックエンド
  ↓ HTTP response
[
  { "id": 1, "title": "最初の投稿" }
]
```

APIでは、よく次のHTTPメソッドを使います。

| メソッド | 役割 | 例 |
| --- | --- | --- |
| `GET` | 取得 | 投稿一覧を取得する |
| `POST` | 作成 | 新しい投稿を作る |
| `PATCH` | 更新 | プロフィールを変更する |
| `DELETE` | 削除 | 投稿を削除する |

APIは「画面を返すもの」ではなく、「データを返す入口」と考えると理解しやすいです。Reactなどのフロントエンドは、このデータを受け取って画面を更新します。

## バックエンドとは

バックエンドは、ユーザーからは直接見えない処理を担当します。

<div class="web-concept-grid">
  <section class="web-concept web-concept-back">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 4 5 1.9V11c0 3.6-2 6.8-5 8.2C9 17.8 7 14.6 7 11V7.9L12 6Z"/></svg>
    </div>
    <h3>認証と権限</h3>
    <p>ログイン、会員判定、管理者だけが使える機能などを扱います。</p>
  </section>
  <section class="web-concept web-concept-back">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M6 4h12v4H6V4Zm0 6h12v4H6v-4Zm0 6h12v4H6v-4Z"/></svg>
    </div>
    <h3>業務ルール</h3>
    <p>料金計算、投稿できる条件、在庫数の更新、メール送信など、サービス固有の処理を実装します。</p>
  </section>
  <section class="web-concept web-concept-back">
    <div class="web-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M5 5h14v4H5V5Zm0 6h14v8H5v-8Zm3 2v4h2v-4H8Zm4 0v4h4v-4h-4Z"/></svg>
    </div>
    <h3>データ保存</h3>
    <p>データベースに保存し、必要なときに取り出し、正しい形に整えて返します。</p>
  </section>
</div>

## データベースとは

データベースは、アプリケーションのデータを長期的に保存する場所です。

例えばSNSなら、次のようなデータを保存します。

| テーブル | 保存するもの |
| --- | --- |
| `users` | ユーザー名、メールアドレス、パスワードのハッシュ |
| `posts` | 投稿本文、投稿者、作成日時 |
| `likes` | 誰がどの投稿にいいねしたか |
| `follows` | 誰が誰をフォローしているか |

このページでは概念だけ押さえます。SQLやテーブル設計は、後の[データベース基礎](/database/)で詳しく学びます。

## インフラとは

インフラは、アプリケーションを動かす土台です。

<div class="web-layer-stack">
  <div class="web-layer web-layer-app"><span>Application</span><strong>React / API / Batch</strong></div>
  <div class="web-layer web-layer-runtime"><span>Runtime</span><strong>Node.js / Java / Python / PHP / Go / Ruby</strong></div>
  <div class="web-layer web-layer-container"><span>Container</span><strong>Docker / Docker Compose</strong></div>
  <div class="web-layer web-layer-cloud"><span>Cloud</span><strong>AWS / Cloudflare / Vercel</strong></div>
  <div class="web-layer web-layer-network"><span>Network</span><strong>DNS / HTTPS / CDN / Load Balancer</strong></div>
</div>

AWSは、このインフラをクラウド上で借りるためのサービス群です。サーバー、データベース、ストレージ、メール、ネットワークなどを必要に応じて組み合わせます。

## CI/CDとは

CI/CDは、コード変更を安全に本番へ届けるための自動化です。

<div class="web-pipeline">
  <div><strong>commit</strong><span>変更を記録</span></div>
  <div><strong>push</strong><span>GitHubへ送る</span></div>
  <div><strong>test</strong><span>自動テスト</span></div>
  <div><strong>build</strong><span>本番用に生成</span></div>
  <div><strong>deploy</strong><span>公開環境へ反映</span></div>
</div>

CIは「変更のたびにテストやチェックを自動で回すこと」、CDは「通ったものを安全にデプロイすること」です。

人が毎回手作業で確認してアップロードすると、ミスが起きやすくなります。CI/CDは、手順をコード化して再現性を上げるために使います。

## この後の学習とのつながり

<div class="web-roadmap">
  <a href="/environment/"><strong>環境構築</strong><span>開発するPCを整える</span></a>
  <a href="/frontend/html_css/"><strong>HTML / CSS</strong><span>画面の土台を作る</span></a>
  <a href="/frontend/javascript/"><strong>JavaScript</strong><span>ブラウザで動きを作る</span></a>
  <a href="/typescript/"><strong>TypeScript</strong><span>型を使って安全に書く</span></a>
  <a href="/react/"><strong>React</strong><span>UIを部品として組み立てる</span></a>
  <a href="/database/"><strong>データベース</strong><span>データを保存して取り出す</span></a>
  <a href="/docker/"><strong>Docker</strong><span>開発環境をそろえる</span></a>
  <a href="/cicd/"><strong>CI/CD / AWS</strong><span>公開と運用を学ぶ</span></a>
</div>

最初から全てを理解する必要はありません。まずは「今学んでいる教材がWebサービスのどの部分なのか」を見失わないことが大切です。
