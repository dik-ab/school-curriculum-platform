import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';

export default defineConfig({
  integrations: [mdx()],
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});

