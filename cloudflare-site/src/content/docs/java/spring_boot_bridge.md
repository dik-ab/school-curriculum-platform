---
title: Spring Bootに進む前の橋渡し
section_key: java
section_title: Java基礎
nav_order: 17
description: Controller、Service、Repository、DTO、EntityをJavaのクラス分割として理解します。
---

# Spring Bootに進む前の橋渡し

Spring Bootに入ると、急に `Controller`、`Service`、`Repository`、`DTO`、`Entity` という名前が出てきます。

これらは特別な魔法ではありません。まずは「責務ごとにクラスを分ける考え方」として理解すると、Spring Bootに入りやすくなります。

> 実務では、1つのクラスに全部書くと修正が難しくなります。画面/APIの入口、業務ロジック、データ取得、レスポンスの形を分けることで、読みやすく、テストしやすくします。

## 役割の全体像

| 名前 | 役割 | 例 |
| --- | --- | --- |
| Controller | リクエストを受け取る | `/users/1` にアクセスされた |
| Service | 業務ロジックを書く | ユーザーを検索し、表示用に整える |
| Repository | データを取得・保存する | DBからユーザーを探す |
| DTO | APIで返すデータの形 | `name` と `email` だけ返す |
| Entity | DBに近いデータの形 | `id`、`name`、`email`、`passwordHash` |

このページではSpring Bootのアノテーションは使いません。普通のJavaクラスとして分けます。

## Entity

Entityは、データベースに近い形のクラスです。

```java
public class UserEntity {
    private final int id;
    private final String name;
    private final String email;
    private final String passwordHash;

    public UserEntity(int id, String name, String email, String passwordHash) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
```

コードの意味です。

- `UserEntity` は、DBに保存されているユーザーを表します。
- `id` は、ユーザーIDです。
- `name` は、名前です。
- `email` は、メールアドレスです。
- `passwordHash` は、パスワードそのものではなくハッシュ化された値です。
- `getPasswordHash` を用意していないため、外に返しにくくしています。

## DTO

DTOは、APIや画面に渡すデータの形です。

```java
public record UserResponse(int id, String name, String email) {
}
```

コードの意味です。

- `record` は、データを運ぶためのクラスを短く書く仕組みです。
- `UserResponse` は、APIで返すユーザー情報です。
- `passwordHash` を含めていません。
- 外部に返してよい情報だけを持ちます。

## Repository

Repositoryは、データを探す役割です。

```java
import java.util.Optional;

public class UserRepository {
    public Optional<UserEntity> findById(int id) {
        if (id == 1) {
            return Optional.of(new UserEntity(1, "Sato", "sato@example.com", "hashed-password"));
        }
        return Optional.empty();
    }
}
```

コードの意味です。

- `UserRepository` は、ユーザーを取得する役割です。
- `findById` は、IDでユーザーを探します。
- `Optional<UserEntity>` は、見つかる場合と見つからない場合があることを表します。
- `id == 1` のときだけ、仮のユーザーを返します。
- 見つからない場合は `Optional.empty()` を返します。

## Service

Serviceは、業務ロジックを書く場所です。

```java
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUser(int id) {
        UserEntity user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
```

コードの意味です。

- `UserService` は、ユーザーに関する業務処理を担当します。
- `private final UserRepository userRepository` は、データ取得役のクラスです。
- コンストラクタで `UserRepository` を受け取ります。
- `getUser` は、IDから表示用ユーザー情報を返します。
- `orElseThrow` は、ユーザーが見つからない場合に例外を投げます。
- `new UserResponse(...)` で、EntityをDTOに変換しています。

## Controllerのイメージ

Spring Bootでは、ControllerがHTTPリクエストを受け取ります。

ここでは普通のJavaクラスとして考えます。

```java
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    public UserResponse show(int id) {
        return userService.getUser(id);
    }
}
```

コードの意味です。

- `UserController` は、外部からの入口です。
- `UserService` を使って処理します。
- `show` は、ユーザー詳細を返すメソッドです。
- Controllerには、細かい業務ロジックを書きすぎません。

## 流れを確認する

```java
UserRepository repository = new UserRepository();
UserService service = new UserService(repository);
UserController controller = new UserController(service);

UserResponse response = controller.show(1);

System.out.println(response.name());
```

コードの意味です。

- `UserRepository` を作ります。
- `UserService` にRepositoryを渡します。
- `UserController` にServiceを渡します。
- `controller.show(1)` で、ユーザー情報を取得します。
- `response.name()` で、DTOの名前を表示します。

## 練習問題

### 問題1: ProductResponseを作る

商品APIで返すDTOとして、`id`、`name`、`price` を持つ `ProductResponse` を `record` で作ってください。

**答え:**

```java
public record ProductResponse(int id, String name, int price) {
}
```

DTOは、外部に返したい情報だけを持たせます。

### 問題2: EntityからDTOに変換する

`ProductEntity` から `ProductResponse` を作る `ProductService` のメソッドを書いてください。

**答え:**

```java
public ProductResponse toResponse(ProductEntity product) {
    return new ProductResponse(
        product.getId(),
        product.getName(),
        product.getPrice()
    );
}
```

EntityにはDBに近い情報、DTOにはAPIで返す情報を持たせます。Serviceで変換すると、Controllerがすっきりします。
