import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../courses/services/course.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private courseService = inject(CourseService);

  courses = this.courseService.getAllCourses();
  freeCourses = this.courses.filter(c => c.accessLevel === 'free').length;
  premCourses = this.courses.filter(c => c.accessLevel === 'premium').length;

  displayText = '';
  private fullText = 'Apprendre. Pratique. Maitriser.';
  private idx = 0;
  private interval: any;

  ngOnInit(): void {
    this.interval = setInterval(()=>{
      if(this.idx < this.fullText.length){
        this.displayText += this.fullText[this.idx++];
      }else{
        clearInterval(this.interval);
      }
    }, 60)
  }
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
