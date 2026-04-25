import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();
  private readonly API_URL = 'http://localhost:8080/api/courses';

  private readonly courseList: Course[]=[
    {
      id: 'algorithms',
      title: 'Algorithms and data structures',
      icon: 'bi-code-slash',
      accessLevel: 'free',
      description: 'Comprenez les structures de donnees et les algorithmes fondamenteaux de l\'informatique.',
      tags: ['Debutant', 'Logique', 'C Programming Language']
    },
    {
      id: 'base_de_donnees',
      title: 'Base de donnees avancees',
      icon: 'bi-database-fill',
      accessLevel: 'premium',
      description: 'Maitrise SQL, la modelisation relationnelle et l\'optimisation des requetes.',
      tags: ['SQL', 'PostgreSQL', 'Intermediare']

    },
    {
      id: 'reseaux',
      title: 'Reseaux Informatiques',
      icon: 'bi-hdd-network-fill',
      accessLevel: 'premium',
      description: 'Protocoles TCP/IP, routage, securite reseau et administration systeme.',
      tags: ['TCP/IP', 'CISCO', 'Avance']

    },
    {
      id: 'securite_informatique',
      title: 'Securite informatiques',
      icon: 'bi-shield-lock-fill',
      accessLevel: 'premium',
      description: 'MCryptographie, pentest, defense des systemes et forensics numeriques.',
      tags: ['Pentest', 'Crypto', 'Linux', 'Avance']

    },
  ]

  getAllCourses(): Course[] {

    this.http.get<Course[]>(this.API_URL).subscribe({
      next: (data) => {
        if (data && data.length > 0) {

          // empty default list and add courses from java
          this.courseList.length = 0;
          this.courseList.push(...data);
        }
      },
      error: () => {}
      });
      return this.courseList;
    };
    getCourseById(id: string): Course| undefined{
      return this.courseList.find(c => c.id === id);

    }

  // loadMarkdown(path: string): Observable<string> {
  //   if(this.cache.has(path)) return this.cache.get(path)!;

  //   const request$ = this.http.get(path, { responseType: 'text' });
  //   this.cache.set(path, request$);
  //   return request$;
  // }

  async loadCourse(courseId: string) {
    const sections: { id: string; title: string; content: string }[] = [];
    try{
      const index = await firstValueFrom(
        this.http.get<{ files: string[] }>(`courses/${courseId}/index.json`)
      );
    for(const file of index.files) {
      try {
        const content = await firstValueFrom(
          this.http.get(`courses/${courseId}/${file}`, { responseType: 'text' })
        );
        const id = file.replace('.md', '');
        const title = id.replace(/[-_]/g, ' ').replace(/\b\w/g, c=> c.toUpperCase());
        sections.push({id, title, content});

      } catch(err) {
        console.error(`Fichier introuvable :  ${file}: ${err}`);
      }
    }
    }catch(err){
      console.error(`Index introuvable pour : ${courseId} ${err}.`);
    }
    return sections;
  }
}
