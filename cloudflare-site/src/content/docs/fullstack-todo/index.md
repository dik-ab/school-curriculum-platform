---
title: "実践: フルスタックTodoアプリ"
nav_order: 11
has_children: true
permalink: /fullstack-todo/
section_key: todo-common
section_title: Todoアプリ 共通仕様
---

# 実践: フルスタックTodoアプリ

このセクションは、Reactフロントエンドを共通にし、バックエンドだけを差し替えて同じTodoアプリを作る実践プロジェクトです。

Todoは、フロントエンド、API、DBを接続する最初の通し稽古です。公開済みのルートはNestJS版とSpring Boot版に絞り、Python、PHP、Go、Rubyまで含む全6スタック比較は、次の[SNS開発](/sns/)で扱います。

このページには、全フレームワークの手順を混ぜません。共通仕様と各バックエンド版へのカードだけを置き、具体的な実装手順、使用ライブラリ、解答リポジトリ、動作確認手順は、選んだバックエンド版のページに分けます。

## 言語別Todo開発の進め方

まず [共通要件定義・仕様書](/fullstack-todo/requirements/) で、画面、API、データモデル、エラー形式、完成条件を固定します。その後、作りたいバックエンド版のページを選びます。

<div class="course-grid wide">
  <a class="course-card project" data-accent="green" href="/fullstack-todo/requirements/">
    <span>Common</span>
    <h3>共通要件定義・仕様書</h3>
    <p>NestJS版とSpring Boot版で変えない仕様。画面、API、DB、エラー形式、完成条件を定義します。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="/fullstack-todo/nestjs/">
    <span>TypeScript</span>
    <h3>Todo NestJS + Prisma版</h3>
    <p>NestJS + Prisma + PostgreSQLでTodo CRUDを実装する詳細チュートリアルです。</p>
  </a>
  <a class="course-card project" data-accent="amber" href="/fullstack-todo/spring_boot/">
    <span>Java</span>
    <h3>Todo Spring Boot + JPA版</h3>
    <p>Spring Boot + JPA + PostgreSQLで同じTodo仕様を実装します。</p>
  </a>
</div>

## 共通仕様で固定するもの

| 項目 | 固定する内容 |
|---|---|
| フロントエンド | React + Vite + TypeScriptを共通フロントエンドとして使う |
| 画面 | 1画面でTodoの追加、一覧、完了切り替え、削除を行う |
| API | `GET /todos`、`POST /todos`、`PATCH /todos/:id`、`DELETE /todos/:id` など |
| DB | todosテーブルのカラム、制約、作成日時、更新日時 |
| エラー | バリデーションエラー、404、500のJSON形式 |
| 完成条件 | React画面から追加、完了切り替え、削除、再読み込み後の永続化を確認する |

TodoはSNSより小さい題材です。ここでフロントエンド、API、DBをつなぐ流れを確認してから、SNS開発へ進みます。

## サイドバーの分け方

各バックエンド版は、カードから個別ページとして開きます。サイドバーも版ごとに分けているため、NestJS版を開いたときにSpring Boot版の手順が混ざる構成にはしません。

迷ったら、仕様は [共通要件定義・仕様書](/fullstack-todo/requirements/) へ、実装は選んだスタックの個別ページへ戻ります。
