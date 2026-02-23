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
  }
    parse(content: string): string{
      const raw = marked.parse(content) as string;
      return DOMPurify.sanitize(raw);
    }
    getHeadings(content: string){
      const tokens = marked.lexer(content);
      return tokens
        .filter(t=>t.type==='heading')
        .map((t: any)=>({
          id: t.text.toLowerCase().replace(/\s+/g, '-'),
          text: t.text,
          level: t.depth
        }));
    }
}
