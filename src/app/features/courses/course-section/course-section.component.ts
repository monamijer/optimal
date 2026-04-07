import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { CourseSectionService } from '../services/course-section.service';

@Component({
  selector: 'app-course-section',
  imports: [],
  templateUrl: './course-section.component.html',
  styleUrl: './course-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseSectionComponent {
    private markdown = inject(MarkdownService);
    section = input.required<CourseSection>();

    html = computed(()=>
        this.markdown.parse(this.section().content)
    );
}
