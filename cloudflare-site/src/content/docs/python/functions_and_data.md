---
title: 関数、型ヒント、データ処理
section_key: python
section_title: Python基礎
nav_order: 3
description: Web APIの入力値を処理する関数、型ヒント、辞書データの扱い方を学びます。
---

# 関数、型ヒント、データ処理

関数は、同じ処理を名前付きで再利用するための仕組みです。Pythonでは型を書かなくても動きますが、FastAPIやチーム開発では型ヒントを書くと読みやすくなります。

## 実務シーン

フォームから受け取った金額と税率を使って、税込金額を返す処理を考えます。

```python
def calculate_total(price: int, tax_rate: float) -> int:
    total = price * (1 + tax_rate)
    return int(total)

result = calculate_total(1200, 0.1)
print(result)
```

- `def calculate_total(...):` は関数を定義します。
- `price: int` は引数 `price` が整数であることを示す型ヒントです。
- `tax_rate: float` は税率が小数であることを示します。
- `-> int` は戻り値が整数であることを示します。
- `total = ...` は税込金額を計算します。
- `return int(total)` は小数部分を切り捨てて整数にします。
- `calculate_total(1200, 0.1)` は関数を呼び出します。

## 辞書を受け取る関数

```python
def build_user_label(user: dict) -> str:
    name = user.get("name", "名無し")
    role = user.get("role", "member")
    return f"{name} ({role})"

print(build_user_label({"name": "Sato", "role": "admin"}))
```

- `user: dict` は辞書を受け取ることを示します。
- `user.get("name", "名無し")` は `name` がなければ `"名無し"` を使います。
- `return` で表示用の文字列を返します。

> 補足: より厳密に書くなら `TypedDict` やPydanticを使います。基礎段階では、まず辞書を安全に読むことを優先します。

## よくあるミス

```python
def calculate_total(price: int, tax_rate: float) -> int:
    total = price * (1 + tax_rate)

print(calculate_total(1200, 0.1))
```

`return` がないため、関数の結果は `None` になります。計算した値を使いたい場合は必ず `return` します。

> 補足: Pythonの `round()` は、`.5` の扱いが一般的な四捨五入と違う場合があります。お金の計算を厳密に扱うときは、後で学ぶ `Decimal` や業務ルールに合わせた丸めを使います。

## 確認問題

ユーザーの年齢を受け取り、20歳以上なら `"adult"`、未満なら `"minor"` を返す関数を書いてください。

<details>
<summary>回答例</summary>

```python
def get_age_group(age: int) -> str:
    if age >= 20:
        return "adult"
    return "minor"

print(get_age_group(22))
print(get_age_group(18))
```

- `age: int` で年齢を整数として受け取ります。
- `-> str` で文字列を返すことを示します。
- `if age >= 20:` で成人か判定します。
- 条件に合う場合は `"adult"` を返します。
- それ以外は `"minor"` を返します。

</details>
