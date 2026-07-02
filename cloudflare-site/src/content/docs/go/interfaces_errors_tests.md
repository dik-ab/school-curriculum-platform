---
title: interface、error、test、goroutine
section_key: go
section_title: Go基礎
nav_order: 4
description: Goらしいinterface、明示的なerror、testing、goroutineの入口を学びます。
---

# interface、error、test、goroutine

Goでは例外ではなく `error` を戻り値として返します。また、小さなinterfaceで依存を差し替えやすくします。

## 実務シーン

メールアドレスが空ならエラーを返す処理を考えます。

```go
package main

import (
	"errors"
	"fmt"
	"strings"
)

func domain(email string) (string, error) {
	if email == "" {
		return "", errors.New("email is required")
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "", errors.New("email is invalid")
	}

	return parts[1], nil
}

func main() {
	value, err := domain("sato@example.com")
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(value)
}
```

- `domain(...) (string, error)` は文字列とエラーを返します。
- `errors.New` はエラー値を作ります。
- `strings.Split` は文字列を分割します。
- `return "", error` は失敗を表します。
- `return parts[1], nil` は成功を表します。
- `if err != nil` で失敗を確認します。

## テストの入口

`domain_test.go` を作ります。

```go
package main

import "testing"

func TestDomain(t *testing.T) {
	got, err := domain("sato@example.com")
	if err != nil {
		t.Fatal(err)
	}

	want := "example.com"
	if got != want {
		t.Fatalf("got %s, want %s", got, want)
	}
}
```

- `testing` は標準のテストパッケージです。
- `Test` で始まる関数がテスト対象です。
- `t.Fatal` はテストを失敗させて止めます。
- `got` と `want` を比べる書き方はGoでよく使われます。

## interfaceの入口

interface（インターフェース）は「どんなメソッドを持っているか」という**約束事**だけを決めた型です。中身の実装は問いません。約束したメソッドさえ持っていれば、どんな型でも「そのinterfaceを満たしている」とみなされます。

通知を送る `Notifier` を例にします。

```go
package main

import "fmt"

// Notifier は「Send メソッドを持つ」という約束
type Notifier interface {
	Send(message string) error
}

// EmailNotifier は Notifier を満たす（Send を持っているため）
type EmailNotifier struct{}

func (e EmailNotifier) Send(message string) error {
	fmt.Println("mail:", message)
	return nil
}

// notify は「具体的な型」ではなく「Notifier」を受け取る
func notify(n Notifier, message string) error {
	return n.Send(message)
}

func main() {
	if err := notify(EmailNotifier{}, "hello"); err != nil {
		fmt.Println(err)
	}
}
```

- `type Notifier interface { ... }` は、持つべきメソッド（ここでは `Send`）だけを宣言します。
- `func (e EmailNotifier) Send(...)` を定義すると、`EmailNotifier` は自動的に `Notifier` を満たします（`implements` のような宣言は不要です）。
- `notify(n Notifier, ...)` は具体的な型に依存しません。`Send` を持つ型ならなんでも渡せます。
- そのため、本番は `EmailNotifier`、テストでは「送ったふりをするダミー」に**差し替え**られます。依存を差し替えやすくするのがinterfaceの主な使いどころです。

## goroutineの入口

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		defer wg.Done()
		fmt.Println("background task")
	}()

	wg.Wait()
}
```

- `sync.WaitGroup` はgoroutineの完了を待つために使います。
- `wg.Add(1)` は待つ処理が1つあることを登録します。
- `go func() { ... }()` は関数を別のgoroutineで実行します。
- `defer wg.Done()` はgoroutineの最後に完了を通知します。
- `wg.Wait()` は完了まで待ちます。

基礎段階では「並行に動かせる仕組みがある」と理解できれば十分です。API開発では、まず通常の関数とエラー処理を優先します。

## よくあるミス

```go
value, _ := domain("")
fmt.Println(value)
```

`_` でエラーを捨てると、失敗理由を見逃します。学習中は必ず `err` を確認します。

## 確認問題

0以下の価格ならエラーを返し、問題なければ `nil` を返す関数を書いてください。

<details>
<summary>回答例</summary>

```go
package main

import "errors"

func validatePrice(price int) error {
	if price <= 0 {
		return errors.New("price must be positive")
	}

	return nil
}
```

- 戻り値は `error` だけです。
- 問題がある場合は `errors.New` でエラーを返します。
- 問題がない場合は `nil` を返します。

</details>
