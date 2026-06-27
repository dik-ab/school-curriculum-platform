---
title: Go基礎
section_key: go
section_title: Go基礎
nav_order: 0
description: GinなどのWebフレームワークに進む前に、Goの特徴、用途、環境構築、基本文法、struct、interface、goroutine、テストを学びます。
---

# Go基礎

Goは、シンプルな文法、速いコンパイル、単一バイナリ配布、並行処理の書きやすさが特徴の言語です。Web API、CLI、マイクロサービス、インフラ系ツール、バッチ処理でよく使われます。

## Goが活用しやすいシーン

| シーン | 向いている理由 |
| --- | --- |
| APIサーバー | 標準ライブラリだけでもHTTPサーバーを書ける |
| マイクロサービス | 起動が速く、単一バイナリで配布しやすい |
| CLI/運用ツール | クロスコンパイルしやすく、配布が簡単 |
| 並行処理 | goroutineとchannelで複数処理を書きやすい |

Goのメリットは、言語仕様が比較的小さく、チームで読みやすいコードに寄せやすいことです。一方で、例外ではなく `error` を明示的に返すため、最初はエラー処理が多く見えます。

> 実務では、Goの「地味さ」が強みになります。誰が読んでも処理の流れを追いやすく、APIサーバーやバッチを安定して保守しやすいです。

## 学習順

1. [Goの環境構築](/go/environment/)
2. [Goの基本文法](/go/basics/)
3. [関数、struct、slice、map](/go/functions_and_data/)
4. [interface、error、test、goroutine](/go/interfaces_errors_tests/)
5. [Go基礎演習](/go/practice/)

## 最初の実務例

APIから返すユーザー表示名を組み立てます。

```go
package main

import "fmt"

func main() {
	user := map[string]string{
		"name": "Sato",
		"role": "admin",
	}

	label := fmt.Sprintf("%s (%s)", user["name"], user["role"])
	fmt.Println(label)
}
```

- `package main` は実行可能なプログラムであることを示します。
- `import "fmt"` は表示や文字列整形の標準パッケージを読み込みます。
- `func main()` はプログラムの入口です。
- `map[string]string` は文字列キーと文字列値のmapです。
- `fmt.Sprintf` は表示用文字列を作ります。
- `fmt.Println` はターミナルへ表示します。

## よくあるミス

```go
func main() {
	name := "Sato"
}
```

Goでは使っていない変数があるとコンパイルエラーになります。不要な変数を残さない習慣がつきます。

## 確認問題

GoがAPIサーバーやCLIツールに向いている理由を1つ説明してください。

<details>
<summary>回答例</summary>

単一バイナリとして配布しやすく、実行環境に多くの依存を持ち込みにくいからです。また、標準ライブラリのHTTP機能が強く、Web APIの入口を学びやすいです。

</details>

## 参考にした公式資料

- [Go Documentation](https://go.dev/doc/)
- [Tutorial: Get started with Go](https://go.dev/doc/tutorial/getting-started)
- [Effective Go](https://go.dev/doc/effective_go)
- [Go in Visual Studio Code](https://code.visualstudio.com/docs/languages/go)

