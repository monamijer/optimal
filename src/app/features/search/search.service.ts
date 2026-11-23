import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { marked } from 'marked';
import { CourseService } from '../courses/services/course.service';
import { AuthService } from '../../services/auth.service';
import { MarkdownService } from '../../core/services/markdown.service';

interface Entry {
  courseId: string;
  courseTitle: string;
  premium: boolean;
  chapterId: string;
  headingId: string;
  heading: string;
  text: string;
  /** Normalised heading + text, used for matching. */
  haystack: string;
  headingNorm: string;
}

export interface SnippetPart {
  text: string;
  hit: boolean;
}

export interface SearchResult {
  key: string;
  courseId: string;
  courseTitle: string;
  heading: string;
  headingId: string;
  /** Premium content is not shown to visitors who are not signed in. */
  locked: boolean;
  snippet: SnippetPart[];
}

export const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Full-text search over the course chapters, built in the browser on first use. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private courses = inject(CourseService);
  private auth = inject(AuthService);
  private markdown = inject(MarkdownService);

  readonly isOpen = signal(false);
  readonly indexing = signal(false);
  private entries: Entry[] = [];
  private building: Promise<void> | null = null;

  open(): void {
    this.isOpen.set(true);
    void this.ensureIndex();
  }

  close(): void {
    this.isOpen.set(false);
  }

  ensureIndex(): Promise<void> {
    this.building ??= this.build();
    return this.building;
  }

  search(query: string, limit = 20): SearchResult[] {
    const terms = normalize(query).split(/\s+/).filter(t => t.length > 1);
    if (!terms.length) return [];
    const loggedIn = this.auth.isLoggedIn();

    return this.entries
      .map(entry => ({ entry, score: this.score(entry, terms) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ entry }) => {
        const locked = entry.premium && !loggedIn;
        return {
          key: `${entry.courseId}/${entry.chapterId}#${entry.headingId}`,
          courseId: entry.courseId,
          courseTitle: entry.courseTitle,
          heading: entry.heading,
          headingId: entry.headingId,
          locked,
          snippet: locked ? [] : this.snippet(entry.text, terms),
        };
      });
  }

  private score(entry: Entry, terms: string[]): number {
    let score = 0;
    for (const term of terms) {
      if (!entry.haystack.includes(term)) return 0; // every word must match
      score += entry.headingNorm.includes(term) ? 5 : 1;
    }
    return score;
  }

  private snippet(text: string, terms: string[]): SnippetPart[] {
    const norm = normalize(text);
    // normalize() keeps string length for NFD-stripped Latin text, so indexes line up
    const at = terms.map(t => norm.indexOf(t)).filter(i => i >= 0);
    const first = at.length ? Math.min(...at) : 0;
    const start = Math.max(0, first - 40);
    const raw = text.slice(start, start + 160);
    const normRaw = norm.slice(start, start + 160);

    const ranges: [number, number][] = [];
    for (const term of terms) {
      let i = normRaw.indexOf(term);
      while (i >= 0) {
        ranges.push([i, i + term.length]);
        i = normRaw.indexOf(term, i + term.length);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);

    const parts: SnippetPart[] = [];
    let cursor = 0;
    for (const [from, to] of ranges) {
      if (from < cursor) continue;
      if (from > cursor) parts.push({ text: raw.slice(cursor, from), hit: false });
      parts.push({ text: raw.slice(from, to), hit: true });
      cursor = to;
    }
    if (cursor < raw.length) parts.push({ text: raw.slice(cursor), hit: false });
    if (start > 0) parts.unshift({ text: '… ', hit: false });
    return parts;
  }

  private async build(): Promise<void> {
    this.indexing.set(true);
    try {
      await this.courses.ready;
      const entries: Entry[] = [];
      await Promise.all(this.courses.courses().map(async course => {
        for (const file of course.chapters ?? []) {
          try {
            const md = await firstValueFrom(this.http.get(`courses/${course.id}/${file}`, { responseType: 'text' }));
            entries.push(...this.split(course.id, course.title, course.accessLevel === 'premium', file.replace('.md', ''), md));
          } catch {
            /* a missing chapter must not break the search */
          }
        }
      }));
      this.entries = entries;
    } finally {
      this.indexing.set(false);
    }
  }

  /** One entry per heading, holding the plain text that follows it. */
  private split(courseId: string, courseTitle: string, premium: boolean, chapterId: string, md: string): Entry[] {
    const out: Entry[] = [];
    let current: { heading: string; headingId: string; text: string[] } | null = null;
    const flush = () => {
      if (!current) return;
      const text = current.text.join(' ').replace(/\s+/g, ' ').trim();
      out.push({
        courseId, courseTitle, premium, chapterId,
        headingId: current.headingId, heading: current.heading, text,
        haystack: normalize(`${current.heading} ${text}`),
        headingNorm: normalize(current.heading),
      });
    };
    for (const token of marked.lexer(md)) {
      if (token.type === 'heading') {
        flush();
        const heading = (token as { text: string }).text;
        current = { heading, headingId: this.markdown.toSlug(heading), text: [] };
      } else if (token.type !== 'space' && current && !(token.type === 'code' && (token as { lang?: string }).lang === 'quiz')) {
        current.text.push(('text' in token && typeof token.text === 'string' ? token.text : token.raw) as string);
      }
    }
    flush();
    return out;
  }
}
