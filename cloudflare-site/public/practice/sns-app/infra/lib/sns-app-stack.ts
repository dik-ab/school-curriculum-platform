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

    // ---- フロントエンド配信（S3 + CloudFront） ----
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(
      this,
      'FrontendDistribution',
      {
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
      },
    );

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

    const api = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'SnsApi',
      {
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
      },
    );

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

    // ---- デプロイ後に使う値の出力 ----
    new cdk.CfnOutput(this, 'SiteUrl', { value: frontendUrl });
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `http://${api.loadBalancer.loadBalancerDnsName}`,
    });
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });
  }
}
