import { Injectable } from '@angular/core';
import { marked } from "marked";
import DOMPurify from "dompurify"

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
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
    marked.use({ renderer });
  }
  private toSlug(text: string): string{
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
