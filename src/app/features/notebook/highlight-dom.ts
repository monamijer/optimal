/** DOM helpers to draw saved highlights over the rendered (already sanitised) course text. */

const ATTR = 'data-hl';

/** Removes every highlight mark under root, restoring the original text nodes. */
export function clearHighlights(root: ParentNode): void {
  root.querySelectorAll(`mark[${ATTR}]`).forEach(mark => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

/** Wraps the first occurrence of `quote` inside `root` with <mark data-hl="id">. Returns false if not found. */
export function wrapQuote(root: HTMLElement, quote: string, id: string, note: string): boolean {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; start: number }[] = [];
  let text = '';
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push({ node: n as Text, start: text.length });
    text += (n as Text).data;
  }
  const from = text.indexOf(quote);
  if (from < 0) return false;
  const to = from + quote.length;

  for (const { node, start } of nodes) {
    const end = start + node.data.length;
    if (end <= from || start >= to) continue;
    let target = node;
    const localFrom = Math.max(from, start) - start;
    const localTo = Math.min(to, end) - start;
    if (localFrom > 0) target = target.splitText(localFrom);
    if (localTo - localFrom < target.data.length) target.splitText(localTo - localFrom);
    const mark = document.createElement('mark');
    mark.className = 'hl';
    mark.setAttribute(ATTR, id);
    mark.tabIndex = 0;
    mark.setAttribute('role', 'button');
    mark.setAttribute('aria-label', note ? `Surlignage avec note : ${note}` : 'Surlignage. Modifier ou supprimer');
    if (note) mark.classList.add('has-note');
    target.parentNode?.insertBefore(mark, target);
    mark.appendChild(target);
  }
  return true;
}

/** Nearest heading id before the given node, inside the chapter element. */
export function headingBefore(chapter: HTMLElement, node: Node): string {
  let found = '';
  chapter.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6').forEach(h => {
    if (h.id && (h.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING || h.contains(node))) found = h.id;
  });
  return found || chapter.id;
}
