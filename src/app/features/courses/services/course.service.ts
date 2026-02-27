import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, of,  switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);

//  private cache = new Map<string, Observable<string>>();
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
//  loadMarkdown(path: string): Observable<string>{
//    if(this.cache.has(path)){
//      return this.cache.get(path)!;
//    }
//    const request$ = this.http.get(path, {
//      responseType: 'text'
//    }).pipe(
//      catchError(()=> of('')),
//      shareReplay(1)
//    );
//    this.cache.set(path, request$);
//    return request$;
//  }
loadCourse(courseId: string){
    return this.http
      .get<{ title: string; files: string[]}>(`cours/${courseId}/index.json`)
      .pipe(
        switchMap(index=>{
          const requests = index.files.map(file =>
          this.http.get(`cours/${courseId}/${file}`, {
            responseType: 'text'
          }));
          return forkJoin(requests);
        }),
        map(contents => contents.join('\n\n')),
        catchError(()=> of(''))
      );
  }

}
