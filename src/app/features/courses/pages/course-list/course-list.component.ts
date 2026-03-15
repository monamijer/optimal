import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { CourseSectionService } from '../../services/course-section.service';

@Component({
  selector: 'app-course-list',
  imports: [CourseSectionComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  sections = signal([
    {
      id: 'algorithms', title: 'Section 1',  content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque.'
    },
    {
    id: 'base_de_donnees', title: 'Section 2',  content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, doloremque.'
     }
  ])
}
