import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, signal } from '@angular/core';
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
export class CourseSectionComponent implements AfterViewInit {
    private markdown = inject(MarkdownService);
    private el = inject(ElementRef);

    section = input.required<CourseSection>();

    html = computed(()=>
        this.markdown.parse(this.section().content)
    );
    ngAfterViewInit(){
        setTimeout(()=>{
            this.el.nativeElement.querySelector('.doc-section')?.classList.add('visible');
        }, 50);
    }
}
