import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { CourseService } from '../../features/courses/services/course.service';
import { title } from 'process';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  layout = inject(LayoutService);
  courses = [
    { id: 'algorithmes', title: 'algorithmes et structures des donnees', icon: 'bi-robot'},
    { id: 'reseaux', title: 'Reseau et Securite', icon: 'bi-apple'},
    { id: 'base_de_donnees', title: 'Base de donnees d\'avancee a pro', icon: 'bi-database-fill'}
  ]
  close(){
    this.layout.closeSidebar();
  }
//  courses = this.courseService.getAllCourses();
  @HostListener('document:keydown.escape')
  onEscape(){
    this.layout.closeSidebar();
  }
}
