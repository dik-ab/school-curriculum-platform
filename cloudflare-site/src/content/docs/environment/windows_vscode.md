---
title: Windows版 VS Code セットアップ
parent: 環境構築
nav_order: 2
---

# Windows開発環境のセットアップ

Windows環境でも、Macと同じような開発環境を構築できます。以下の2つのツールをインストールしましょう。

## 1. WSL（Windows Subsystem for Linux）とUbuntu

WindowsでLinux環境を動かせるWSLを使うことで、Mac同様のターミナル環境が手に入ります。私も実際に開発で使用しており、とても便利です。

WSLをインストールすると、**Ubuntu**というLinux環境が使えるようになります。このコースでは、TypeScriptを学ぶ際にターミナルを使用しますが、**Windowsの方はこのUbuntuを使用します**。

**参考：WSL2について詳しく知りたい方はこちら**
[WSL2のインストール手順（Qiita）](https://qiita.com/nanbuwks/items/55acf8107bad347d2cd0)

## 2. Visual Studio Code（VS Code）のインストール

軽量で高機能な無料のコードエディタです。拡張機能も豊富で、あらゆるプログラミング言語に対応しています。

**重要：** 以下のインストール手順では、**WSL（Ubuntu）とVS Codeを一度にインストールできます**。

**インストール方法はこちら：**
[VSCodeのインストール手順（スッキリわかるIT塾）](https://sukkiri.jp/technologies/devtools/vscode_win.html)

このリンクの手順に従えば、WSL（Ubuntu）とVS Codeの両方がインストールされます。

## 3. VS Code上でターミナルを使う

VS Codeをインストールしたら、VS Code上でUbuntuのターミナルを使えるように設定しましょう。

**VS CodeでWSL（Ubuntu）ターミナルを使う方法：**
[VS CodeでWSLのターミナルを開く方法（Qiita）](https://qiita.com/_masa_u/items/d3c1fa7898b0783bc3ed)

この設定をすることで、VS Code内でLinuxのコマンドを実行できるようになります。Windows環境でありながら、Mac同様の開発体験が得られます。

これらをインストールすることで、Windowsでも快適な開発環境が整います！

## VS Codeを使いこなそう！
VS Codeを使いこなせるようになることは、優秀なエンジニアへの第一歩です。ショートカットキーを覚えたり、便利な拡張機能を活用したりして、効率的にコードを書けるようになりましょう。最初は慣れないかもしれませんが、毎日使っていくうちに必ず上達します。頑張りましょう！