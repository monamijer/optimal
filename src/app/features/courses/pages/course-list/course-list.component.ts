import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';

@Component({
  selector: 'app-course-list',
  imports: [CourseSectionComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  sections = signal([
    {
      id: '1', title: 'Section 1',  content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque.'
    },
    {
      id: '2', title: 'Section 2',  content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque.'
    }
  ])
}
