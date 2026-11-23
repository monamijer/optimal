import { clearHighlights, headingBefore, wrapQuote } from './highlight-dom';

describe('highlight-dom', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('section');
    root.id = 'chap';
    root.innerHTML = '<h2 id="t1">Titre</h2><p>Un <strong>tableau</strong> stocke des éléments.</p><h2 id="t2">Suite</h2><p>Fin.</p>';
    document.body.appendChild(root);
  });
  afterEach(() => root.remove());

  it('wraps a passage that spans inline elements, then restores the text', () => {
    const before = root.textContent;
    expect(wrapQuote(root, 'Un tableau stocke', 'h1', '')).toBeTrue();
    const marks = root.querySelectorAll('mark[data-hl="h1"]');
    expect(marks.length).toBe(3);
    expect(Array.from(marks).map(m => m.textContent).join('')).toBe('Un tableau stocke');
    clearHighlights(root);
    expect(root.querySelectorAll('mark').length).toBe(0);
    expect(root.textContent).toBe(before);
  });

  it('returns false when the passage no longer exists', () => {
    expect(wrapQuote(root, 'introuvable', 'x', '')).toBeFalse();
  });

  it('does not interpret the quote as HTML', () => {
    root.querySelector('p')!.textContent = 'a <img src=x onerror=alert(1)> b';
    expect(wrapQuote(root, '<img src=x onerror=alert(1)>', 'x', '')).toBeTrue();
    expect(root.querySelector('img')).toBeNull();
  });

  it('finds the heading before a node', () => {
    const p = root.querySelectorAll('p')[1].firstChild!;
    expect(headingBefore(root, p)).toBe('t2');
    expect(headingBefore(root, root.querySelector('strong')!.firstChild!)).toBe('t1');
  });
});
