---
title: PHP基礎
section_key: php
section_title: PHP基礎
nav_order: 0
description: Laravelに進む前に、PHPの特徴、用途、環境構築、基本文法、関数、クラス、Composer、例外、テストを学びます。
---

# PHP基礎

PHPはWebアプリケーション開発のために広く使われてきたサーバーサイド言語です。WordPress、Laravel、Symfonyなどで使われ、HTMLに近い場所から始められる一方、現在の実務ではComposer、名前空間、クラス、型宣言を使って保守しやすく書きます。

## PHPが活用しやすいシーン

| シーン | 向いている理由 |
| --- | --- |
| Webアプリ | リクエスト、フォーム、セッション、テンプレートとの相性がよい |
| Laravel開発 | MVC、Migration、Eloquent、Queueなど実務機能が揃っている |
| WordPress保守 | 既存サイトやCMS案件でPHPの読解力が必要になる |
| 小規模な管理画面 | レンタルサーバーでも動かしやすく、導入しやすい |

PHPのメリットは、Webのリクエストからレスポンスまでを学びやすいことです。Laravelに進む前に、配列、関数、クラス、例外、Composerを押さえます。

## 学習順

1. [PHPの環境構築](/php/environment/)
2. [PHPの基本文法](/php/basics/)
3. [関数、配列、フォームデータ](/php/functions_and_arrays/)
4. [クラス、名前空間、例外、テスト](/php/objects_errors_tests/)
5. [PHP基礎演習](/php/practice/)

## 最初の実務例

フォームから受け取った名前を表示用に整えます。

```php
<?php

$name = "Sato";
$escapedName = htmlspecialchars($name, ENT_QUOTES, "UTF-8");

echo "こんにちは、{$escapedName}さん";
```

- `<?php` からPHPコードを書き始めます。
- `$name` は変数です。PHPの変数は `$` から始まります。
- `htmlspecialchars` はHTMLとして危険な文字をエスケープします。
- `echo` は文字列を出力します。

> 実務では、画面へ出す値は必ずエスケープします。PHPはWebに近いぶん、XSS対策も早めに意識します。

## よくあるミス

```php
echo "こんにちは、$nameさん";
```

日本語と変数名が続くと、変数の範囲が分かりにくくなります。`{$name}` のように波括弧で囲むと安全です。

## 確認問題

PHPでLaravelに進む前にComposerを学ぶ理由を説明してください。

<details>
<summary>回答例</summary>

ComposerはPHPの依存関係管理ツールです。Laravel本体や外部ライブラリをプロジェクト単位で管理するため、Laravel開発ではComposerの基本操作を理解しておく必要があります。

</details>

## 参考にした公式資料

- [PHP Manual: Getting Started](https://www.php.net/manual/en/getting-started.php)
- [PHP Manual: Language Reference](https://www.php.net/manual/en/langref.php)
- [Composer Documentation](https://getcomposer.org/doc/00-intro.md)
- [PHP in Visual Studio Code](https://code.visualstudio.com/docs/languages/php)
