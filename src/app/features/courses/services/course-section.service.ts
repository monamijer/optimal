import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CourseSection } from '../models/courseSection.model';

@Injectable({
  providedIn: 'root'
})
export class CourseSectionService {
  private http = inject(HttpClient);
  loadCourse(courseId: string): Observable<CourseSection[]>{
    return this.http
      .get(`cours/${courseId}.md`, { responseType: 'text'})
      .pipe(
        map(markdown => this.parseSections(markdown))
      );
  }
  private parseSections(markdown: string): CourseSection[]{
    const sections = markdown.split('\n##');
    return sections.map((section, index)=>{
      const lines = section.split('\n');
      const title = lines[0];

      const content = lines.slice(1).join('\n');
      return{
        id: title
          .toLowerCase()
          .replace(/\s+/g, '-'),

          title: title.trim(),
          content
      };
    });
  }
}
