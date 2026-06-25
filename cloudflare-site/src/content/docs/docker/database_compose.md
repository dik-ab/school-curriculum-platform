---
title: Docker Compose + PostgreSQL / MySQL
parent: Docker Compose + DB
section_key: docker-compose-db
section_title: Docker Compose + DB
nav_order: 1
---

# Docker Compose + PostgreSQL / MySQL

このページでは、ローカル開発で使うデータベースをDocker Composeで立ち上げる方法を学びます。

[データベースとは](/database/what_is_database/)でRDBやSQLの考え方を学び、[Docker基礎](/docker/)でコンテナの考え方を学んだら、次は「実際に手元でDBを起動できる状態」にします。

## このページのゴール

- Docker ComposeでPostgreSQLを起動できる
- Docker ComposeでMySQLを起動できる
- `ports`、`environment`、`volumes` の役割を説明できる
- DBコンテナのデータをボリュームで永続化できる
- DBコンテナへ入り、コンテナ内からDBへ接続できる
- `psql` の基本メタコマンドと `\x auto` を使って結果を見やすくできる
- ローカルアプリから `localhost` 経由でDBへ接続する形を理解できる
- PostgreSQLとMySQLのどちらを使うか、学習上の判断ができる

## なぜDBはDocker Composeで立てるのか

ローカル開発でDBを直接PCにインストールすると、次のような問題が起きやすくなります。

- インストール手順がOSごとに違う
- バージョン違いでチーム内の挙動が変わる
- 使わなくなったDBを消すのが面倒
- 複数プロジェクトでポートや設定が衝突する

Docker Composeを使うと、DBの起動条件を `compose.yaml` に書いておけます。プロジェクトごとに「このDBを、このユーザー名とパスワードで、このポートで起動する」と宣言できるので、再現性が高くなります。

```mermaid
flowchart LR
    A["compose.yaml"] --> B["PostgreSQL<br>container"]
    A --> C["MySQL<br>container"]
    B --> D["volume<br>postgres-data"]
    C --> E["volume<br>mysql-data"]
    F["local API<br>NestJS / Spring / Rails"] -->|"localhost:5432"| B
    F -->|"localhost:3306"| C
    G["docker compose exec"] -->|"container内へ入る"| B
    G -->|"container内へ入る"| C
```

## まず覚えるComposeの基本

DBを立てるときによく使う設定は、まずこの4つです。

| 項目 | 役割 |
| --- | --- |
| `image` | どのDockerイメージを使うか |
| `environment` | DB名、ユーザー名、パスワードなどの初期設定 |
| `ports` | PC側から接続できるようにポートを公開する |
| `volumes` | コンテナを消してもDBのデータを残す |

DBコンテナは、ただ起動できればよいわけではありません。アプリから接続できること、消して作り直しても必要なデータが残ること、チームで同じ設定を使えることが重要です。

## PostgreSQLを起動する

本カリキュラムでは、基本のDBとしてPostgreSQLを使います。標準SQLへの対応が強く、RAGで使うpgvectorのような拡張機能もあり、実務でもよく使われます。

任意の作業フォルダに `compose.yaml` を作成します。

**`compose.yaml`**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

### コード解説

- `services:` は、Composeで起動するコンテナの一覧です
- `postgres:` はサービス名です。自由に決められますが、役割がわかる名前にします
- `image: postgres:16` は、PostgreSQL 16の公式イメージを使う指定です
- `POSTGRES_USER` は、DBに接続するユーザー名です
- `POSTGRES_PASSWORD` は、開発用パスワードです
- `POSTGRES_DB` は、初回起動時に作られるDB名です
- `ports: "5432:5432"` は、PCの5432番をコンテナの5432番につなぎます
- `postgres-data:/var/lib/postgresql/data` は、PostgreSQLのデータ保存先をDockerボリュームに逃がします

起動します。

```bash
docker compose up -d
```

確認します。

```bash
docker compose ps
```

PostgreSQLに入ります。これは「PCからコンテナの中で `psql` を実行する」コマンドです。

```bash
docker compose exec postgres psql -U postgres -d app_db
```

接続できたら、次のような表示になります。

```text
app_db=#
```

終了するときは、psql内で次を入力します。

```text
\q
```

## DBコンテナにアクセスする

DBを使うときは、次の2種類の「入る」を区別してください。

| 操作 | 何をしているか | よく使う場面 |
| --- | --- | --- |
| `docker compose exec postgres psql ...` | コンテナ内で直接 `psql` を起動する | DBにSQLを打ちたい |
| `docker compose exec postgres bash` | コンテナ内のシェルに入る | ファイル、環境変数、プロセスを確認したい |

