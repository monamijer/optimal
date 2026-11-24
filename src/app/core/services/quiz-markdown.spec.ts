import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';
import { parseQuiz } from './quiz-markdown';

const QUIZ = '```quiz\nQuelle est la complexité de `indexOf` ?\n- [ ] O(1)\n- [x] O(n)\n- [ ] O(log n)\n> Il faut parcourir le tableau.\n```';

describe('quiz markdown', () => {
  it('parses question, options, correct answers and explanation', () => {
    const q = parseQuiz('Q ?\n- [ ] a\n- [x] b\n> parce que')!;
    expect(q.question).toBe('Q ?');
    expect(q.options.map(o => o.correct)).toEqual([false, true]);
    expect(q.explanation).toBe('parce que');
  });

  it('rejects invalid quizzes (no answer, one option, text after options)', () => {
    expect(parseQuiz('Q ?\n- [ ] a\n- [ ] b')).toBeNull();
    expect(parseQuiz('Q ?\n- [x] a')).toBeNull();
    expect(parseQuiz('Q ?\n- [x] a\n- [ ] b\nencore du texte')).toBeNull();
    expect(parseQuiz('- [x] a\n- [ ] b')).toBeNull();
  });

  describe('in MarkdownService', () => {
    let md: MarkdownService;
    beforeEach(() => (md = TestBed.inject(MarkdownService)));

    it('renders an interactive form that survives DOMPurify', () => {
      const root = document.createElement('div');
      root.innerHTML = md.parse(QUIZ);
      expect(root.querySelector('form.quiz')).not.toBeNull();
      expect(root.querySelectorAll('input[type=radio]').length).toBe(3);
      expect(root.querySelectorAll('input[data-correct]').length).toBe(1);
      expect(root.querySelector('legend code')?.textContent).toBe('indexOf');
      expect(root.querySelector('.quiz-explain')?.hasAttribute('hidden')).toBeTrue();
      expect(root.querySelector('button.quiz-check')).not.toBeNull();
    });

    it('uses checkboxes when several answers are right', () => {
      const root = document.createElement('div');
      root.innerHTML = md.parse('```quiz\nQ ?\n- [x] a\n- [x] b\n- [ ] c\n```');
      expect(root.querySelectorAll('input[type=checkbox]').length).toBe(3);
    });

    it('does not let a quiz inject script or handlers', () => {
      const root = document.createElement('div');
      root.innerHTML = md.parse('```quiz\n<img src=x onerror=alert(1)> ?\n- [x] <script>alert(1)</script>\n- [ ] b\n```');
      expect(root.querySelector('script')).toBeNull();
      expect(root.querySelector('[onerror]')).toBeNull(); // the text may appear escaped inside an attribute, never as a handler
    });

    it('leaves other code blocks and invalid quizzes as code', () => {
      const root = document.createElement('div');
      root.innerHTML = md.parse('```c\nint x;\n```\n\n```quiz\nsans réponse\n```');
      expect(root.querySelectorAll('pre code').length).toBe(2);
      expect(root.querySelector('form')).toBeNull();
    });
  });
});
