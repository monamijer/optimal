import { Injectable, inject } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';
import { marked } from "marked";
import DOMPurify from "dompurify"
import { renderQuiz } from "./quiz-markdown";

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private i18n = inject(I18nService);

  constructor(){
    marked.setOptions({
      async: false
    });
    const renderer = new marked.Renderer();

    renderer.heading = (heading)=>{
      const text = heading.tokens
        .filter((t: any)=> t.type === 'text')
        .map((t:any)=> t.text)
        .join('');
      const id = this.toSlug(text);
      return `<h${heading.depth} id="${id}">${text}</h${heading.depth}>`;

    };
    // Fenced block "quiz" becomes an interactive question; any other block is rendered as usual
    const defaultCode = renderer.code.bind(renderer);
    renderer.code = (code) =>
      (code.lang === 'quiz' ? renderQuiz(code.text, k => this.i18n.t(k)) : null) ??
      // Long lines scroll sideways: the block must be reachable with the keyboard
      defaultCode(code).replace(/^<pre/, '<pre tabindex="0"');
    marked.use({ renderer });
  }
  toSlug(text: string): string{
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
    parse(content: string): string{
      const raw = marked.parse(content) as string;
      return DOMPurify.sanitize(raw, {
        ADD_ATTR: ['id']
      });
    }
    getHeadings(content: string){
      const tokens = marked.lexer(content);
      return tokens
        .filter(t=>t.type==='heading')
        .map((t: any)=>({
          id: this.toSlug(t.text),
          text: t.text,
          level: t.depth
        }));
    }
}
