import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-course-section',
  imports: [],
  templateUrl: './course-section.component.html',
  styleUrl: './course-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseSectionComponent {
  private markdown = inject(MarkdownService);
  private sanitizer = inject(DomSanitizer);

  section = input.required<CourseSection>();

  // ✅ bypass Angular sanitizer — DOMPurify a déjà nettoyé le contenu
  html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.markdown.parse(this.section().content)
    )
  );
}