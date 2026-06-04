/**
 * Remark plugin that converts ```mermaid fenced code blocks into a
 * <pre class="mermaid"> HTML node so mermaid.js can find and render them
 * client-side. Bypassing Shiki avoids the syntax-highlighter wrapping each
 * token in <span>s, which would leave non-source whitespace in textContent.
 */
export default function remarkMermaid() {
  return (tree) => visit(tree);

  function visit(node) {
    if (!node || !Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === "code" && child.lang === "mermaid") {
        node.children[i] = {
          type: "html",
          value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
        };
      } else {
        visit(child);
      }
    }
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
