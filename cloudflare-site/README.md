# School Curriculum Cloudflare Site

Cloudflare Pagesで配信するAstro版の教材サイトです。

## Local Development

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Cloudflare Pages

```text
Root directory: cloudflare-site
Build command: pnpm run build
Output directory: dist
```

## Migration Policy

- Cloudflare Pagesでは、コミット済みの `src/content/docs/` と `public/practice/` からHTMLを生成する
- 既存Markdown本文は `src/content/docs/` に移行する
- コードブロック、Mermaid、details、チェックリストを落とさない
- 元教材を再同期する場合だけ、ローカルで `pnpm run migrate` と `pnpm run verify:migration` を実行する
- `practice/` はGit追跡ファイルのみ `public/practice/` にコピー済み
- `.env`、`node_modules`、`dist` などのローカル生成物は公開しない
