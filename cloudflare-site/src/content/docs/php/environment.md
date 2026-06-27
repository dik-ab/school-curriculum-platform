---
title: PHPの環境構築
section_key: php
section_title: PHP基礎
nav_order: 1
description: PHP本体、Composer、VS Code拡張、最初の実行確認を行います。
---

# PHPの環境構築

PHPでは、PHP本体に加えてComposerを入れておくことが重要です。Composerはプロジェクトが使うライブラリを管理し、Laravelでも必ず使います。

## 入れるもの

| ツール | 役割 |
| --- | --- |
| PHP | `.php` ファイルを実行する |
| Composer | PHPライブラリをプロジェクト単位で管理する |
| VS Code PHP support | シンタックスハイライト、補完、Lint |
| PHP Intelephense | 補完、定義ジャンプ、型推論を強化する定番拡張 |
| PHP Debug | Xdebugと組み合わせてデバッグする拡張 |

VS Codeは公式PHP linterである `php -l` を使った診断に対応しています。PHP実行ファイルのPATHが通っているかが重要です。

## Macで確認する

```bash
php -v
composer -V
```

Homebrewを使う場合は次のように入れられます。

```bash
brew install php composer
```

## Windowsで確認する

Windowsでは、PHP公式のWindowsダウンロード、XAMPP、またはLaravel Herdなどの選択肢があります。学習では、ターミナルで次が動く状態を目標にします。

```powershell
php -v
composer -V
```

Composer公式ではWindows用インストーラーが用意され、PATH設定も行えます。インストール後はターミナルを開き直して確認します。

## 最初の実行

```bash
mkdir -p ~/school/php-basic
cd ~/school/php-basic
touch hello.php
```

`hello.php` に書きます。

```php
<?php

echo "Hello PHP" . PHP_EOL;
```

実行します。

```bash
php hello.php
```

- `echo` は文字列を出力します。
- `.` は文字列結合です。
- `PHP_EOL` はOSに合った改行です。
- `php hello.php` はCLIでPHPファイルを実行します。

## Composerの最小確認

```bash
composer init
composer dump-autoload
```

- `composer init` は `composer.json` を作ります。
- `composer dump-autoload` はクラスの読み込み情報を作り直します。

## よくあるミス

```bash
composer install
```

`composer.json` がないフォルダで実行すると、何をインストールすべきか分かりません。LaravelプロジェクトやComposer管理しているプロジェクトのルートで実行します。

## 確認問題

`php -v` は動くがVS CodeでPHPのLintが出ない場合、何を確認しますか。

<details>
<summary>回答例</summary>

VS Codeの `php.validate.executablePath` とPATHを確認します。VS Codeから見えるPHP実行ファイルの場所がずれていると、ターミナルでは動いてもエディタ診断が動かないことがあります。

</details>

