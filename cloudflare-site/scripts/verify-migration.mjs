import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceRoot = '/Users/daiki/sns/curriculum';
const targetRoot = new URL('..', import.meta.url).pathname;
const docsRoot = join(targetRoot, 'src/content/docs');

function gitFiles(args) {
  return execFileSync('git', args, { cwd: sourceRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueSorted(items) {
  return [...new Set(items)].sort();
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function countPattern(files, root, pattern) {
  let count = 0;
  for (const file of files) {
    const text = read(join(root, file));
    count += (text.match(pattern) || []).length;
  }
  return count;
}

const docFiles = uniqueSorted([
  ...gitFiles(['ls-files', '*.md']),
  ...gitFiles(['ls-files', '--others', '--exclude-standard', '*.md'])
]).filter(
  (file) => !file.startsWith('.authoring/') && !file.startsWith('practice/')
);
const practiceFiles = gitFiles(['ls-files', 'practice/**']);
const missingDocs = docFiles.filter((file) => !existsSync(join(docsRoot, file)));
const missingPractice = practiceFiles.filter((file) => !existsSync(join(targetRoot, 'public', file)));

const sourceMetrics = {
  markdown: docFiles.length,
  codeFences: countPattern(docFiles, sourceRoot, /^```/gm) / 2,
  mermaid: countPattern(docFiles, sourceRoot, /^```mermaid/gm),
  details: countPattern(docFiles, sourceRoot, /<details/g),
  summaries: countPattern(docFiles, sourceRoot, /<summary/g),
  checkboxes: countPattern(docFiles, sourceRoot, /^- \[[ xX]\]/gm),
  practice: practiceFiles.length
};

const targetMetrics = {
  markdown: docFiles.length - missingDocs.length,
  codeFences: countPattern(docFiles.filter((file) => !missingDocs.includes(file)), docsRoot, /^```/gm) / 2,
  mermaid: countPattern(docFiles.filter((file) => !missingDocs.includes(file)), docsRoot, /^```mermaid/gm),
  details: countPattern(docFiles.filter((file) => !missingDocs.includes(file)), docsRoot, /<details/g),
  summaries: countPattern(docFiles.filter((file) => !missingDocs.includes(file)), docsRoot, /<summary/g),
  checkboxes: countPattern(docFiles.filter((file) => !missingDocs.includes(file)), docsRoot, /^- \[[ xX]\]/gm),
  practice: practiceFiles.length - missingPractice.length
};

const report = {
  sourceMetrics,
  targetMetrics,
  missingDocs,
  missingPractice
};

writeFileSync(join(targetRoot, 'migration-verify.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

if (missingDocs.length || missingPractice.length) {
  process.exitCode = 1;
}
