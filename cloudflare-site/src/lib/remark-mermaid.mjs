/**
 * Converts ```mermaid fenced code blocks into <pre class="mermaid"> nodes
 * so that mermaid.js (loaded in BaseLayout) can find and render them.
 *
 * Without this, Astro/Shiki highlights ```mermaid blocks as plain code
 * (<pre class="astro-code">), which mermaid.js never picks up — so the
 * diagrams show up as raw text instead of rendered flowcharts.
 *
 * Implemented as a small recursive walk so it needs no extra dependency.
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function transform(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child && child.type === 'code' && child.lang === 'mermaid') {
      node.children[i] = {
        type: 'html',
        value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`
      };
    } else {
      transform(child);
    }
  }
}

export function remarkMermaid() {
  return (tree) => {
    transform(tree);
  };
}

export default remarkMermaid;
