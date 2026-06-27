---
title: クラス、例外、テスト
section_key: python
section_title: Python基礎
nav_order: 4
description: FastAPIのServiceやDTOに進む前に、クラス、例外処理、pytestの入口を学びます。
---

# クラス、例外、テスト

Pythonでも、Webアプリの処理が増えると関数だけでは整理しにくくなります。関連するデータと処理をまとめるためにクラスを使います。

## 実務シーン

ユーザー登録時に、メールアドレスが空ならエラーにする処理を考えます。

```python
class User:
    def __init__(self, email: str) -> None:
        if email == "":
            raise ValueError("email is required")
        self.email = email

    def domain(self) -> str:
        return self.email.split("@")[1]

user = User("sato@example.com")
print(user.domain())
```

- `class User:` は `User` クラスを定義します。
- `__init__` はインスタンスを作るときに呼ばれる初期化メソッドです。
- `self` は作成されたインスタンス自身を表します。
- `email: str` はメールアドレスを文字列で受け取る型ヒントです。
- `raise ValueError(...)` は不正な値のときに例外を発生させます。
- `self.email = email` はインスタンスに値を保存します。
- `domain` はメールアドレスのドメイン部分を返します。

## 例外を受け止める

```python
try:
    user = User("")
except ValueError as error:
    print(f"登録できません: {error}")
```

- `try` の中に失敗する可能性がある処理を書きます。
- `except ValueError as error` は `ValueError` を捕まえます。
- `error` には例外メッセージが入ります。

## pytestの入口

`test_user.py` を作ります。

```python
import pytest

from user import User


def test_domain():
    user = User("sato@example.com")
    assert user.domain() == "example.com"


def test_email_required():
    with pytest.raises(ValueError):
        User("")
```

- `import pytest` はpytestを使うための読み込みです。
- `from user import User` は別ファイルの `User` を読み込みます。
- `test_` で始まる関数はpytestのテスト対象になります。
- `assert` は期待値と実際の値を比べます。
- `pytest.raises` は例外が出ることを確認します。

## よくあるミス

```python
class User:
    def __init__(email: str) -> None:
        self.email = email
```

インスタンスメソッドの第1引数に `self` がありません。この場合、`self` が未定義になったり、引数の数が合わないエラーになります。

## 確認問題

商品価格が0以下なら `ValueError` を出す `Product` クラスを書いてください。

<details>
<summary>回答例</summary>

```python
class Product:
    def __init__(self, name: str, price: int) -> None:
        if price <= 0:
            raise ValueError("price must be positive")
        self.name = name
        self.price = price

    def label(self) -> str:
        return f"{self.name}: {self.price}円"


product = Product("Book", 1200)
print(product.label())
```

- `name` と `price` を初期化時に受け取ります。
- `price <= 0` で不正な金額を判定します。
- 問題がある場合は `ValueError` を出します。
- `label` は表示用の文字列を返します。

</details>

