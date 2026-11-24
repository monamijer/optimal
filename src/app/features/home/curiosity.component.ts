import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarkdownService } from '../../core/services/markdown.service';

/** One question to make the reader curious, answered by a real chapter of the course. */
@Component({
  selector: 'app-curiosity',
  imports: [RouterLink],
  templateUrl: './curiosity.component.html',
  styleUrl: './curiosity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CuriosityComponent {
  readonly options = [
    { value: 20, label: '20' },
    { value: 1000, label: '1 000' },
    { value: 500000, label: '500 000' },
    { value: 1000000, label: '1 000 000' },
  ];
  readonly answer = 20;
  /** Heading of the Algorithms course that covers the idea. */
  readonly fragment = inject(MarkdownService).toSlug('Time complexity');

  picked = signal<number | null>(null);
}
