---
title: "NestJS版: AWSへの全体デプロイ"
parent: SNS開発（最終プロジェクト）
nav_order: 39
section_key: sns-nestjs
section_title: SNS NestJS + Prisma版
---

# AWSへの全体デプロイ

[テスト](/sns/testing/)まで書き終え、SNSアプリは機能として完成しました。このページでは、いよいよこのアプリをAWS上の本番環境へデプロイし、インターネット越しに使える状態にします。

構成要素はすべて[AWSデプロイの章](/aws/)で一度ずつ構築したものです。フロントエンドはS3 + CloudFront、APIはECR + ECS Fargate + ALB、データベースはRDS、メールはSES、そしてそれらをCDKで定義し、GitHub Actionsから自動デプロイする——個別に学んだ部品を、今回は**1つのアプリのために組み合わせ直す**のがテーマです。汎用的な説明は各ページへの参照で済ませ、ここでは**SNSアプリ固有の設定**に集中します。

> **料金に関する注意（必読）**
>
> このページで作る構成には、**無料利用枠を超えやすい、または時間課金のリソース**が含まれます。
>
> - **RDS** … インスタンスが起動している間ずっと課金されます（無料枠は条件付き・期間限定）
> - **ALB** … 起動時間に対して課金されます（1時間あたり数円 + 処理量）
> - **ECS Fargate** … タスクが動いている間、vCPUとメモリに対して秒単位で課金されます
> - **NAT Gateway** … 起動時間 + 処理データ量に課金されます。**置いておくだけで1日200円強（月6,000円規模）**になる、見落としやすい代表格です（→ [ECR + ECS Fargate](/aws/ecr_ecs/)）
>
> 合計すると、この構成を放置した場合**1日あたり数百円規模**の課金が発生し得ます。練習が終わったら、ページ末尾の手順で**必ず `cdk destroy` を実行して削除**してください。また、作業を始める前に、[AWSとは何か](/aws/what_is_aws/)で設定した**予算アラート**が有効になっていることをもう一度確認してください。

## 学習目標

- SNSアプリの本番アーキテクチャ全体を図で説明できる
- 本番用のマルチステージDockerfileを書き、起動時マイグレーションのトレードオフを説明できる
- CDKの1つのスタックとして、VPC・RDS・S3・CloudFront・ECS Fargate・ALBをSNS固有の設定込みで定義できる
- 環境変数とシークレット（DATABASE_URL・JWT_SECRET）を安全に本番コンテナへ渡す方法を説明できる
- GitHub Actions + OIDCで「pushしたら自動デプロイ」のパイプラインを構築できる

## 全体構成

最初に完成形を確認します。[この章の冒頭](/sns/)で見たアーキテクチャ図が、ついに現実のものになります。

```mermaid
flowchart LR
    User(["利用者の<br>ブラウザ"])
    GH["GitHub Actions<br>（CI/CD）"]

    subgraph AWS["AWS（ap-northeast-1）"]
        CF["CloudFront"]
        S3F["S3<br>フロントエンド配信用"]
        ALB["ALB"]
        ECS["ECS Fargate<br>（NestJS API）"]
        RDS["RDS<br>PostgreSQL 16"]
        S3A["S3<br>アバター画像用"]
        SES["SES"]
        ECR["ECR"]
    end

    User -->|"HTML/CSS/JS"| CF --> S3F
    User -->|"API + WebSocket"| ALB --> ECS
    ECS --> RDS
    ECS -->|"presigned URL発行"| S3A
    User -->|"画像のPUT/GET"| S3A
    ECS -->|"確認メール送信"| SES
    GH -->|"イメージpush"| ECR -->|"pull"| ECS
    GH -->|"sync / invalidation"| S3F

    classDef aws fill:#fff3e0,stroke:#ef6c00
    class CF,S3F,ALB,ECS,RDS,S3A,SES,ECR aws
    style User fill:#e3f2fd,stroke:#1565c0
    style GH fill:#e3f2fd,stroke:#1565c0
```

利用者から見ると入口は2つです。静的ファイル（Reactのビルド成果物）はCloudFront経由でS3から配信され、API呼び出しとWebSocket（チャット）はALB経由でECS Fargate上のNestJSに届きます。NestJSはRDSのPostgreSQLを読み書きし、確認メールはSESから送り、アバター画像はpresigned URLを発行して利用者に直接S3へアップロードさせます。デプロイはGitHub Actionsが担当します。

各構成要素は、次のページで構築方法を学んだものです。忘れている部分があれば、先に該当ページを読み直してから進んでください。

| 構成要素 | このアプリでの役割 | 学んだページ |
|---|---|---|
| S3 + CloudFront | フロントエンド（Reactビルド成果物）の配信 | [S3 + CloudFront](/aws/s3_cloudfront/) |
| ECR + ECS Fargate + ALB | NestJS APIの実行 | [ECR + ECS Fargate](/aws/ecr_ecs/) |
| RDS + Secrets Manager | 本番データベースとパスワード管理 | [RDS](/aws/rds/) |
| SES | 登録確認メールの送信 | [SES](/aws/ses/) |
| S3（アバター用） | presigned URLによる画像アップロード | [プロフィール編集と画像アップロード](/sns/profile_and_images/) |
| VPC | ネットワークの土台 | [主要サービスの全体像](/aws/core_services/) |
| CDK | 上記すべてをコードで定義 | [CDK入門](/aws/cdk_setup/) |
| GitHub Actions + OIDC | pushしたら自動デプロイ | [CI/CDから自動デプロイ](/aws/deploy_from_cicd/) |

## 本番用Dockerfile

これまでの開発では、[開発環境の標準形](/docker/dev_environment/)どおり「DBだけコンテナ、APIはローカルで `pnpm run start:dev`」で動かしてきました。本番のECS Fargateで動かすには、**NestJSアプリ自体をDockerイメージにする**必要があります。[Dockerfileの書き方](/docker/dockerfile/)で学んだマルチステージビルドを、Prisma入りのNestJSに合わせて書きます。

**`backend/Dockerfile`**

```dockerfile
# ---- ステージ1: 依存関係のインストール ----
FROM node:20-slim AS deps
RUN corepack enable pnpm && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- ステージ2: ビルド ----
FROM node:20-slim AS build
RUN corepack enable pnpm && corepack prepare pnpm@9 --activate
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ---- ステージ3: 実行 ----
FROM node:20-slim AS runner
RUN corepack enable pnpm && corepack prepare pnpm@9 --activate
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./
EXPOSE 3000
CMD ["sh", "./docker-entrypoint.sh"]
```

**コード解説**

