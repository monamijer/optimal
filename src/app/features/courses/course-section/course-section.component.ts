import { ChangeDetectionStrategy, Component, computed, inject, Input, signal } from '@angular/core';
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
    @Input({ required: true}) section!: CourseSection;

    html = computed(()=>
        this.markdown.parse(this.section.content)
    );
}