まずコンテナのシェルに入ります。

```bash
docker compose exec postgres bash
```

コンテナの中に入ると、プロンプトが変わります。そこで環境変数を確認できます。

```bash
echo $POSTGRES_DB
echo $POSTGRES_USER
```

コンテナ内からPostgreSQLへ接続します。

```bash
psql -U postgres -d app_db
```

つまり、次の2つは入口が違うだけで、最終的には同じDBに入っています。

```bash
# PCから一発でpsqlを起動する
docker compose exec postgres psql -U postgres -d app_db

# いったんコンテナのbashに入り、その中でpsqlを起動する
docker compose exec postgres bash
psql -U postgres -d app_db
```

コンテナIDや名前を直接使う方法もあります。

```bash
docker ps
docker exec -it <container_name_or_id> bash
```

普段はサービス名で指定できる `docker compose exec postgres ...` の方が読みやすく、プロジェクト内では使いやすいです。

## psqlで最低限覚える操作

`psql` はPostgreSQLを操作するCLIです。SQL以外に、バックスラッシュから始まる**メタコマンド**が使えます。

| コマンド | 意味 |
| --- | --- |
| `\conninfo` | 今どのDBに、どのユーザーで接続しているか表示する |
| `\l` | データベース一覧を表示する |
| `\dt` | 現在のDBにあるテーブル一覧を表示する |
| `\d users` | `users` テーブルの列、型、制約を表示する |
| `\x` | 縦表示をON/OFFする |
| `\x auto` | 横に長い結果だけ自動で縦表示にする |
| `\q` | psqlを終了する |

特に便利なのが `\x auto` です。横に長いテーブルを `SELECT *` すると、ターミナル上で折り返されて読みにくくなります。`\x auto` を入れておくと、結果が横に収まらないときだけ自動で縦表示になります。

```sql
\conninfo
\x auto

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  bio TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, bio)
VALUES
  ('太郎', 'taro@example.com', 'PostgreSQLをDocker Composeで練習しています'),
  ('花子', 'hanako@example.com', '長い文字列が入ると横表示では読みにくくなります');

SELECT * FROM users;
```

通常の横表示で読みにくい場合でも、縦表示なら1行の中身を追いやすくなります。

```text
-[ RECORD 1 ]-------------------------------
id         | 1
name       | 太郎
email      | taro@example.com
bio        | PostgreSQLをDocker Composeで練習しています
created_at | 2026-06-25 10:00:00
```

テーブル構造を確認します。

```sql
\dt
\d users
```

練習が終わったらpsqlを抜けます。

```text
\q
```

コンテナのbashにも入っていた場合は、さらに抜けます。

```bash
exit
```

## MySQLを起動する

MySQLもWeb開発で非常によく使われるRDBMSです。Laravel、Rails、Spring BootなどではMySQLを選ぶ現場も多いです。

PostgreSQLとは環境変数やデータ保存先が少し違います。

**`compose.yaml`**

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: app_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

### コード解説

- `image: mysql:8.4` は、MySQL 8.4の公式イメージを使う指定です
- `MYSQL_ROOT_PASSWORD` は、rootユーザーのパスワードです
- `MYSQL_DATABASE` は、初回起動時に作られるDB名です
- `MYSQL_USER` は、アプリから接続するための一般ユーザーです
- `MYSQL_PASSWORD` は、その一般ユーザーのパスワードです
- `ports: "3306:3306"` は、PCの3306番をコンテナの3306番につなぎます
- `mysql-data:/var/lib/mysql` は、MySQLのデータ保存先をDockerボリュームに逃がします

起動します。

```bash
docker compose up -d
```

MySQLに入ります。

```bash
docker compose exec mysql mysql -u app_user -papp_password app_db
```

接続できたら、次のような表示になります。

```text
mysql>
```

終了するときは、MySQL内で次を入力します。

```sql
exit;
```

MySQLでも、いま接続しているDBやテーブルを確認できます。

```sql
SELECT DATABASE();
SHOW DATABASES;
SHOW TABLES;
```

PostgreSQLの `\dt` や `\d users` はpsql専用のメタコマンドです。MySQLでは `SHOW TABLES;`、`DESCRIBE users;` のようにSQL文として確認します。

## PostgreSQLとMySQLを同時に立てる

学習や比較のために、PostgreSQLとMySQLを同時に立てることもできます。通常のアプリ開発ではどちらか一方で十分ですが、違いを試したいときはこの構成が便利です。