- `FROM node:20-slim AS deps` … ステージ1の開始です。`node:20-slim` はNode.js 20入りの軽量イメージで、`AS deps` でこのステージに名前を付けます（→ [Dockerfileの書き方](/docker/dockerfile/)のマルチステージビルド）
- `RUN corepack enable pnpm && corepack prepare pnpm@9 --activate` … コンテナ内でpnpmを使えるようにします。ステージごとにまっさらな環境から始まるので、pnpmを使う各ステージで有効化が必要です（→ [Dockerfileの書き方](/docker/dockerfile/)）。`corepack prepare pnpm@9 --activate` を付けているのは、Corepackは固定しないと最新のpnpmを取得し、Node.js 20非対応のバージョンが入ることがあるため、9系に固定する必要があるからです
- `COPY package.json pnpm-lock.yaml ./` と `RUN pnpm install --frozen-lockfile` … 依存定義だけを先にコピーしてからインストールします。コードを変更しても依存が変わらなければ**このレイヤーのキャッシュが効く**ようにする定石でした（`--frozen-lockfile` はlockファイルどおりに入れるCI/本番向けオプションです）
- `RUN apt-get update -y && apt-get install -y openssl ...` … PrismaのクエリエンジンがOpenSSLを必要とするため、slimイメージに追加インストールします。`rm -rf /var/lib/apt/lists/*` はaptのキャッシュを消してイメージを小さく保つ書き方です
- `RUN pnpm exec prisma generate` … Prisma Clientを生成します。[Prisma導入](/database/prisma_setup/)で学んだとおり、`@prisma/client` はスキーマから生成されるコードなので、**ビルド前に必ずgenerateが必要**です
- `RUN pnpm run build` … `nest build`（実体はtsc）が走り、`dist/` にJavaScriptが出力されます（→ [ビルドとデプロイの全体像](/cicd/build_and_deploy_flow/)）
- ステージ3では、実行に必要なもの（node_modules・package.json・prisma/・dist/・起動スクリプト）だけをコピーします。TypeScriptのソースコードは本番イメージに**含まれません**。`ENV NODE_ENV=production` は本番モードであることをライブラリ群に伝える慣習的な環境変数です
- `CMD ["sh", "./docker-entrypoint.sh"]` … 起動コマンドを直接書かず、次に作るシェルスクリプトに任せます

なお、本来はステージ3で `pnpm install --prod --frozen-lockfile`（本番用依存のみ）に絞ってイメージを小さくするのが定石です（→ [Dockerfileの書き方](/docker/dockerfile/)）。今回は起動時に `prisma migrate deploy` を実行するため、devDependenciesに入っている `prisma` CLIが本番イメージにも必要になり、簡単のためnode_modulesを丸ごと持ち込んでいます。`prisma` を `dependencies` に移して `--prod` で絞る方法もある、と覚えておいてください。

### .dockerignore — ホストのnode_modulesを持ち込まない

Dockerfileと一緒に、`.dockerignore` も必ず作ります（→ [Dockerfileの書き方](/docker/dockerfile/)で学んだ「イメージ作成時にコピー対象から除外するファイル」の一覧です）。

**`backend/.dockerignore`**

```
node_modules
dist
.env
cdk.out
```

これを作らずにローカルの `node_modules` がある状態でビルドすると、`COPY . .` がホスト（macOSなど）用のネイティブバイナリをLinuxコンテナに持ち込んでしまい、起動時に `invalid ELF header` というエラーでクラッシュします。

### 起動スクリプト: マイグレーションしてから起動する

**`backend/docker-entrypoint.sh`**

```sh
#!/bin/sh
set -e

# DATABASE_URL が未設定なら、個別の環境変数から組み立てる（本番用）
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
fi

pnpm exec prisma migrate deploy
exec node dist/main.js
```

**コード解説**

- `set -e` … 途中のコマンドが失敗したら、そこでスクリプト全体を失敗させます（マイグレーションに失敗したままAPIを起動しないため）
- `if [ -z "$DATABASE_URL" ]; then ... fi` … `DATABASE_URL` が空のときだけ、`DB_USER` などの部品から接続URLを組み立てます。ローカル確認では `DATABASE_URL` を直接渡し、本番（ECS）では部品を渡す——両方に対応する書き方です。なぜ本番で部品に分けるのかは、後ほどECSの節で説明します
- `pnpm exec prisma migrate deploy` … [マイグレーション](/database/schema_and_migration/)で学んだ `migrate dev` の**本番版**です。新しいマイグレーションファイルを適用するだけで、スキーマの差分生成や開発用DBのリセットは行いません
- `exec node dist/main.js` … ビルド済みのNestJSを起動します。`exec` を付けると、シェルがNodeプロセスに「成り代わる」ため、コンテナ停止時のシグナルがNode.jsに直接届きます

**起動時にマイグレーションを流す設計のトレードオフ**も知っておいてください。この方式は「デプロイすればDBも最新になる」というシンプルさが利点ですが、(1) 複数タスクを同時起動するとマイグレーションが同時に走り得る、(2) マイグレーションが失敗するとアプリが起動できない、という弱点があります。チーム開発の本番環境では「CI/CDの独立したステップとしてマイグレーションを実行してからアプリを更新する」構成がよく使われます。今回はタスク1つの学習用構成なので、シンプルな起動時実行を採用します。

### ローカルでビルドして確認する

ECSに渡す前に、手元でイメージが正しく動くことを確認します。[開発用DB](/sns/project_setup/)が起動している状態で実行してください。

```bash
cd sns-app/backend
docker build -t sns-backend .
```

```
[+] Building 65.3s (18/18) FINISHED
 => [build 7/7] RUN pnpm run build
 => => naming to docker.io/library/sns-backend
```

ビルドできたら起動します。`--env-file .env` で開発用の環境変数を丸ごと渡しつつ、`DATABASE_URL` だけ `-e` で上書きします（`-e` は `--env-file` より優先されます）。コンテナの中から見るとlocalhostはコンテナ自身を指すため、ホスト側のDBには `host.docker.internal` でアクセスするのでした（→ [Docker導入と基本操作](/docker/install_and_basics/)）。

```bash
docker run --rm -p 3000:3000 --env-file .env \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/sns?schema=public" \
  sns-backend
```

```
No pending migrations to apply.
[Nest] 1  - LOG [NestApplication] Nest application successfully started
```

別のターミナルからヘルスチェックを叩きます。

```bash
curl http://localhost:3000/health
```

```
{"status":"ok"}
```

これで「本番と同じ形」のイメージが手元で動くことを確認できました。`Ctrl + C` でコンテナを止めて次へ進みます。

## CDKプロジェクトを作る

インフラの定義は `sns-app/infra/` に置きます。[CDK入門](/aws/cdk_setup/)で学んだ手順そのままです（`cdk bootstrap` はAWS章で実施済みの前提です。未実施ならば先に済ませてください）。

```bash
cd sns-app
mkdir infra
cd infra
pnpm dlx aws-cdk init app --language typescript
```

```
Applying project template app for typescript
✅ All done!
```

[CDK入門](/aws/cdk_setup/)で行ったとおり、雛形はnpm前提で生成されるので、`pnpm install` を一度実行して依存関係をpnpmで入れ直しておきます（`package-lock.json` は削除して構いません）。

