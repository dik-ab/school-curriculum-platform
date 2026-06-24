import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceRoot = '/Users/daiki/sns/curriculum';
const targetRoot = new URL('..', import.meta.url).pathname;
const docsRoot = join(targetRoot, 'src/content/docs');
const practiceRoot = join(targetRoot, 'public/practice');
const oldGitHubPagesBase = 'https://dik-ab.github.io/curriculum/';

const excludedDocPrefixes = ['.authoring/', 'practice/'];

function runGit(args) {
  return execFileSync('git', args, { cwd: sourceRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function stripLiquidRaw(markdown) {
  return markdown
    .replaceAll('{% raw %}', '')
    .replaceAll('{% endraw %}', '');
}

function stripUnsupportedFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return markdown;
  const end = markdown.indexOf('\n---', 4);
  if (end === -1) return markdown;
  const frontmatter = markdown
    .slice(4, end)
    .split('\n')
    .filter((line) => !/^layout:\s*/.test(line))
    .join('\n');
  return `---\n${frontmatter}\n---${markdown.slice(end + 4)}`;
}

function normalizeTargetPath(fromFile, href) {
  if (href.startsWith(oldGitHubPagesBase)) {
    return normalizeOldGitHubPagesUrl(href);
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('#') ||
    href.startsWith('/') ||
    href.startsWith('app://')
  ) {
    return href;
  }

  const [pathPart, hashPart = ''] = href.split('#');
  const hash = hashPart ? `#${hashPart}` : '';
  if (!pathPart || pathPart.startsWith('?')) {
    return href;
  }

  const fromDir = posix.dirname(fromFile.replace(/\\/g, '/'));
  const resolved = posix.normalize(posix.join(fromDir === '.' ? '' : fromDir, pathPart));
  const withoutHtml = resolved.replace(/\.html$/, '').replace(/\/index$/, '');
  return withoutHtml === '.' ? `/${hash}` : `/${withoutHtml.replace(/^\.\//, '')}/${hash}`;
}

function normalizeOldGitHubPagesUrl(href) {
  const [pathPart, hashPart = ''] = href.slice(oldGitHubPagesBase.length).split('#');
  const hash = hashPart ? `#${hashPart}` : '';
  if (!pathPart) return `/${hash}`;
  if (pathPart.endsWith('.html')) {
    return `/${pathPart.replace(/\.html$/, '')}/${hash}`;
  }
  return pathPart.endsWith('/') ? `/${pathPart}${hash}` : `/${pathPart}/${hash}`;
}

function rewriteLinks(markdown, fromFile) {
  let next = markdown.replace(/\]\(([^)\s]+(?:#[^)]+)?)\)/g, (match, href) => {
    return `](${normalizeTargetPath(fromFile, href)})`;
  });

  next = next.replace(/href="([^"]+(?:#[^"]+)?)"/g, (match, href) => {
    return `href="${normalizeTargetPath(fromFile, href)}"`;
  });

  next = next.replace(/https:\/\/dik-ab\.github\.io\/curriculum\/([^\s)"']*)/g, (match) => {
    return normalizeOldGitHubPagesUrl(match);
  });

  return next;
}

function migrateDocs() {
  rmSync(docsRoot, { recursive: true, force: true });
  ensureDir(docsRoot);

  const markdownFiles = runGit(['ls-files', '*.md'])
    .filter((file) => !excludedDocPrefixes.some((prefix) => file.startsWith(prefix)));

  for (const file of markdownFiles) {
    const source = join(sourceRoot, file);
    const target = join(docsRoot, file);
    ensureDir(dirname(target));
    const original = readFileSync(source, 'utf8');
    const migrated = rewriteLinks(stripUnsupportedFrontmatter(stripLiquidRaw(original)), file);
    writeFileSync(target, migrated);
  }

  return markdownFiles;
}

function migratePractice() {
  rmSync(practiceRoot, { recursive: true, force: true });
  ensureDir(practiceRoot);

  const practiceFiles = runGit(['ls-files', 'practice/**']);
  for (const file of practiceFiles) {
    const source = join(sourceRoot, file);
    const target = join(targetRoot, 'public', file);
    ensureDir(dirname(target));
    if (file.endsWith('.md')) {
      const original = readFileSync(source, 'utf8');
      writeFileSync(target, rewriteLinks(original, file));
    } else {
      cpSync(source, target);
    }
  }
  return practiceFiles;
}

const docs = migrateDocs();
const practice = migratePractice();

const report = [
  `docs=${docs.length}`,
  `practice=${practice.length}`,
  `target=${relative(process.cwd(), targetRoot) || targetRoot}`
].join('\n');

writeFileSync(join(targetRoot, 'migration-report.txt'), `${report}\n`);
console.log(report);
