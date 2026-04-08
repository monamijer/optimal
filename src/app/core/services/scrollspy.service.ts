import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollspyService {
    activeId = signal<string | null>(null);
    private observer : IntersectionObserver | null = null;

    reset(): void {
    this.observer?.disconnect();
    this.activeId.set(null);
  }

    observe(ids: string[]){
      this.observer?.disconnect();
      this.activeId.set(null);

      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if(entry.isIntersecting){
              this.activeId.set(entry.target.id);
              // entry.target.classList.add('visible');
            }
          });
        },
        {
          rootMargin: '-30px 0px -60px 0px'
        });
        setTimeout(()=>{
          ids.forEach(id => {
          const el = document.getElementById(id);
          if(el) this.observer! .observe(el);

});
        }, 300);
    }};