今回は**1つのスタック `SnsAppStack` にすべてのリソース**を定義します。AWS章ではフロント用・API用とスタックを分けましたが、最終プロジェクトでは「アプリ一式を1コマンドで作って1コマンドで消せる」ことを優先します。役割ごとのスタック分割（ネットワーク/DB/アプリの3層に分ける等）は発展課題として挑戦してみてください。

### 先にECRリポジトリとイメージを用意する

1つだけ、スタックの外で準備するものがあります。**ECRリポジトリと最初のイメージ**です。ECSサービスは起動時にイメージをpullするため、スタックをデプロイする時点でイメージが**先に**存在していなければなりません（鶏と卵の関係です）。そこでリポジトリだけCLIで作り、先ほどビルドしたイメージをpushしておきます（pushの流れは → [ECR + ECS Fargate](/aws/ecr_ecs/)）。

```bash
aws ecr create-repository --repository-name sns-backend
aws sts get-caller-identity --query Account --output text
```

```
123456789012
```

表示されたアカウントIDを使って、ログイン → タグ付け → pushします（`123456789012` は自分のIDに読み替えてください）。

```bash
aws ecr get-login-password | docker login --username AWS \
  --password-stdin 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag sns-backend:latest \
  123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/sns-backend:latest
docker push 123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/sns-backend:latest
```

```
Login Succeeded
latest: digest: sha256:1a2b3c... size: 2415
```

このリポジトリはCDKの管理外なので、**`cdk destroy` では消えません**。後片付けの節で手動削除します。

### スタックの骨格

ここからスタック本体を書きます。`lib/sns-app-stack.ts` を新規作成し、以下のコードを**上から順に**書き足していってください（節ごとに分けて掲載しますが、すべて同じconstructorの中に続けて書きます）。まずimportと骨格、そしてVPCです。

**`infra/lib/sns-app-stack.ts`（その1: VPC）**

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class SnsAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---- ネットワーク（VPC） ----
    const vpc = new ec2.Vpc(this, 'SnsVpc', {
      maxAzs: 2,
      natGateways: 1,
    });
```

**コード解説**

- `const vpc = new ec2.Vpc(...)` … RDSとECSを入れるネットワークの土台です（→ [主要サービスの全体像](/aws/core_services/)）。L2コンストラクトなので、パブリック/プライベートサブネットやルーティングは自動で良い構成が組まれます
- `maxAzs: 2` … 2つのアベイラビリティゾーンを使います。ALBとRDSが最低2AZを要求するため、これ以上減らせません
- `natGateways: 1` … プライベートサブネットからインターネットへ出るためのNAT Gatewayを1つだけ作ります。デフォルトではAZごと（=2つ）作られますが、**NAT Gatewayは時間課金される高コスト部品**なので、学習用は1つに抑えます

> **料金に関する注意**
>
> NAT Gatewayはこの構成の中でも特に「忘れた頃に課金されている」リソースです。`natGateways: 1` でも起動している限り課金が続きます。動作確認が済んだら早めに `cdk destroy` する、を徹底してください。

### RDS for PostgreSQL 16

[RDS](/aws/rds/)で学んだ構成です。SNS固有の点は、データベース名を開発環境と同じ `sns` にすることだけです。

**`infra/lib/sns-app-stack.ts`（その2: RDS）**

```typescript
    // ---- データベース（RDS for PostgreSQL 16） ----
    const db = new rds.DatabaseInstance(this, 'SnsDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO,
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      databaseName: 'sns',
      allocatedStorage: 20,
      multiAz: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });
