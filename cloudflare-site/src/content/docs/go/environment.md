---
title: Goの環境構築
section_key: go
section_title: Go基礎
nav_order: 1
description: Go本体、go command、module、VS Code Go拡張、最初の実行確認を行います。
---

# Goの環境構築

Goでは、Go本体を入れると `go` コマンドが使えるようになります。依存関係はGo Modulesで管理します。

## 入れるもの

| ツール | 役割 |
| --- | --- |
| Go | コンパイル、実行、テスト、依存管理を行う |
| VS Code Go extension | 補完、定義ジャンプ、フォーマット、デバッグ、テスト支援 |
| gopls | Goの言語サーバー。VS Code拡張から使われる |
| Delve | Goのデバッガ |

Go公式は `go mod init` でモジュールを作り、`go run` で実行する流れを案内しています。学習でもこの流れを使います。

## Macで確認する

```bash
go version
```

Homebrewを使う場合は次のように入れられます。

```bash
brew install go
```

## Windowsで確認する

公式インストーラーを使い、PowerShellで確認します。

```powershell
go version
```

表示されない場合は、PATHが通っているか、ターミナルを開き直したかを確認します。

## 最初のプロジェクト

```bash
mkdir -p ~/school/go-basic
cd ~/school/go-basic
go mod init example.com/go-basic
```

- `go mod init` はGo Modules用の `go.mod` を作ります。
- `example.com/go-basic` は学習用のモジュール名です。

`main.go` を作ります。

```go
package main

import "fmt"

func main() {
	fmt.Println("Hello Go")
}
```

実行します。

```bash
go run .
```

- `go run .` は今のモジュールをビルドして実行します。
- `fmt.Println` は文字列を表示します。

## よく使うコマンド

| コマンド | 役割 |
| --- | --- |
| `go run .` | 実行する |
| `go test ./...` | 全パッケージのテストを実行する |
| `go fmt ./...` | コードを整形する |
| `go mod tidy` | 依存関係を整理する |

## よくあるミス

```bash
go run main.go
```

小さいうちは動きますが、ファイルが増えると読み込まれないファイルが出ることがあります。基本は `go run .` でパッケージ全体を実行します。

## 確認問題

Goで新しい学習プロジェクトを作り、Hello Worldを実行するコマンドを書いてください。

<details>
<summary>回答例</summary>

```bash
mkdir -p ~/school/go-basic
cd ~/school/go-basic
go mod init example.com/go-basic
cat > main.go <<'EOF'
package main

import "fmt"

func main() {
	fmt.Println("Hello Go")
}
EOF
go run .
```

- `cat > main.go <<'EOF'` から `EOF` までで `main.go` を作ります。
- `go run .` の前に `main.go` が必要です。
- `go.mod` はそのプロジェクトの依存関係とモジュール名を管理します。

</details>
