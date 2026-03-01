import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, forkJoin, map, Observable, of,  shareReplay,  switchMap } from 'rxjs';
import { Course } from '../models/course.model';
import { title } from 'process';
import path from 'path';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();

//  private courses: Course[] = [
//    {
//      id: 'algorithms',
//      title: 'Base de donnees Avancees',
//      description: 'Apprenez les concepts avancés de la gestion de bases de données, y compris les transactions, l\'optimisation des requêtes et la sécurité.',
//      instructor: 'Dr. Monami Jerome',
//      duration: 40,
//      content: 'Ce cours couvre les transactions, l\'optimisation des requêtes, la sécurité des bases de données et les systèmes de gestion de bases de données avancés.',
//      icon: 'bi-database-fill' // Example icon class from Bootstrap Icons
//    },
//    {
//      id: 'intelligences_artificielless',
//      title: 'Intelligence Artificielle',
//      description: 'Découvrez les fondamentaux de l\'intelligence artificielle, y compris les algorithmes d\'apprentissage automatique, les réseaux de neurones et les applications de l\'IA.',
//      instructor: 'Dr. Monami Jerome',
//      duration: 50,
//      content: 'Ce cours couvre les algorithmes d\'apprentissage automatique, les réseaux de neurones, le traitement du langage naturel et les applications de l\'IA dans divers domaines.',
//      icon: 'bi-robot' // Example icon class from Bootstrap Icons
//    },
  loadMarkdown(path: string): Observable<string>{
    if(this.cache.has(path)){
      return this.cache.get(path)!;
    }
    const request$ = this.http.get(path, {
      responseType: 'text'
    }).pipe(
      catchError(()=> of('')),
      shareReplay(1)
    );
    this.cache.set(path, request$);
    return request$;
  }
//loadCourse(courseId: string): Observable<string>{
//  if(this.cache.has(courseId)) return this.cache.get(courseId)!;

//  const request$ = this.http.get<{ files: string[]}>(`/cours/${courseId}/index.json`)
//      .pipe(
//        switchMap(index=>{
//          const requests = index.files.map(file =>
//          this.http.get(`cours/${courseId}/${file}`, {
//            responseType: 'text'
//          }));
//          return forkJoin(requests);
//        }),
//        map(contents => contents.join('\n\n')),
//        catchError(()=> of('')),
//        shareReplay(1)
//      );
//      this.cache.set(courseId, request$);
//      return request$;
//  }
  async loadCourse(courseId: string){
    const files = ['introductions.md', 'tableau.md'];
    const sections = [];

    for(const file of files){
      try{
      const path = `cours/${courseId}/${file}`;
      const content = await firstValueFrom(
        this.http.get(path, {responseType: 'text'})
      )
      sections.push({ id: file.replace('.md', ''), title: file.replace('.md', ''), content})
    }catch(err){
      console.error(`error loading: ${path} - ${err}`)
    }
    }
    return sections;

  }


  getAllCourses(): Course[]{
    return [
      { id: 'algorithms', title: 'les algorithmes sont les bases de l\'informatique tu piges ?', icon: 'bi-code-slash'},
      { id: 'Base des donnees', title: 'Apprendre les bases, avances et devenir pro, vraiment un pro', icon: 'bi-database-fill'},
      { id: 'Reseaux', title: 'apprendre a securiser les reseaux et administrer des serveurs a distances', icon: 'bi-shield-lock-fill'},
      { id: 'introductions.md', title: 'ceci est une introduction lambda juste pour verifier si ca marche', icon: 'bi-shield-lock-fill'}

    ]
  }

}
