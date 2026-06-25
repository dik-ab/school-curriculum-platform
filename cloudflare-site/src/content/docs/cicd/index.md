---
title: CI/CD
nav_order: 14
has_children: true
permalink: /cicd/
---

# CI/CD

このセクションでは **CI/CD（シーアイ・シーディー）** を学びます。CIは Continuous Integration（継続的インテグレーション）、CDは Continuous Delivery / Deployment（継続的デリバリー／デプロイ）の略で、ひとことで言えば「**コードをpushしたら、チェックとデプロイを機械が自動でやってくれる仕組み**」です。

ここまでのセクションで、皆さんはGitでコードを管理し（[Git/GitHub基礎](/git/)）、ESLintやPrettierでコードの品質を保ち（[コード品質と開発ツール](/tooling/)）、Jestでテストを書けるようになりました（[バックエンドテスト](/testing/)）。しかし、これらのチェックを「自分が手で実行するのを忘れない」ことに頼っていては、いつか必ず抜け漏れが起きます。CI/CDは、この「人間の注意力に頼る部分」をGitHubへのpushをきっかけに自動化する仕組みです。

このセクションでは、GitHubに組み込まれたCI/CDサービスである **GitHub Actions（ギットハブ・アクションズ）** を使って、実際に自動チェックの仕組みを構築します。

## このセクションで学ぶこと

| ページ | 内容 |
|---|---|
| [CI/CDとは何か](/cicd/what_is_cicd/) | 手作業の開発フローの問題点、CIとCDの定義、自動化がもたらす価値 |
| [GitHub Actions入門](/cicd/github_actions_basics/) | workflow / job / step の構造、YAMLの読み方を1行ずつ、トリガーの種類 |
| [CIパイプラインを作る](/cicd/ci_pipeline/) | lint + test + build を自動実行するCIをNestJS/Reactのリポジトリに組み込む |
| [ビルドとデプロイの流れ](/cicd/build_and_deploy_flow/) | 「ビルドとは何か」を成果物から理解する、CD（自動デプロイ）の全体像 |

## 前提知識

このセクションは、以下の内容を理解していることを前提に進みます。

- Gitの基本操作とGitHubへのpush、Pull Requestの流れ — [GitHubとPull Request](/git/github_and_pr/)
- pnpm scriptsの実行（`pnpm run lint` や `pnpm test`） — [エディタ連携とpnpm scripts](/tooling/editor_and_scripts/)
- Jestによるテストの基本 — [単体テスト](/testing/unit_test/)

特に「pushすると何が起きるか」「Pull Requestとは何か」が曖昧な場合は、先に[Git/GitHub基礎](/git/)を復習してください。CI/CDはGitHubの操作の延長線上にある仕組みです。

## 学習の流れ

1. まず「なぜ自動化が必要なのか」「CIとCDはそれぞれ何を指すのか」を概念から理解します
2. 次にGitHub Actionsのワークフローファイル（YAML）の読み書きを、最小の例で身につけます
3. 実際のNestJS/Reactリポジトリに lint + test + build のCIを組み込み、Pull Requestでチェックが動くところまで確認します
4. 最後に「ビルドの成果物とは何か」を整理し、デプロイ自動化（CD）の全体像をつかみます

## このセクションのゴール

- CIとCDの違いと、それぞれが解決する問題を自分の言葉で説明できる
- GitHub Actionsのワークフローファイルを読み、自分で書ける
- 自分のリポジトリに lint + test + build のCIを組み込み、Pull Request上でチェック結果を確認できる
- 「ビルド」が何を生成し、それがどこへ配置されるのかを説明できる

ここで作るCIの仕組みは、[AWSデプロイ](/aws/)のセクションで「GitHub ActionsからAWSへ自動デプロイする」CDへと発展し、[SNS開発（最終プロジェクト）](/sns/)では開発フローの土台として常に動き続けることになります。

それでは、[CI/CDとは何か](/cicd/what_is_cicd/)から始めましょう。
