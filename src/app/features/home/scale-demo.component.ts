import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { halvingSteps, linearSteps, sizeFor } from './scale-steps';

/**
 * The home page's one big idea: drag the size of a directory and watch the
 * number of steps to find a name by reading (n) versus by halving (about log2 n).
 */
@Component({
  selector: 'app-scale-demo',
  templateUrl: './scale-demo.component.html',
  styleUrl: './scale-demo.component.css',
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleDemoComponent implements OnInit {
  private i18n = inject(I18nService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Slider position: size = 10^exp. */
  exp = signal(6);
  touched = signal(false);

  size = computed(() => sizeFor(this.exp()));
  sizeText = computed(() => this.i18n.num(this.size()));
  reading = computed(() => linearSteps(this.size()));
  halving = computed(() => halvingSteps(this.size()));
  readingText = computed(() => this.i18n.num(this.reading()));
  /** Width of the halving bar relative to the reading bar, never invisible. */
  ratio = computed(() => this.halving() / this.reading());
  barWidth = computed(() => `max(${(this.ratio() * 100).toFixed(4)}%, 6px)`);
  /** The gap is worth a handwritten comment once it is striking. */
  striking = computed(() => this.ratio() < 0.01);
  summary = computed(() => this.i18n.t('demo.summary', { size: this.sizeText(), reading: this.readingText(), halving: this.halving() }));

  private frame = 0;

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // One orchestrated moment: the directory grows from 10 to 1,000,000 names.
    const from = 1, to = 6, duration = 2400;
    let start = 0;
    this.exp.set(from);
    const tick = (now: number) => {
      if (this.touched()) return;
      start ||= now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.exp.set(from + (to - from) * eased);
      if (t < 1) this.frame = requestAnimationFrame(tick);
      else this.exp.set(to);
    };
    this.frame = requestAnimationFrame(tick);
  }

  onInput(event: Event): void {
    this.touched.set(true);
    cancelAnimationFrame(this.frame);
    this.exp.set(Number((event.target as HTMLInputElement).value));
  }
}
