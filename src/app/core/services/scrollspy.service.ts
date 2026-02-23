import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollspyService {
    activeId = signal<string | null>(null);

    observe(ids: string[]){
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if(entry.isIntersecting){
              this.activeId.set(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-30px 0px -60px 0px'
        });
        ids.forEach(id => {
          const el = document.querySelector(`#${id}`);
          if(el) observer.observe(el);
        });

    }
}
