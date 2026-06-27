---
title: Python基礎
section_key: python
section_title: Python基礎
nav_order: 0
description: FastAPIやデータ処理に進む前に、Pythonの特徴、用途、環境構築、基本文法、型ヒント、例外、テストを学びます。
---

# Python基礎

Pythonは、読みやすい文法でWeb API、業務自動化、データ分析、AI開発、バッチ処理まで幅広く使われる言語です。バックエンドではFastAPI、Django、Flaskなどのフレームワークで使われます。

## Pythonが活用しやすいシーン

| シーン | 向いている理由 |
| --- | --- |
| API開発 | FastAPIと型ヒントで、入力値とレスポンスの形を整理しやすい |
| 業務自動化 | CSV、Excel、ファイル操作、HTTP通信の標準/定番ライブラリが多い |
| AI/データ処理 | 機械学習、統計、可視化のライブラリが豊富 |
| 小さなバッチ | 書き始めが軽く、短いコードで動きを確認しやすい |

Pythonのメリットは、文法が短く読みやすいことです。一方で、型を強制しないため、実務では型ヒント、テスト、フォーマッタを組み合わせて保守しやすくします。

> 実務では、Pythonを「雑に書ける言語」として使うより、型ヒントとテストを入れて小さく確実に動かす方が長く保守しやすいです。

## このコースのゴール

- Pythonの実行方法と仮想環境を説明できる
- 変数、型、条件分岐、繰り返し、辞書、リストを読める
- 関数に型ヒントを書ける
- クラス、モジュール、例外処理の入口を理解できる
- FastAPIに進む前に、リクエスト/レスポンスのデータを扱える
- `pytest` の入口を理解できる

## 学習順

1. [Pythonの環境構築](/python/environment/)
2. [Pythonの基本文法](/python/basics/)
3. [関数、型ヒント、データ処理](/python/functions_and_data/)
4. [クラス、例外、テスト](/python/objects_errors_tests/)
5. [Python基礎演習](/python/practice/)

## 最初の実務例

APIから返るユーザー情報を表示用の文字列に整える場面を考えます。

```python
user = {"id": 1, "name": "Sato", "active": True}

if user["active"]:
    label = f'{user["name"]}さんは利用中です'
else:
    label = f'{user["name"]}さんは停止中です'

print(label)
```

- `user = {...}` はAPIレスポンスのような辞書データを作っています。
- `user["active"]` は `active` というキーの値を取り出します。
- `if user["active"]:` は利用中かどうかで処理を分けます。
- `f'...'` は変数を埋め込める文字列です。
- `print(label)` は結果をターミナルに表示します。

## よくあるミス

```python
user = {"name": "Sato"}
print(user["email"])
```

`email` キーが存在しないため `KeyError` になります。実務では、必須項目か任意項目かを決め、任意項目は `get` やバリデーションで扱います。

## 確認問題

次の条件に合うPythonの利用シーンを1つ選んでください。

- JSONを受け取るAPIを作りたい
- 入力値の形を整理したい
- 少ないコードで開発を始めたい

<details>
<summary>回答例</summary>

FastAPIを使ったAPI開発が向いています。Pythonは文法が短く、FastAPIでは型ヒントを使ってリクエストやレスポンスの形を表しやすいからです。

</details>

## 参考にした公式資料

- [Python Tutorial](https://docs.python.org/3/tutorial/index.html)
- [Python Packaging User Guide: pip and venv](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/)
- [Python in Visual Studio Code](https://code.visualstudio.com/docs/languages/python)

