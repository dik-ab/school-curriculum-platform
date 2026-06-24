# School Curriculum Cloudflare Site

Cloudflare Pagesで配信するAstro版の教材サイトです。

## Local Development

```bash
pnpm install
pnpm run migrate
pnpm run dev
```

## Build

```bash
pnpm run migrate
pnpm run verify:migration
pnpm run build
```

## Cloudflare Pages

```text
Root directory: cloudflare-site
Build command: pnpm install && pnpm run migrate && pnpm run build
Output directory: dist
```

## Migration Policy

- 既存Markdown本文は `src/content/docs/` に移行する
- コードブロック、Mermaid、details、チェックリストを落とさない
- `practice/` はGit追跡ファイルのみ `public/practice/` にコピーする
- `.env`、`node_modules`、`dist` などのローカル生成物は公開しない
