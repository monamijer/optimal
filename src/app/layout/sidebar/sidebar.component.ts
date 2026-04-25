import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { CourseService } from '../../features/courses/services/course.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  layout  = inject(LayoutService);
  auth    = inject(AuthService);

  private courseService = inject(CourseService);
  courses = this.courseService.getAllCourses();
  close(){
    this.layout.closeSidebar();
  }
  logout(): void{
    this.auth.logout();
    this.close();
  }
  
  @HostListener('document:keydown.escape')
  onEscape(){
    this.layout.closeSidebar();
  }
}