**`compose.yaml`**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: app_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  postgres-data:
  mysql-data:
```

起動します。

```bash
docker compose up -d
```

状態を確認します。

```bash
docker compose ps
```

どちらも `Up` になっていれば成功です。

## ローカルアプリから接続する

DBコンテナを起動したら、ローカルで動くAPIから接続します。

PostgreSQLの場合:

```text
postgresql://postgres:postgres@localhost:5432/app_db
```

MySQLの場合:

```text
mysql://app_user:app_password@localhost:3306/app_db
```

ここで大事なのは、ホスト名が `localhost` であることです。APIを手元のPCで `pnpm run start:dev` などで動かしている場合、DBにはPC側に公開されたポートから入ります。

一方、APIも同じCompose内のコンテナとして動かしている場合は、接続先は `localhost` ではなくサービス名になります。

| APIの動かし方 | PostgreSQLの接続先 | MySQLの接続先 |
| --- | --- | --- |
| APIをPCで動かす | `localhost:5432` | `localhost:3306` |
| APIもComposeで動かす | `postgres:5432` | `mysql:3306` |

「どこから見た接続先なのか」を必ず意識してください。

```mermaid
flowchart LR
    A["APIをPCで実行<br>pnpm run dev"] -->|"localhost:5432"| B["PostgreSQL container"]
    C["APIもComposeで実行<br>api service"] -->|"postgres:5432"| B
    D["psqlをPCから実行"] -->|"localhost:5432"| B
    E["psqlをコンテナ内で実行"] -->|"localhost:5432<br>containerの中から見たlocalhost"| B
```

`localhost` は常に「そのコマンドを実行している場所自身」を指します。PCでAPIを動かしているなら `localhost` はPCです。APIコンテナの中で `localhost` と書くと、そのAPIコンテナ自身を指すため、DBコンテナには届きません。同じCompose内の別サービスへ接続するときは、`postgres` や `mysql` のようなサービス名を使います。

## ログと状態を確認する

DBが起動しない、接続できない、パスワードが違う、というときはログを見ます。

```bash
docker compose logs postgres
docker compose logs -f postgres
```

MySQLの場合はサービス名を変えます。

```bash
docker compose logs mysql
```

コンテナの状態、公開ポート、名前を確認します。

```bash
docker compose ps
docker ps
```

ボリュームが作られているか確認します。

```bash
docker volume ls
```

今のプロジェクトに紐づくリソースを消すときは次の2段階です。

```bash
# コンテナとネットワークだけ消す。DBデータは残る
docker compose down

# ボリュームも消す。DBデータも消える
docker compose down -v
```

DBの不具合調査では、まず `logs`、`ps`、接続文字列、ボリュームの有無を確認します。いきなり `down -v` するとデータが消えるので、原因が分からないまま初期化する癖はつけないでください。

## データを完全に消したいとき

普通に停止するだけなら、次のコマンドです。

```bash
docker compose down
```

この場合、ボリュームは残るのでDBのデータも残ります。

データも含めて完全に消したい場合は、`-v` を付けます。

```bash
docker compose down -v
```

これはボリュームごと削除する操作です。開発中にDBをまっさらにしたいときには便利ですが、保存されていたデータは戻せません。意味を理解してから実行してください。

## このページで必ず覚えること

- DBはPCに直接インストールするより、Docker Composeで立てる方が再現しやすい
- PostgreSQLは標準ポート `5432`、MySQLは標準ポート `3306`
- `environment` で初期DB名、ユーザー名、パスワードを指定する
- `volumes` を使わないと、コンテナを消したときにDBデータも消える
- `docker compose exec postgres bash` でコンテナの中に入れる
- `docker compose exec postgres psql -U postgres -d app_db` でPCから一発でpsqlに入れる
- PostgreSQLでは `\conninfo`、`\dt`、`\d users`、`\x auto` が特に便利
- APIをPCで動かす場合は `localhost` でDBに接続する
- APIもCompose内で動かす場合は、`postgres` や `mysql` のようなサービス名で接続する
- `docker compose down -v` はDBデータを完全に消す操作なので注意する

## 次のステップ

PostgreSQLを起動できたら、次は[PostgreSQLを起動して触ってみる](/database/postgresql_setup/)で、`psql` を使ってSQLを実行します。

MySQLを使う言語・フレームワークに進む場合も、ここで学んだComposeの考え方は同じです。DBの種類が変わっても、`image`、`environment`、`ports`、`volumes` を読む力があれば対応できます。