```

**コード解説**

- `engine: ...postgres({ version: ...VER_16 })` … 開発環境（composeの `postgres:16`）と同じPostgreSQL 16を指定します。**開発と本番でDBのバージョンを揃える**のは事故を防ぐ基本です
- `instanceType: T4G, MICRO` … 最小クラスのインスタンスです。それでも**起動している間は課金され続けます**
- `vpcSubnets: PRIVATE_WITH_EGRESS` … DBはインターネットから直接届かないプライベートサブネットに置きます（→ [RDS](/aws/rds/)で学んだセキュリティの基本）。なお[AWS章](/aws/rds/)では、外向き通信も遮断した`PRIVATE_ISOLATED`を使いました。DB自体に外向きの通信は不要なので本来はISOLATEDでも構いませんが、今回のVPCはECSタスク用に`natGateways: 1`の既定構成（パブリック + `PRIVATE_WITH_EGRESS`の2種類のサブネット）で作っており、ISOLATEDサブネットが存在しないため、ここでは`PRIVATE_WITH_EGRESS`に置いています。`subnetConfiguration`でISOLATEDサブネットを追加してDBをそちらに隔離する構成は、発展課題として試してみてください
- `databaseName: 'sns'` … インスタンス作成時に `sns` データベースを作ります。Prismaの接続先になります
- パスワードを書いていない点に注目してください。指定しなければ、CDKが**Secrets Managerに自動生成のパスワードを保存**します（ユーザー名は `postgres`）。コードにもGitにもパスワードが残らない仕組みです
- `removalPolicy: DESTROY` / `deletionProtection: false` … 学習用に「destroyで確実に消える」設定です。本番の業務システムでは逆の設定にします

### アバター画像用S3バケット

[プロフィール編集と画像アップロード](/sns/profile_and_images/)で手動作成した開発用バケットの本番版を、CDKで定義します。仕様は同じで、(1) `avatars/*` だけ公開読み取りを許可、(2) presigned PUT のためのCORS設定、の2点が必要でした。

**`infra/lib/sns-app-stack.ts`（その3: アバター用S3）**

```typescript
    // ---- アバター画像用S3バケット ----
    const avatarBucket = new s3.Bucket(this, 'AvatarBucket', {
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    avatarBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [avatarBucket.arnForObjects('avatars/*')],
        principals: [new iam.AnyPrincipal()],
      }),
    );
```

**コード解説**

- `blockPublicAccess: new s3.BlockPublicAccess({...})` … フロント用バケットでは `BLOCK_ALL`（全面遮断）でしたが、このバケットは**バケットポリシーによる公開だけを許可**するため、`blockPublicPolicy` と `restrictPublicBuckets` を `false` にした個別設定にします
- `addToResourcePolicy(...)` … バケットポリシーを足します。`arnForObjects('avatars/*')` で対象を `avatars/` 配下に限定し、`AnyPrincipal()`（誰でも）に `s3:GetObject`（読み取りのみ）を許可します。書き込みはpresigned URL経由でしか行えません
- 公開設定の意味と注意点は[プロフィール編集と画像アップロード](/sns/profile_and_images/)の注意ボックスで説明したとおりです。「`avatars/*` の読み取りのみ公開、それ以外は遮断」という最小限の公開であることを確認してください

CORS設定（presigned PUTの許可）には**CloudFrontのURL**（=本番のフロントエンドのオリジン）が必要なので、次の節でCloudFrontを定義したあとに追記します。なお、アバター画像もCloudFront経由で配信する（バケットを完全非公開に保つ）構成にもできますが、これは発展課題とします。

### フロントエンド用S3 + CloudFront

[S3 + CloudFront](/aws/s3_cloudfront/)で構築したものとほぼ同じです。1点だけ意図的に変えている部分（`viewerProtocolPolicy`）があり、これは後で説明します。

**`infra/lib/sns-app-stack.ts`（その4: フロント用S3 + CloudFront）**

```typescript
    // ---- フロントエンド配信（S3 + CloudFront） ----
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    const frontendUrl = `http://${distribution.distributionDomainName}`;

    // アバター用バケットに、本番フロントからのPUTを許可するCORS設定
    avatarBucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.PUT],
      allowedOrigins: [
        `http://${distribution.distributionDomainName}`,
        `https://${distribution.distributionDomainName}`,
      ],
      allowedHeaders: ['*'],
    });
```

**コード解説**

- バケット + `withOriginAccessControl` + `errorResponses` の構成は[S3 + CloudFront](/aws/s3_cloudfront/)で学んだとおりです（OACで非公開バケットから配信、403は `index.html` に差し替え）
- `viewerProtocolPolicy: ALLOW_ALL` … AWS章では `REDIRECT_TO_HTTPS` でしたが、今回は**あえてHTTPアクセスも許可**します。理由は次の「この構成の限界」で説明します
- `errorResponses` … 私たちのSNSは**ハッシュベースのルーティング**（`#/users/alice` のようなURL。→ [ユーザー登録とログイン](/sns/auth/)で作った `useHashRoute`）なので、サーバーに届くパスは常に `/` だけです。つまりSPAの404問題はそもそもほぼ起きないのですが、存在しないパスを直接開かれた場合の保険として設定しておきます
- `avatarBucket.addCorsRule({...})` … アバター用バケットへ、本番フロントのオリジンからの `PUT`（presigned URLでのアップロード）を許可します。ブラウザは「ページのオリジンと異なるオリジンへの書き込み」をCORSで検査するため、この設定がないとアップロードが失敗します（→ [つなぎ込みで起きること](/fullstack-todo/integration/)で学んだCORSと同じ仕組みです）

> **この構成の限界（混在コンテンツ問題）**
>
> CloudFrontは標準でHTTPSのURLを提供しますが、ALBはこのままでは**HTTPのみ**です（HTTPS化には独自ドメインと証明書が必要）。ブラウザには「HTTPSのページからHTTPのAPIを呼ぶと**混在コンテンツ（mixed content）**としてブロックする」という保護機能があるため、`https://` でフロントを開くとAPI呼び出しがすべて失敗します。
>
> そこで今回は学習用の簡易構成として、CloudFrontへのHTTPアクセスを許可し、**動作確認は `http://xxxx.cloudfront.net` のURLで行います**。正攻法は、Route 53で独自ドメインを取得し、ACM（AWSの証明書サービス）の証明書をALBに付けて全体をHTTPS化することです（→ [主要サービスの全体像](/aws/core_services/)のRoute 53）。これは本カリキュラムの範囲を超えるため、発展課題とします。実サービスでHTTP配信が許されないことは、必ず覚えておいてください。

### ECS Fargate + ALB（このページの中心）

APIの実行環境です。骨組みは[ECR + ECS Fargate](/aws/ecr_ecs/)で学んだL3コンストラクト `ApplicationLoadBalancedFargateService` ですが、ここに**SNS固有の設定**がいちばん多く詰まっています。まず、JWTの署名鍵を入れるシークレットを作ってから、サービス本体を定義します。

**`infra/lib/sns-app-stack.ts`（その5: ECS Fargate + ALB）**

```typescript
    // ---- JWT署名鍵（Secrets Managerで自動生成） ----
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      generateSecretString: {
        passwordLength: 32,
        excludePunctuation: true,
      },
    });

    // ---- ECR（CLIで作成済みのリポジトリを参照） ----
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'BackendRepo',
      'sns-backend',
    );

    // ---- ECS Fargate + ALB ----
    const cluster = new ecs.Cluster(this, 'SnsCluster', {
      vpc,
      clusterName: 'sns-cluster',
    });

    const api = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'SnsApi', {
      cluster,
      serviceName: 'sns-api',
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      idleTimeout: cdk.Duration.seconds(120),
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
        containerPort: 3000,
        environment: {
          FRONTEND_URL: frontendUrl,
          MAIL_TRANSPORT: 'ses',
          MAIL_FROM: 'sns@example.com', // SESで検証した自分のアドレスに変更する
          AWS_REGION: this.region,
          AVATAR_BUCKET: avatarBucket.bucketName,
          DB_USER: 'postgres',
          DB_HOST: db.dbInstanceEndpointAddress,
          DB_PORT: db.dbInstanceEndpointPort,
          DB_NAME: 'sns',
        },
        secrets: {
          DB_PASS: ecs.Secret.fromSecretsManager(db.secret!, 'password'),
          JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
        },
      },
    });

    // ヘルスチェックはGET /health（project_setupで作ったエンドポイント）
    api.targetGroup.configureHealthCheck({ path: '/health' });

    // ECSタスクからRDSへの接続を許可（セキュリティグループ）
    db.connections.allowFrom(api.service, ec2.Port.tcp(5432));

    // タスクロールへの権限付与: S3へのPutObject（presigned URL用）とSES送信
    avatarBucket.grantPut(api.taskDefinition.taskRole);
    api.taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      }),
    );
```

**コード解説**

- `new secretsmanager.Secret(...)` … 開発では `.env` に書いていた `JWT_SECRET` を、本番ではSecrets Managerに**ランダム生成**させます（記号を除いた32文字）。値は誰も知る必要がなく、コードにもGitにも残りません
- `ecr.Repository.fromRepositoryName(...)` … CLIで作った既存リポジトリを「インポート」して参照します。`from〜` で始まるメソッドは「作る」のではなく「既にあるものを指す」ためのものです
- `ApplicationLoadBalancedFargateService` … ALB・ターゲットグループ・ECSサービス・タスク定義・セキュリティグループを一括で組み立てるL3コンストラクトです（→ [ECR + ECS Fargate](/aws/ecr_ecs/)）
- `serviceName: 'sns-api'` / `clusterName: 'sns-cluster'` … 名前を固定します。後でGitHub Actionsから `aws ecs update-service --cluster sns-cluster --service sns-api` と呼ぶため、自動生成名ではなく予測できる名前にしておきます
- `cpu: 256, memoryLimitMiB: 512, desiredCount: 1` … 最小構成（0.25 vCPU / 512MB）のタスクを1つだけ動かします。**タスクが動いている間は秒課金**です。チャット（Socket.IO）があるため、タスク数を増やす場合は追加の対策が必要です（後述）
- `idleTimeout: cdk.Duration.seconds(120)` … **SNS固有設定その1**。ALBはデフォルトで60秒間通信のない接続を切断します。チャットのWebSocket接続は「メッセージが来るまで無通信」になりがちなので、余裕を持って120秒に延長します（Socket.IOは定期的にping/pongを送るので、これで安定します）
- `image: fromEcrRepository(repository, 'latest')` … 先ほどpushした `latest` タグのイメージを使います
- `environment: {...}` … **SNS固有設定その2**。開発で `.env` に書いていた値の本番版です。`FRONTEND_URL` にはCloudFrontのURLを渡します（[CORS設定](/sns/project_setup/)とメール内リンクの生成に使われるため、ここを間違えると登録メールのリンクが開発環境を指してしまいます）。`MAIL_TRANSPORT: 'ses'` で[メール送信](/sns/email_verification/)を本番モードに切り替え、`AVATAR_BUCKET` には上で作ったバケット名が自動で入ります
- `DB_USER` / `DB_HOST` / `DB_PORT` / `DB_NAME` … `DATABASE_URL` の「秘密ではない部品」です。ホスト名とポートはRDSコンストラクトのプロパティから取れます
- `secrets: {...}` … **SNS固有設定その3**。`environment` がタスク定義に平文で残るのに対し、`secrets` は**起動時にSecrets Managerから取得**されます。`DB_PASS` はRDSが自動生成したシークレット（JSON形式）の `password` フィールドだけを取り出しています。コンテナの中では普通の環境変数として見えるので、アプリ側のコード変更は不要です
- ここで `docker-entrypoint.sh` の意図が分かります。`DATABASE_URL` という1本のURLは「平文の部品 + 秘密のパスワード」の合成なので、**コンテナの起動時にスクリプトで組み立てる**のです（RDSの自動生成パスワードは `@` や `/` などURLを壊す記号を除いて生成されるため、そのまま埋め込めます）
- `configureHealthCheck({ path: '/health' })` … **SNS固有設定その4**。ALBのヘルスチェックはデフォルトで `/` を叩きますが、私たちのAPIに `GET /` はなく404になってしまいます。[プロジェクトセットアップ](/sns/project_setup/)で作った `GET /health` を指定します。これを忘れるとタスクが「不健康」と判定されて起動と停止を繰り返すので、最重要の1行です
- `db.connections.allowFrom(api.service, ec2.Port.tcp(5432))` … 「ECSサービスのセキュリティグループからの5432番ポート接続を、RDSのセキュリティグループで許可する」という設定が、この1行で済みます（→ [RDS](/aws/rds/)のセキュリティグループ）
- `avatarBucket.grantPut(...)` … **SNS固有設定その5**。presigned URLは「発行した人の権限で署名」されるため、タスクロール（コンテナ内のアプリの権限）に `s3:PutObject` がないと、発行したURLでのアップロードが失敗します（→ [プロフィール編集と画像アップロード](/sns/profile_and_images/)）
- `addToPrincipalPolicy(... 'ses:SendEmail' ...)` … 同じくタスクロールにSESの送信権限を付与します。開発ではIAMユーザーの認証情報を使いましたが、本番では**ロールに権限を持たせる**のが正しい形です（→ [SES](/aws/ses/)）

### Socket.IOを複数台にするときのRedis

ここはスケールアウト時の注意です。今は読むだけでOKです。

`desiredCount` を2以上にすると、Socket.IOでは2つの問題が起きます。

1. 接続確立時の複数リクエストが別タスクに散らばると接続に失敗するため、ALBの**スティッキーセッション**（同じ利用者を同じタスクへ送り続ける設定）が必要になる
2. タスクAに接続中の利用者へ、タスクBが受け取ったメッセージを届けられないため、タスク間でイベントを中継する**Redisアダプタ**等が必要になる

[リアルタイム通信](/realtime/nestjs_gateway/)で学んだ「サーバーが接続を保持する」性質の裏返しです。今回は `desiredCount: 1` なのでどちらも不要です。

### SESについて

SESはCDKで作るリソースが特にありません。[SES](/aws/ses/)で行った**送信元メールアドレスの検証**がそのまま有効で、上の `MAIL_FROM` をその検証済みアドレスに書き換えれば動きます。ただし**サンドボックス制限**を忘れないでください。サンドボックス中のSESは「検証済みのアドレス宛て」にしか送信できません。つまりこのあとの動作確認では、**受信側（登録に使うメールアドレス）も検証済み**である必要があります。自分のアドレスで登録すれば問題ありません。

### 出力とエントリーポイント

最後に、後で使う値を `CfnOutput` で出力して、constructorを閉じます。

**`infra/lib/sns-app-stack.ts`（その6: 出力）**

```typescript
    // ---- デプロイ後に使う値の出力 ----
    new cdk.CfnOutput(this, 'SiteUrl', { value: frontendUrl });
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `http://${api.loadBalancer.loadBalancerDnsName}`,
    });
    new cdk.CfnOutput(this, 'FrontendBucketName', { value: frontendBucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
  }
}
```

**コード解説**

- `SiteUrl` … 利用者がアクセスするURL（CloudFront）。前述の理由で `http://` です
- `ApiUrl` … ALBのURL。フロントのビルド時に `VITE_API_URL` として埋め込みます
- `FrontendBucketName` / `DistributionId` … フロントのデプロイ（sync + invalidation）に使います

エントリーポイントを `SnsAppStack` に差し替えます。

**`infra/bin/infra.ts`**

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SnsAppStack } from '../lib/sns-app-stack';

const app = new cdk.App();
new SnsAppStack(app, 'SnsAppStack');
```

### cdk diff と deploy

[CDK入門](/aws/cdk_setup/)で身につけた「diffを見てからdeploy」のサイクルです。

```bash
pnpm exec cdk diff
```

```
Stack SnsAppStack
Resources
[+] AWS::EC2::VPC SnsVpc SnsVpc1A2B3C4D
[+] AWS::RDS::DBInstance SnsDb ...
[+] AWS::CloudFront::Distribution FrontendDistribution ...
[+] AWS::ECS::Service SnsApi ...
（以下略。VPCのサブネット等も含め50個前後のリソースが [+] で並ぶ）
```

`[-]`（削除）が含まれていないことを確認したら、デプロイします。

```bash
pnpm exec cdk deploy
```

```
Do you wish to deploy these changes (y/n)? y
SnsAppStack: deploying...

 ✅  SnsAppStack

✨  Deployment time: 912.4s

Outputs:
SnsAppStack.SiteUrl = http://d1234abcdefgh.cloudfront.net
SnsAppStack.ApiUrl = http://SnsAp-SnsAp-XXXXXXXX-1234567890.ap-northeast-1.elb.amazonaws.com
SnsAppStack.FrontendBucketName = snsappstack-frontendbucket1234-abcdefgh
SnsAppStack.DistributionId = E1ABCDEFGHIJK
```

RDSとCloudFrontの作成に時間がかかるため、**15分前後**を見込んでください。完了したらOutputsの4つの値を控えます。**この時点から課金が始まっています**。動作確認まで一気に進めましょう。

まずAPIの生存確認です。

```bash
curl http://SnsAp-SnsAp-XXXXXXXX-1234567890.ap-northeast-1.elb.amazonaws.com/health
```

```
{"status":"ok"}
```

これが返れば、「イメージのpull → マイグレーション → NestJS起動 → ヘルスチェック合格」まですべて成功しています。返らない場合は、ECSコンソールのタスクの「ログ」タブ（CloudWatch Logs）でエラーを確認してください。マイグレーション失敗（DB接続）かヘルスチェックパスの間違いが定番です。

### フロントエンドをビルドして配置する

フロントエンドのコードはAPIのURLを `import.meta.env.VITE_API_URL` から読んでいます（→ [ユーザー登録とログイン](/sns/auth/)の `apiClient.ts`）。本番ビルドでは、この値を**ALBのURL**に差し替える必要があります。Viteは `pnpm run build` のとき `.env` より `.env.production` を優先して読むので、本番用の値はこのファイルに置きます。

**`frontend/.env.production`**

```
VITE_API_URL="http://SnsAp-SnsAp-XXXXXXXX-1234567890.ap-northeast-1.elb.amazonaws.com"
```

`ApiUrl` の出力値（末尾にスラッシュは付けない）に書き換えたら、ビルドして[S3 + CloudFront](/aws/s3_cloudfront/)で学んだ「sync + invalidation」で配置します。

```bash
cd sns-app/frontend
pnpm run build
aws s3 sync dist/ s3://snsappstack-frontendbucket1234-abcdefgh --delete
aws cloudfront create-invalidation --distribution-id E1ABCDEFGHIJK --paths "/*"
```

```
vite v5.2.0 building for production...
✓ built in 2.31s
upload: dist/index.html to s3://snsappstack-frontendbucket1234-.../index.html
upload: dist/assets/index-BX3kVQzN.js to s3://...
{ "Invalidation": { "Status": "InProgress", ... } }
```

### 動作確認: 自分のSNSが世界で動く

ブラウザで `SiteUrl` の値（**必ず `http://` のまま**。前述の混在コンテンツ問題のため、`https://` で開くとAPI呼び出しがブロックされます）を開き、一通りの機能を確認します。

1. **登録** … SESで検証済みの自分のメールアドレスでユーザー登録する
2. **メール確認** … 届いた確認メールのリンクを開く。リンクがCloudFrontのURL（`FRONTEND_URL`）を指していることも確認する（→ [メールアドレス確認](/sns/email_verification/)）
3. **ログインと投稿** … ログインしてタイムラインに投稿し、いいねを付ける
4. **プロフィール** … 設定画面からアバター画像をアップロードする（presigned URL → S3 が本番でも動くことの確認）
5. **チャット** … 2人目のユーザーを登録し（サンドボックス中はそのメールアドレスも検証が必要です）、別のブラウザでログインしてDMを送り合う。WebSocketがALB越しに動くことの確認です

ローカルの `localhost:5173` で見ていた画面が、世界中どこからでもアクセスできるURLで動いています。これが第6章から積み上げてきたものの到達点です。

> **料金に関する注意（再掲）**
>
> 動作確認が済んで今日はここまで、という場合は、先に進む前に**いったん `cdk destroy` で削除して構いません**。コードがすべて残っているので、次回 `cdk deploy` すれば（ECRのイメージも残っています）15分で同じ環境が再現できます。「使うときだけ作る」がIaCの正しい使い方です。

## GitHub Actionsで自動デプロイ

ここまでのデプロイは手作業（build → push → sync → invalidation）でした。これを「mainブランチにpushしたら自動で本番に反映」に進化させます。認証には、[CI/CDから自動デプロイ](/aws/deploy_from_cicd/)で学んだ**OIDCの仕組み**（パスワードレスでGitHub ActionsがAWSを操作できる仕組み）をそのまま使います。

ただし、**あの章で作ったCicdStackのIAMロールを、そのまま使い回すことはできません**。あのロールの権限は`grantReadWrite`などのgrantメソッドで**aws章のリソース（FrontendStackのバケット・EcrStackの`sns-api`リポジトリ・そのDistribution）に限定**されています。最小権限の原則どおりの良い設計ですが、その裏返しとして、今回の`SnsAppStack`のバケットや`sns-backend`リポジトリを操作しようとすると**AccessDenied**になります。対処は次のどちらかです。

1. **SNS用のリソースを参照するCicdStackを新たに定義する（aws章のスタックを削除済みの人はこちら）** — `sns-app/infra/lib/cicd-stack.ts`に、[CI/CDから自動デプロイ](/aws/deploy_from_cicd/)のCicdStackと同じ構成のスタックを作り、grantの対象だけを今回のリソースに差し替えます。方針は次のとおりです（OIDCプロバイダとロールの定義・信頼条件はaws章のコードと同じです）。

   ```typescript
   // lib/cicd-stack.ts（権限付与の部分だけ。スタックの骨格はaws章のCicdStackと同じ）
   props.frontendBucket.grantReadWrite(deployRole); // SnsAppStackのフロント用バケット
   props.repository.grantPullPush(deployRole);      // ECRのsns-backendリポジトリ
   deployRole.addToPolicy(
     new iam.PolicyStatement({
       actions: ['cloudfront:CreateInvalidation'],
       resources: [
         `arn:aws:cloudfront::${this.account}:distribution/${props.distribution.distributionId}`,
       ],
     }),
   );
   deployRole.addToPolicy(
     new iam.PolicyStatement({
       actions: ['ecs:UpdateService', 'ecs:DescribeServices'],
       resources: ['*'],
     }),
   );
   ```

   SnsAppStackのバケット・Distributionを公開プロパティにして渡す方法も、aws章で`FrontendStack`に対して行った変更と同じです。なお、OIDCプロバイダはアカウントに1つしか作れないため、aws章のCicdStackが残っている場合は`iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(...)`で既存のものを参照してください。

2. **既存ロールのポリシーにSNSのリソースを追加する（aws章のCicdStackを残している人はこちら）** — aws章の`cicd-stack.ts`に、今回のバケット・`sns-backend`リポジトリ・Distributionへの許可を上と同じ要領で追記し、`cdk deploy CicdStack`で更新します。

どちらの場合も、出力されたロールARN（`DeployRoleArn`）を次の節でGitHubのVariablesに設定します。

全体の流れをシーケンス図で確認します。

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant GH as GitHub Actions
    participant STS as AWS STS（OIDC）
    participant ECR as ECR
    participant ECS as ECS
    participant S3 as S3（フロント用）
    participant CF as CloudFront

    Dev->>GH: git push（mainブランチ）
    GH->>GH: test ジョブ（lint + test + build）
    GH->>STS: OIDCトークンで認証
    STS-->>GH: 一時的な認証情報
    par バックエンドのデプロイ
        GH->>ECR: docker build & push（:latest）
        GH->>ECS: update-service --force-new-deployment
        ECS->>ECR: 新しいイメージをpull
    and フロントエンドのデプロイ
        GH->>S3: vite build & aws s3 sync
        GH->>CF: create-invalidation
    end
```

pushを受けたGitHub Actionsが、まずテストを実行し、合格したらOIDCで一時的な認証情報を取得して、バックエンド（ECR/ECS）とフロントエンド（S3/CloudFront）を並行してデプロイします。**テストに落ちたらデプロイされない**——[CI/CDとは何か](/cicd/what_is_cicd/)で学んだ「壊れたものを本番に出さない仕組み」です。

### Variablesを登録・更新する

ワークフローから参照する値を、リポジトリの**Variables**に登録します（GitHubのリポジトリ → Settings → Secrets and variables → Actions → Variables。→ [CI/CDから自動デプロイ](/aws/deploy_from_cicd/)と同じ手順・同じ変数名です）。aws章で登録済みの変数は、値を今回のSnsAppStackの出力に**更新**してください。いずれも秘密情報ではないため、SecretsではなくVariablesで構いません。

| 変数名 | 値 |
|---|---|
| `AWS_DEPLOY_ROLE` | OIDC用IAMロールのARN（前節で用意したロールの `DeployRoleArn`） |
| `VITE_API_URL` | `ApiUrl` の出力値（ALBのURL。新規追加） |
| `FRONTEND_BUCKET` | `FrontendBucketName` の出力値（SnsAppStackの値に更新） |
| `DISTRIBUTION_ID` | `DistributionId` の出力値（SnsAppStackの値に更新） |

### ワークフローを書く

**`.github/workflows/deploy.yml`** を3段階に分けて書きます。まずトリガーと、土台になるtestジョブです。

**`.github/workflows/deploy.yml`（その1: トリガーとtestジョブ）**

```yaml
name: Deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: ap-northeast-1

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: backend/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm test
      - run: pnpm run build
```

**コード解説**

- `on: push: branches: [main]` … mainブランチへのpush（PRのマージを含む）だけで起動します（→ [GitHub Actions基礎](/cicd/github_actions_basics/)）
- `permissions: id-token: write` … OIDCトークンの発行をワークフローに許可します。**OIDC認証に必須**の1行でした（→ [CI/CDから自動デプロイ](/aws/deploy_from_cicd/)）
- `test` ジョブ … [CIパイプラインを作る](/cicd/ci_pipeline/)で組んだlint + test + buildと同じ内容です。ここではDB不要の単体テストまでを回しています。E2Eテスト（テスト用DBが必要）も含めたい場合は、[SNSのテストを書く](/sns/testing/)でCIの`backend`ジョブに足したservice container構成をこのジョブにも足してください
- `pnpm/action-setup@v4` + `cache: pnpm` … ランナーにpnpm（バージョン9）をインストールし、依存のキャッシュで2回目以降の実行を速くします。`actions/setup-node` より**先に**置くのがポイントでした（→ [CI/CDから自動デプロイ](/aws/deploy_from_cicd/)と同じ書き方です）

次に、フロントエンドのデプロイジョブを追記します。

**`.github/workflows/deploy.yml`（その2: deploy-frontendジョブ）**


```yaml
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
        working-directory: frontend
      - run: pnpm run build
        working-directory: frontend
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE }}
          aws-region: ${{ env.AWS_REGION }}
      - run: aws s3 sync frontend/dist "s3://${{ vars.FRONTEND_BUCKET }}" --delete
      - run: >
          aws cloudfront create-invalidation
          --distribution-id ${{ vars.DISTRIBUTION_ID }}
          --paths "/*"
```


**コード解説**

- `needs: test` … **testジョブが成功したときだけ**実行します。`needs` がジョブの順序を作るのでした（→ [GitHub Actions基礎](/cicd/github_actions_basics/)）
- `env: VITE_API_URL: ...` … ビルド時にAPIのURLを環境変数で渡します。Viteは環境変数を `.env.production` ファイルより優先するため、CIではファイルを作らずに済みます
- `aws-actions/configure-aws-credentials@v4` … OIDCでロールを引き受け、以降のステップでAWS CLIが使えるようになります
- 最後の2ステップは、手作業でやっていた「sync + invalidation」をそのまま自動化したものです（→ [S3 + CloudFront](/aws/s3_cloudfront/)）

最後にバックエンドのデプロイジョブです。

**`.github/workflows/deploy.yml`（その3: deploy-backendジョブ）**


```yaml
  deploy-backend:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE }}
          aws-region: ${{ env.AWS_REGION }}
      - name: Log in to ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build and push image
        run: |
          docker build -t ${{ steps.ecr.outputs.registry }}/sns-backend:latest backend
          docker push ${{ steps.ecr.outputs.registry }}/sns-backend:latest
      - name: Update ECS service
        run: >
          aws ecs update-service
          --cluster sns-cluster
          --service sns-api
          --force-new-deployment
```


**コード解説**

- `aws-actions/amazon-ecr-login@v2` … ECRへの `docker login` を行う公式アクションです。`id: ecr` を付けると、後続ステップから `steps.ecr.outputs.registry`（`123456789012.dkr.ecr...` の部分）が参照できます
- `docker build ... backend` … 最後の `backend` がビルドコンテキストです。リポジトリ直下で実行されるため、`backend/Dockerfile` を使って `backend/` の中身からビルドされます
- `docker push ...:latest` … `latest` タグを**上書き**します
- `aws ecs update-service --force-new-deployment` … ECSに「タスクを作り直せ」と指示します。タスク定義は `latest` タグを指しているので、新しいタスクが起動するときに**pushし直したイメージをpull**します。これが `latest` タグ運用のデプロイの仕組みです（イメージにバージョンタグを付けてタスク定義ごと更新する、より厳密な方式は発展課題とします）
- クラスタ名・サービス名は、CDKで固定した `sns-cluster` / `sns-api` です

### 動かしてみる

3つのブロックを連結した `deploy.yml` をコミットして、mainにpushします。

```bash
git add .github/workflows/deploy.yml backend/Dockerfile backend/docker-entrypoint.sh infra
git commit -m "Add production deployment (CDK + GitHub Actions)"
git push origin main
```

GitHubのActionsタブで実行の様子が見られます。

```
Deploy #1
✓ test             1m 12s
✓ deploy-frontend  58s
✓ deploy-backend   2m 41s
```

以後、フロントの文言を1行変えてpushするだけで、1〜2分後には本番のCloudFront URLに反映されます。試しに何か小さな変更をpushして、自動デプロイを体験してみてください。

## 後片付け

練習を終えたら、**必ず削除**します。消し忘れやすいものがあるので、順番に確認しながら進めてください。

### 1. スタックの削除

```bash
cd sns-app/infra
pnpm exec cdk destroy
```

```
Are you sure you want to delete: SnsAppStack (y/n)? y
SnsAppStack: destroying...
 ✅  SnsAppStack: destroyed
```

S3バケット2つは `autoDeleteObjects: true` を指定してあるので中身ごと消えます。RDSも `removalPolicy: DESTROY` なので（スナップショットを残さず）削除されます。CloudFrontとRDSの削除には数分〜十数分かかります。

### 2. スタック外のリソースの削除

ECRリポジトリはCLIで作ったため、CDKでは消えません。イメージが入ったままのリポジトリは `--force` を付けて削除します。

```bash
aws ecr delete-repository --repository-name sns-backend --force
```

また、ECSタスクのログ（CloudWatch Logsのロググループ）はスタック削除後も残ることがあります。保存量は小さく課金もわずかですが、CloudWatchのコンソールで `SnsAppStack` で始まるロググループを探して削除しておくと完全です。

### 3. 削除チェックリスト

マネジメントコンソールで以下を確認してください。**特に上の3つは時間課金**なので、消え残りがそのまま課金になります。

- [ ] RDS … インスタンスが残っていない（この構成で最も高額）
- [ ] EC2 → ロードバランサー … ALBが残っていない
- [ ] VPC → NATゲートウェイ … NAT Gatewayが残っていない（Elastic IPも一緒に解放されたか確認）
- [ ] ECS … クラスタとタスクが残っていない
- [ ] S3 … フロント用・アバター用バケットが残っていない
- [ ] CloudFront … ディストリビューションが残っていない
- [ ] ECR … `sns-backend` リポジトリを手動削除した
- [ ] CloudWatch Logs … ロググループを削除した
- [ ] Secrets Manager … シークレットが残っていない（スタックと一緒に削除されます）

> **料金に関する注意（最後にもう一度）**
>
> 削除した翌日以降に、AWSの請求ダッシュボードで**課金が止まったこと**を確認する習慣をつけてください。[AWSとは何か](/aws/what_is_aws/)で設定した予算アラートは、消し忘れに気づく最後の砦です。なお、GitHub Actionsのワークフローは残っていても害はありませんが、スタック削除後にpushするとデプロイジョブが失敗します。気になる場合はワークフローファイルを削除するか、`on:` を手動実行（`workflow_dispatch`）に変えておきましょう。

## 理解度チェック

**Q1. ALBのヘルスチェックパスを `/health` に変更しないと何が起きますか。**

<details markdown="1">
<summary>解答を見る</summary>

デフォルトのヘルスチェックは `GET /` を叩きますが、このAPIにルート `/` のエンドポイントはないため404が返り、ALBはタスクを「不健康」と判定します。ECSは不健康なタスクを停止して新しいタスクを起動するため、**タスクが起動と停止を永遠に繰り返し**、サービスがいつまでも安定しません。アプリ自体は正常でも起きる障害なので、Fargateデプロイの定番のつまずきポイントです。

</details>

**Q2. `DATABASE_URL` を丸ごと環境変数に書かず、パスワードだけ `secrets` で渡してコンテナ起動時にURLを組み立てたのはなぜですか。**

<details markdown="1">
<summary>解答を見る</summary>

ECSの `environment` に書いた値はタスク定義に**平文で保存され**、コンソールを見られる人全員に見えてしまいます。パスワードを含む `DATABASE_URL` を丸ごと書くのは危険です。一方、RDSが自動生成するシークレットはJSON（host/username/passwordなど）であり、`DATABASE_URL` という完成形のURLでは存在しません。そこで「秘密でない部品（ホスト名・DB名など）は `environment`、パスワードだけSecrets Manager経由の `secrets`」で渡し、起動スクリプトで合成する、という分担にしています。

</details>

**Q3. 起動時に `prisma migrate deploy` を実行する設計の利点と弱点を1つずつ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

利点は、デプロイとDBスキーマの更新が常にセットになり、「新しいコードに対して古いスキーマ」という事故が起きにくいシンプルさです。弱点は、(1) タスクを複数同時に起動するとマイグレーションが同時実行され得る、(2) マイグレーション失敗 = アプリ起動失敗になる、という点です。規模が大きくなったら「CI/CDの独立ステップとしてマイグレーションを流してからアプリを更新する」方式に移行するのが一般的です。

</details>

**Q4. `aws ecs update-service --force-new-deployment` を実行すると新しいコードが動き出すのはなぜですか。コマンド自体はイメージを指定していません。**

<details markdown="1">
<summary>解答を見る</summary>

タスク定義が `sns-backend:latest` という**可変のタグ**を指しているからです。CIが新しいイメージで `latest` タグを上書きpushしたあと、`--force-new-deployment` でタスクを作り直させると、新しいタスクは起動時にECRから `latest` をpullし直すため、結果として新しいコードが動きます。タグが同じでも中身（イメージ）が入れ替わっている、というのがポイントです。

</details>

**Q5. この構成で「消し忘れると課金が続く」リソースを3つ挙げてください。**

<details markdown="1">
<summary>解答を見る</summary>

代表は**RDSインスタンス**（起動時間に課金。この構成で最も高額）、**NAT Gateway**（起動時間 + 処理量に課金。存在を忘れやすい）、**ALB**（起動時間に課金）です。ECS Fargateのタスクも動いている間は秒課金されます。いずれも「使った量」ではなく「存在している時間」で課金される点が、S3やSESとの大きな違いです。

</details>

## セルフレビュー

- [ ] 本番アーキテクチャ図（利用者からの2つの入口、ECSからの3つの依存先）を何も見ずに描ける
- [ ] マルチステージDockerfileの3つのステージそれぞれの役割を説明できる
- [ ] 起動スクリプトで `DATABASE_URL` を組み立てる理由を「environmentとsecretsの違い」から説明できる
- [ ] ヘルスチェックパス・ALBアイドルタイムアウト・タスクロールの権限という3つのSNS固有設定を、それぞれ「ないと何が壊れるか」とセットで説明できる
- [ ] フロントの本番ビルドに `VITE_API_URL` を渡す2つの方法（`.env.production` とCIの環境変数）を使い分けられる
- [ ] GitHub Actionsのワークフローで `needs` がデプロイの安全をどう守っているか説明できる
- [ ] `cdk destroy` 後に手動で消すべきリソース（ECRリポジトリ等）を挙げられる
- [ ] 実際に `cdk destroy` まで実行し、請求ダッシュボードを確認した

## 次のステップ

アプリの開発からテスト、そして本番デプロイまで——ひとつのWebサービスを作る工程をすべて自分の手で通しました。前のページは[SNSのテストを書く](/sns/testing/)です。デプロイを経験した今なら、「pushの前にテストが守ってくれる」ことの意味がより実感できるはずです。

次の[総仕上げ（セルフレビューと追加課題）](/sns/wrap_up/)は、このカリキュラムの最終ページです。学んだ全体を振り返り、SNSをさらに育てるための追加課題と、ここから先の学び方を案内します。
