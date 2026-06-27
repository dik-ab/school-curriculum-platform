---
title: Todo開発ロードマップ（言語別）
parent: "実践: フルスタックTodoアプリ"
nav_order: 2
section_key: todo-common
section_title: Todoアプリ 共通仕様
---

# Todo開発ロードマップ（言語別）

このページでは、[共通要件定義・仕様書](/fullstack-todo/requirements/)をどのバックエンドスタックで実装するかを選びます。フロントエンドは全スタック共通で React + Vite + TypeScript です。違うのは、API、ORM、Migration、バリデーション、テストの書き方です。

> 迷ったら、まずは TypeScript / NestJS + Prisma 版を選びます。既存の詳細チュートリアルがあるため、フロント、API、DBのつなぎ込みに集中できます。

## スタックを選ぶ

<div class="course-grid wide">
  <a class="course-card project" data-accent="ink" href="/fullstack-todo/nestjs/">
    <span>TypeScript</span>
    <h3>NestJS + Prisma</h3>
    <p>既存の詳細チュートリアル。Controller、Service、DTO、PrismaでCRUDを作る標準ルート。</p>
  </a>
  <a class="course-card project" data-accent="amber" href="/fullstack-todo/spring_boot/">
    <span>Java</span>
    <h3>Spring Boot + JPA</h3>
    <p>Controller、Service、Repository、Entity、Bean Validationで実装するルート。</p>
  </a>
  <a class="course-card project" data-accent="blue" href="#fastapi-sqlalchemy">
    <span>Python</span>
    <h3>FastAPI + SQLAlchemy</h3>
    <p>Pydantic、依存性注入、SQLAlchemy、Alembicで小さなAPIを作るルート。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="#laravel-eloquent">
    <span>PHP</span>
    <h3>Laravel + Eloquent</h3>
    <p>Route、Controller、Form Request、Eloquent、Migrationで作るルート。</p>
  </a>
  <a class="course-card project" data-accent="ink" href="#gin-gorm">
    <span>Go</span>
    <h3>Gin + GORM</h3>
    <p>薄いフレームワークで、handler、validation、DB処理の責務分離を学ぶ。</p>
  </a>
  <a class="course-card project" data-accent="purple" href="#rails-active-record">
    <span>Ruby</span>
    <h3>Rails + Active Record</h3>
    <p>Rails API、Active Record、Migration、request specでCRUDを作るルート。</p>
  </a>
</div>

## 共通の章立て

各スタックで作るものは同じです。

| # | 章 | 作るもの | 共通知識 |
|---|---|---|---|
| 1 | セットアップ | API、DB、React、CORSの準備 | [Docker Compose](/docker/docker_compose/)、[React基礎](/react/) |
| 2 | データモデル | `todos` テーブルとMigration | [データベース基礎](/database/) |
| 3 | Todo API | 一覧、1件取得、作成、更新、削除 | [HTTPとREST](/backend/http_and_rest/) |
| 4 | フロントエンド | 一覧、追加、完了切り替え、削除 | [fetchでAPI通信](/react/api_fetch/) |
| 5 | つなぎ込み | CORS、エラー表示、動作確認 | [フルスタックTodo仕様](/fullstack-todo/requirements/) |
| 6 | テスト | APIまたはServiceの基本テスト | [バックエンドテスト](/testing/) |

## NestJS + Prisma

既存の詳細手順は、次のページに分かれています。

| ページ | 内容 |
|---|---|
| [プロジェクトのセットアップ](/fullstack-todo/nestjs/setup/) | pnpm、NestJS、React、Docker Compose、Prismaの準備 |
| [バックエンド: Todo APIの実装](/fullstack-todo/nestjs/backend/) | NestJS + PrismaでCRUD APIを実装 |
| [フロントエンド: 画面の実装](/fullstack-todo/nestjs/frontend/) | ReactでTodo画面を作る |
| [つなぎ込み: CORSとエラーハンドリング](/fullstack-todo/nestjs/integration/) | ReactとAPIを接続し、CORSを理解する |
| [練習問題](/fullstack-todo/nestjs/practice/) | 期限、絞り込み、編集などを追加する |

解答コード:

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/todo)
- [NestJS + Prisma バックエンド](https://github.com/dik-ab/curriculum-todo-nestjs-answer)

## Spring Boot + JPA

Javaでは、次の責務に分けると実務の形に近づきます。

| 層 | 主なファイル例 | 役割 |
|---|---|---|
| Controller | `TodoController` | HTTPリクエストを受ける |
| Service | `TodoService` | Todo作成、更新、削除の判断を書く |
| Repository | `TodoRepository` | DBアクセスを担当する |
| Entity | `TodoEntity` | `todos` テーブルに対応する |
| DTO | `CreateTodoRequest`, `UpdateTodoRequest` | 入力値の形とバリデーションを表す |

解答コード:

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/todo)
- [Spring Boot + JPA バックエンド](https://github.com/dik-ab/curriculum-todo-spring-answer)

## FastAPI + SQLAlchemy

Pythonでは、PydanticモデルとSQLAlchemyモデルを分けます。

| 層 | 主なファイル例 | 役割 |
|---|---|---|
| Router | `todos_router.py` | `/todos` のルーティング |
| Schema | `schemas/todo.py` | リクエスト/レスポンスの型 |
| Model | `models/todo.py` | DBテーブルの定義 |
| Service | `services/todo_service.py` | 業務ロジック |
| Migration | Alembic | `todos` テーブル作成 |

## Laravel + Eloquent

PHPでは、Laravelの標準機能を使って短く実装できます。

| 層 | 主なファイル例 | 役割 |
|---|---|---|
| Route | `routes/api.php` | APIルートを定義する |
| Controller | `TodoController` | HTTP処理をまとめる |
| Request | `StoreTodoRequest`, `UpdateTodoRequest` | バリデーション |
| Model | `Todo` | Eloquentモデル |
| Migration | `create_todos_table` | DBテーブル作成 |

## Gin + GORM

Goでは、フレームワークの補助が少ない分、責務分離を明示します。

| 層 | 主なファイル例 | 役割 |
|---|---|---|
| Handler | `TodoHandler` | HTTPリクエスト/レスポンス |
| Service | `TodoService` | Todo操作の判断 |
| Model | `Todo` | GORMモデル |
| Request | `CreateTodoRequest` | 入力値の構造体 |
| Test | `todo_handler_test.go` | handlerまたはserviceのテスト |

## Rails + Active Record

Rubyでは、Rails APIモードで小さく始めます。

| 層 | 主なファイル例 | 役割 |
|---|---|---|
| Routes | `config/routes.rb` | RESTful routeを定義する |
| Controller | `TodosController` | HTTP処理 |
| Model | `Todo` | Active Recordモデル |
| Migration | `create_todos` | DBテーブル作成 |
| Spec | request spec | APIの動作確認 |

## 共通の実装例

どのスタックでも、作成APIの処理は同じ流れになります。

```text
POST /todos を受ける
-> title が1〜100文字か確認する
-> completed=false でDBに保存する
-> 作成されたTodoを 201 Created で返す
```

この流れをフレームワークごとのController、Service、Repository、ORMに置き換えるのが言語別実装です。

## 次のステップ

初回は [共通要件定義・仕様書](/fullstack-todo/requirements/) を読み、TypeScriptで実装する場合は [Todo NestJS + Prisma版](/fullstack-todo/nestjs/) に進んでください。Javaで実装する場合は [Todo Spring Boot + JPA版](/fullstack-todo/spring_boot/) に進みます。別スタックで実装する場合も、API表、エラー形式、完成条件は共通仕様から変えないようにします。
