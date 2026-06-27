---
title: Pythonの環境構築
section_key: python
section_title: Python基礎
nav_order: 1
description: Python本体、venv、pip、VS Code拡張、最初の実行確認を行います。
---

# Pythonの環境構築

Pythonでは、プロジェクトごとに使うライブラリを分けるために仮想環境を使います。FastAPI、Django、pytestなどを入れる前に、`python`、`pip`、`venv` の役割を押さえます。

## 入れるもの

| ツール | 役割 |
| --- | --- |
| Python | `.py` ファイルを実行する本体 |
| venv | プロジェクトごとの仮想環境を作る |
| pip | Pythonライブラリを入れる |
| VS Code Python extension | 補完、実行、デバッグ、テスト支援 |
| Ruff | フォーマットと静的チェックに使える定番ツール |

VS Code公式では、Python拡張を使うと補完、Lint、デバッグ、単体テスト、環境切り替えを扱えると説明されています。まずはMicrosoftのPython拡張を入れてください。

## Macで確認する

```bash
python3 --version
python3 -m pip --version
```

表示されればPythonとpipが使えます。Homebrewを使う場合は次のように入れられます。

```bash
brew install python
```

## Windowsで確認する

PowerShellで確認します。

```powershell
py --version
py -m pip --version
```

公式インストーラーを使う場合は、インストール時にPATHへ追加する設定を確認してください。

## 仮想環境を作る

```bash
mkdir -p ~/school/python-basic
cd ~/school/python-basic
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Windows PowerShellでは有効化コマンドが変わります。

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

- `python3 -m venv .venv` は `.venv` という仮想環境フォルダを作ります。
- `source .venv/bin/activate` は今のターミナルで仮想環境を有効にします。
- `python -m pip install --upgrade pip` は仮想環境内のpipを更新します。

> 注意: 仮想環境を有効にしてからライブラリを入れると、そのプロジェクトだけにインストールされます。

## 最初の実行

`hello.py` を作ります。

```python
print("Hello Python")
```

実行します。

```bash
python hello.py
```

- `print(...)` は文字列を標準出力へ表示します。
- `python hello.py` はPythonにファイルを渡して実行します。

## よくあるミス

```bash
pip install fastapi
```

仮想環境を有効にしていない状態で実行すると、別の場所に入ることがあります。ターミナルの先頭に `(.venv)` が表示されているか、VS Codeの右下で `.venv` のPythonが選ばれているか確認します。

## 確認問題

`requests` をこのプロジェクトだけに入れる手順を書いてください。

<details>
<summary>回答例</summary>

```bash
cd ~/school/python-basic
source .venv/bin/activate
python -m pip install requests
python -m pip freeze > requirements.txt
```

- `cd` で対象プロジェクトへ移動します。
- `source` で仮想環境を有効化します。
- `python -m pip install requests` で仮想環境へ入れます。
- `requirements.txt` に依存関係を記録します。

</details>

