---
title: Rubyの環境構築
section_key: ruby
section_title: Ruby基礎
nav_order: 1
description: Ruby本体、Bundler、VS Code拡張、最初の実行確認を行います。
---

# Rubyの環境構築

Rubyでは、Ruby本体に加えてBundlerを使います。Bundlerはプロジェクトが使うgemを管理するツールで、Rails開発でも必ず使います。

## 入れるもの

| ツール | 役割 |
| --- | --- |
| Ruby | `.rb` ファイルを実行する本体 |
| Bundler | gemの依存関係を管理する |
| VS Code Ruby LSP | 補完、定義ジャンプ、診断、フォーマット支援 |
| rbenv / ruby-install | 複数Rubyバージョンの切り替えに使える |

Ruby公式は複数のインストール方法を案内しています。Railsまで進むなら、Rubyのバージョンを切り替えられる環境にしておくと実務に近いです。

## Macで確認する

```bash
ruby -v
bundle -v
```

Homebrewとrbenvを使う場合の例です。

```bash
brew install rbenv ruby-build
rbenv init
```

`rbenv init` の指示に従ってシェル設定を反映したら、インストールできる安定版を確認してRubyを入れます。

```bash
rbenv install -l
rbenv install <version>
rbenv global <version>
gem install bundler
```

`<version>` は公式サイトや `rbenv install -l` に表示される安定版の番号に置き換えます。チーム開発では、既存プロジェクトの `.ruby-version` に合わせます。

## Windowsで確認する

WindowsではRubyInstallerが使いやすい選択肢です。インストール後、PowerShellで確認します。

```powershell
ruby -v
bundle -v
```

## 最初の実行

```bash
mkdir -p ~/school/ruby-basic
cd ~/school/ruby-basic
touch hello.rb
```

`hello.rb` に書きます。

```ruby
puts "Hello Ruby"
```

実行します。

```bash
ruby hello.rb
```

- `puts` は文字列を表示して改行します。
- `ruby hello.rb` はRubyにファイルを渡して実行します。

## Bundlerの最小確認

```bash
bundle init
bundle install
```

- `bundle init` は `Gemfile` を作ります。
- `bundle install` はGemfileに書かれたgemをインストールします。

## よくあるミス

```bash
gem install rails
```

学習では動きますが、プロジェクトごとの依存関係を管理するには `Gemfile` とBundlerを使います。Railsプロジェクトでは `bundle exec` の意味も後で重要になります。

## 確認問題

RubyプロジェクトでBundlerを使う理由を説明してください。

<details>
<summary>回答例</summary>

プロジェクトごとに使うgemとバージョンを `Gemfile` と `Gemfile.lock` で固定できるからです。チーム全員が同じ依存関係で動かしやすくなります。

</details>
