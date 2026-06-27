---
title: Todo Spring Boot + JPA版
parent: "実践: フルスタックTodoアプリ"
nav_order: 0
section_key: todo-spring-boot
section_title: Todo Spring Boot + JPA版
---

# Todo Spring Boot + JPA版

React共通フロントエンドと、Spring Boot + JPA + PostgreSQLのバックエンドでTodoアプリを作るルートです。

## 前提知識

- [Java基礎](/java/)
- [Spring Bootへの橋渡し](/java/spring_boot_bridge/)
- [データベース基礎](/database/)
- [React基礎](/react/)
- [Docker Compose](/docker/docker_compose/)
- [Todo共通要件定義・仕様書](/fullstack-todo/requirements/)

## この版で作るもの

| 章 | Spring Bootで作る主なファイル |
|---|---|
| セットアップ | `pom.xml`、`application.properties`、Docker Compose |
| データモデル | `Todo` Entity、`TodoRepository` |
| Todo API | `TodoController`、CRUDエンドポイント |
| テスト | Spring Boot Test、MockMvc |
| React接続 | `VITE_API_URL=http://localhost:8000` |

## ローカル起動の形

| 役割 | URL |
|---|---|
| React | `http://localhost:5173` |
| Spring Boot API | `http://localhost:8000` |
| PostgreSQL | `localhost:5432` |

## 解答コード

- [React共通フロントエンド](https://github.com/dik-ab/curriculum-react-projects-answer/tree/main/apps/todo)
- [Spring Boot + JPA バックエンド](https://github.com/dik-ab/curriculum-todo-spring-answer)
