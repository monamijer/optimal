import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { CourseService } from '../../features/courses/services/course.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  layout = inject(LayoutService);
  private courseService = inject(CourseService)

  close(){
    this.layout.closeSidebar();
  }
  courses = this.courseService.getAllCourses();
  @HostListener('document:keydown.escape')
  onEscape(){
    this.layout.closeSidebar();
  }
}
