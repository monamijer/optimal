import { Component, inject, signal } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';

declare var bootstrap: any;
@Component({
  selector: 'app-course-detail',
  imports: [],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);

  sections = signal<any[]>([]);

  constructor(){
    const id = this.route.snapshot.paramMap.get('id');

    if(id){
      const course = this.courseService.getCourseById(id);

      if(course){
        const sections = this.courseService.getSectionsByKey(course.title);
        this.sections.set(sections);
      }
    }
  }
  ngAfterViewInit(): void {
      const scrollSpy = new bootstrap.ScrollSpy(document.body, {
        target: "#course-nav"
      });
  }
}

