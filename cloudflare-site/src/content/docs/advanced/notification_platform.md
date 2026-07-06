---
title: "Project 03: メッセージ配信基盤"
description: SQSと非同期ワーカー、リトライとDLQ、冪等性、キャンペーン一斉配信を備えた配信基盤「Lumina Notify」を実装する。
nav_order: 4
section_key: advanced
section_title: 実務プロジェクト応用編
---

# Project 03: メッセージ配信基盤「Lumina Notify」

Reserveのリマインダーメールは増え続け、マーケティングからは「キャンペーンの一斉配信をしたい」という要望が来ています。メール送信をプロダクト本体に埋め込んだままではスケールしないため、社内の複数サービスから使える配信基盤「Lumina Notify」を切り出して作ります。

- 仕様リポジトリ: [curriculum-project-notification-platform](https://github.com/dik-ab/curriculum-project-notification-platform)
- 目安: 5〜7週(AI駆動前提)
- 必要なもの: ローカル環境のみで完結(SQSはElasticMQ、メールはMailHogで代替。Terraform課題のみ任意でAWS)

## このプロジェクトで身につくこと

これまでのAPIは「リクエスト → 同期処理 → レスポンス」でした。このプロジェクトは**非同期・分散処理の入口**です。

| テーマ | 具体的には |
| --- | --- |
| キュー | APIは受け付けてSQSに積むだけ。ワーカーが別プロセスで消費する |
| at-least-once | 「同じメッセージが2回配られても壊れない」コードを冪等キーで書く |
| リトライとDLQ | 一時失敗は指数バックオフで再試行、恒久失敗はDLQに隔離して再処理する |
| 大量配信 | 1万件のキャンペーンをチャンク分割し、テナントごとのレート制御をかける |
| 基盤らしさ | APIキー認証、webhookでの結果通知、統計API。「使われる側」の設計 |

SQS・ワーカー・冪等性は、決済、通知、バッチ、データ連携など、あらゆるバックエンドの実務で出てくる基礎体力です。

## 主な機能(Must)

- テナント管理とAPIキー認証(ハッシュ保存)
- テンプレート({{name}}変数)とプレビュー
- 単発送信API(idempotency_key対応)→ SQS投入 → ワーカーが送信
- ステータス管理(queued → processing → sent / failed)とイベント履歴
- 指数バックオフのリトライ、DLQ、DLQ再処理コマンド
- キャンペーン(CSV取込、チャンク分割、進捗集計、送信予約)
- テナントごとのレート制御、webhook(HMAC署名付き)、統計API

## マイルストーン

| マイルストーン | 内容 | issue数 |
| --- | --- | --- |
| M1 同期API基盤 | テナント、APIキー、テンプレート、単発送信(まず同期で) | 5 |
| M2 非同期化 | SQS(ElasticMQ)、ワーカー、リトライとDLQ、冪等性、graceful shutdown | 5 |
| M3 キャンペーン | CSV取込、チャンク分割、送信予約、レート制御、統計 | 5 |
| M4 連携と運用 | webhook、Reserveリマインダー連携、Terraform、CI、仕上げ | 5 |

M2が山場です。「ワーカーを強制終了しても、再起動すれば取りこぼしなく、かつ二重送信もなく回復する」ことをテストで示せたら、このプロジェクトの核は完成です。`async-messaging` スキルに冪等実装パターンとテストの書き方があります。

## 始め方

1. [仕様リポジトリ](https://github.com/dik-ab/curriculum-project-notification-platform)で「Use this template」→ 自分のリポジトリを作る
2. `project-onboarding` スキルで全体像を掴み、`setup-github-project` スキルでissueを複製する
3. M1は普通のCRUD APIなので早く抜けて、M2にじっくり時間を使ってください

## 発展課題(advancedラベル)

SESのバウンス処理(SNS通知の受信)、配信停止(unsubscribe)リンクがissueとして入っています。

## 次のステップ

3プロジェクトが揃ったら、それぞれのREADMEを仕上げて、ポートフォリオとしてまとめてください。[AWSデプロイ](/aws/)で学んだ構成でどれか1つを本番相当に載せると、さらに説得力が増します。
