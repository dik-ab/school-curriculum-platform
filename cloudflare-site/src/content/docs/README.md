# プログラミング学習カリキュラム

このリポジトリは、プログラミング未経験から半年でフルスタックのSNSアプリケーションを開発・デプロイできるようになるための学習カリキュラムです。入門編（環境構築〜TypeScript）とマスターコース（Git/React/NestJS/Prisma/Docker/テスト/CI/CD/AWS/リアルタイム通信/AI開発/SNS開発）で構成されています。

## GitHub Pagesでの表示

/

## ローカルでプレビューする方法

### 初回セットアップ

```bash
# 1. Rubyがインストールされているか確認
ruby -v

# 2. Bundlerをインストール（まだの場合）
gem install bundler

# 3. 依存関係をインストール
bundle install
```

### サーバーの起動

```bash
# 簡単な方法（推奨）
./serve.sh

# または手動で
bundle exec jekyll serve
```

ブラウザで http://localhost:4000 にアクセスしてください。

## ファイル構成

- `_config.yml` - Jekyll設定（GitHub PagesとローカルPagesで共通）
- `serve.sh` - ローカルプレビュー起動スクリプト
- `Gemfile` - ローカル用の依存関係（jekyll-remote-themeは除外）

### 入門編

- `environment/` - 環境構築ガイド（VS Code、ターミナル、Node.js）
- `frontend/` - HTML/CSS/JavaScript基礎と練習問題
- `typescript/` - TypeScript基礎と練習問題
- `final_project.md` - 入門編最終問題
- `practice/` - 練習問題の回答コード

### マスターコース（中級編）

- `git/` `react/` `backend/` `docker/` `database/` - 開発スキルの基礎
- `fullstack-todo/` - 実践: フルスタックTodoアプリ
- `tooling/` `testing/` `cicd/` `aws/` `realtime/` - 品質・インフラ・運用
- `ai/` `ai-chat/` - AI開発入門とRAGチャット開発
- `sns/` - SNS開発（最終プロジェクト）

### その他

- `.authoring/` - 教材執筆規約とTOC（サイトには公開されない）
- `../master-course/` - 同内容の静的HTML版（Jekyll非依存）
