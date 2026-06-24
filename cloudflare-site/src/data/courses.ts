export type CourseCard = {
  label: string;
  title: string;
  description: string;
  href?: string;
  accent: 'green' | 'blue' | 'amber' | 'ink' | 'purple';
  project?: boolean;
};

export type Phase = {
  id: string;
  number: string;
  title: string;
  summary: string;
  grid?: 'default' | 'wide' | 'featured';
  cards: CourseCard[];
  stacks?: string[];
};

export const phases: Phase[] = [
  {
    id: 'intro',
    number: '01',
    title: '入門',
    summary: '開発環境とWebの土台。',
    cards: [
      { label: 'Environment', title: '環境構築', description: 'まずMac/Windowsの開発環境を整え、VS Codeとターミナルを使える状態にする。', href: '/environment/', accent: 'green' },
      { label: 'HTML / CSS', title: 'HTML / CSS', description: 'HTML構造、CSSセレクタ、余白、Flexbox、レスポンシブ基礎。', href: '/frontend/html_css/', accent: 'green' },
      { label: 'JavaScript', title: 'JavaScript', description: '変数、条件分岐、関数、配列、DOM操作、イベント処理。', href: '/frontend/javascript/', accent: 'green' },
      { label: 'TypeScript', title: 'TypeScript基礎', description: '型、関数、オブジェクト、コンパイル、実践演習。', href: '/typescript/', accent: 'green' }
    ]
  },
  {
    id: 'frontend',
    number: '02',
    title: 'フロントエンド',
    summary: 'TypeScriptを使ってUIとAPI連携を作る。',
    cards: [
      { label: 'React', title: 'React基礎', description: 'コンポーネント、props、state、hooks。', href: '/react/', accent: 'blue' },
      { label: 'Frontend', title: 'フォームと一覧', description: 'フォーム入力、リスト表示、状態更新、画面分割。React基礎の中で学ぶ。', href: '/react/', accent: 'blue' },
      { label: 'API', title: 'API通信', description: 'fetch、エラーハンドリング、ローディング、再取得。React基礎の中で学ぶ。', href: '/react/', accent: 'blue' }
    ]
  },
  {
    id: 'languages',
    number: '03',
    title: 'バックエンド言語基礎',
    summary: 'フレームワークに入る前に、言語そのものを押さえる。',
    cards: [
      { label: 'TypeScript', title: 'TypeScript基礎', description: '型、class、module、async/await、DTOの前提。', href: '/typescript/', accent: 'amber' },
      { label: 'Java', title: 'Java基礎', description: '型、class、interface、collection、例外処理。', accent: 'amber' },
      { label: 'Python', title: 'Python基礎', description: '関数、型ヒント、class、venv、非同期処理。', accent: 'amber' },
      { label: 'PHP', title: 'PHP基礎', description: '型、配列、関数、class、Composer、Laravelの前提。', accent: 'amber' },
      { label: 'Go', title: 'Go基礎', description: '型、struct、interface、goroutine、module管理。', accent: 'amber' },
      { label: 'Ruby', title: 'Ruby基礎', description: 'オブジェクト、block、module、Bundler、Railsの前提。', accent: 'amber' }
    ]
  },
  {
    id: 'database',
    number: '04',
    title: 'データベースとローカル開発',
    summary: 'API実装の前に、RDB、SQL、PostgreSQL、Docker Composeの土台を押さえる。',
    grid: 'wide',
    cards: [
      { label: 'RDB / SQL', title: 'データベースの考え方', description: 'テーブル、行、列、主キー、外部キー、リレーションの基本。', href: '/database/what_is_database/', accent: 'ink' },
      { label: 'PostgreSQL', title: 'PostgreSQLを触る', description: 'DockerでPostgreSQLを起動し、psqlでSQLとJOINを練習する。', href: '/database/postgresql_setup/', accent: 'ink' },
      { label: 'Docker', title: 'Docker基礎', description: 'コンテナ、イメージ、ポート、ボリューム、開発環境の再現。', href: '/docker/', accent: 'ink' },
      { label: 'Compose', title: 'ローカルDB環境', description: 'docker-composeでPostgreSQLを立て、API開発で使うDBを準備する。', href: '/docker/dev_environment/', accent: 'ink' }
    ]
  },
  {
    id: 'frameworks',
    number: '05',
    title: 'フレームワーク実践',
    summary: '言語別にAPI、ORM、Migration、軽いテストまで実装する。',
    grid: 'wide',
    cards: [
      { label: 'NestJS', title: 'NestJS + Prisma', description: 'NestJS APIにPrismaを接続し、Migration、CRUD、Jestまで実装。', href: '/database/prisma_setup/', accent: 'ink' },
      { label: 'Spring', title: 'Spring Boot + JPA', description: 'Spring MVC、JPA/Hibernate、Flyway、JUnit。', accent: 'ink' },
      { label: 'FastAPI', title: 'FastAPI + SQLAlchemy', description: 'API、Pydantic、SQLAlchemy、Alembic、pytest。', accent: 'ink' },
      { label: 'Laravel', title: 'Laravel + Eloquent', description: 'MVC、Eloquent、Laravel Migrations、Pest/PHPUnit。', accent: 'ink' },
      { label: 'Go', title: 'Gin + sqlc / GORM', description: 'REST API、DB接続、Migration、testing。', accent: 'ink' },
      { label: 'Rails', title: 'Rails + Active Record', description: 'Rails API、Active Record、Migration、RSpec。', accent: 'ink' }
    ]
  },
  {
    id: 'projects',
    number: '06',
    title: '実践開発',
    summary: '共通の課題を、複数の言語スタックで実装する。',
    grid: 'featured',
    cards: [
      { label: 'Todo Project', title: 'Todoアプリ実践', description: 'Reactフロント、API、DB、Docker、テストを言語別に実装。', href: '/fullstack-todo/', accent: 'green', project: true },
      { label: 'SNS Project', title: 'SNS開発実践', description: '認証、投稿、いいね、フォロー、DM、Redis、画像、AWSデプロイ。', href: '/sns/', accent: 'green', project: true }
    ],
    stacks: ['TypeScript / NestJS', 'Java / Spring Boot', 'Python / FastAPI', 'PHP / Laravel', 'Go / Gin', 'Ruby / Rails']
  },
  {
    id: 'ops-ai',
    number: '07',
    title: '運用とAI',
    summary: 'デプロイ、リアルタイム通信、AI開発、設計へ進む。',
    grid: 'wide',
    cards: [
      { label: 'Deploy', title: 'CI/CD / AWS', description: 'GitHub Actions、ECS、RDS、S3、CloudFront、SES。', href: '/cicd/', accent: 'purple' },
      { label: 'Realtime', title: 'リアルタイム通信', description: 'WebSocket、Socket.IO、Redis pub/sub、Gateway設計。', href: '/realtime/', accent: 'purple' },
      { label: 'AI', title: 'AI開発', description: 'Claude、Codex、CLAUDE.md、skills、AIペアプロ。', href: '/ai/', accent: 'purple' },
      { label: 'RAG', title: 'RAGチャット', description: 'Embeddings、pgvector、教材検索、AI回答生成。', href: '/ai-chat/', accent: 'purple' },
      { label: 'Architecture', title: 'アーキテクチャ基礎', description: '責務分離、設計判断、保守しやすい構成。', accent: 'purple' }
    ]
  }
];
