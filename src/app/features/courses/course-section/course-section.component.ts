import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';

@Component({
  selector: 'app-course-section',
  imports: [],
  templateUrl: './course-section.component.html',
  styleUrl: './course-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseSectionComponent {
    @Input({ required: true}) section!: CourseSection;

}
