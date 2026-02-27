import { inject, Injectable, signal } from '@angular/core';
import { Course } from '../models/course.model';
import { CourseSection } from '../models/courseSection.model';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();

  private courses: Course[] = [
    {
      id: 1,
      title: 'Base de donnees Avancees',
      description: 'Apprenez les concepts avancés de la gestion de bases de données, y compris les transactions, l\'optimisation des requêtes et la sécurité.',
      instructor: 'Dr. Monami Jerome',
      duration: 40,
      content: 'Ce cours couvre les transactions, l\'optimisation des requêtes, la sécurité des bases de données et les systèmes de gestion de bases de données avancés.',
      icon: 'bi-database-fill' // Example icon class from Bootstrap Icons
    },
    {
      id: 2,
      title: 'Intelligence Artificielle',
      description: 'Découvrez les fondamentaux de l\'intelligence artificielle, y compris les algorithmes d\'apprentissage automatique, les réseaux de neurones et les applications de l\'IA.',
      instructor: 'Dr. Monami Jerome',
      duration: 50,
      content: 'Ce cours couvre les algorithmes d\'apprentissage automatique, les réseaux de neurones, le traitement du langage naturel et les applications de l\'IA dans divers domaines.',
      icon: 'bi-robot' // Example icon class from Bootstrap Icons
    },
    {
      id: 3,
      title: 'Algorithmes et Structures de Données',
      description: 'Maîtrisez les algorithmes et les structures de données essentiels pour résoudre des problèmes complexes en informatique.',
      instructor: 'Dr. Monami Jerome',
      duration: 45,
      content: 'Ce cours couvre les algorithmes de tri, de recherche, les structures de données telles que les listes, les piles, les files d\'attente et les arbres.',
      icon: 'bi-code-slash' // Example icon class from Bootstrap Icons
    },
    {
      id: 4,
      title: 'Reseaux et Sécurité Informatique',
      description: 'Apprenez les principes fondamentaux des réseaux informatiques et de la sécurité pour protéger les systèmes contre les menaces cybernétiques.',
      instructor: 'Dr. Monami Jerome',
      duration: 35,
      content: 'Ce cours couvre les concepts de base des réseaux, les protocoles de communication, la sécurité des réseaux et les meilleures pratiques pour protéger les systèmes informatiques.',
      icon: 'bi-shield-lock-fill' // Example icon class from Bootstrap Icons
    }
  ];
  private sections = signal<Record<string, CourseSection[]>>({
    algo: [
      {id: 'intro', title: 'Introduction aux algorithmes', content: 'Definition ...'},
      {id: 'complexity', title: 'Intoduction', content: 'BDD...'},
      {id: 'example', title: 'Some Examples', content: '.....'}
    ],
    bdd: [
      { id: 'intro', title: 'Introduction', content: 'BDD is ....'}
    ]
  });

  loadMarkdown(courseId: string){
    return this.http
      .get<{ title: string; files: string[]}>(`/${courseId}/index.json`)
      .pipe(
        switchMap(index=>{
          const requests = index.files.map(file =>
          this.http.get(`${courseId}/${file}`, {
            responseType: 'text'
          }));
          return forkJoin(requests);
        }),
        map(contents => contents.join('\n\n'))
      );
  }

  // if(this.cache.has(path)){
  //   return this.cache.get(path)!;
  // }
  // const request$ = this.http.get(path, {
  //    responseType: 'text'
  //  }).pipe(
  //    catchError(()=> of('')),
  //    shareReplay(1)
  //  );
  //  this.cache.set(path, request$);
  //  return request$;
  //}

  getAllCourses(){
    return this.courses;
  }
  getCourseById(id: string){
    return this.courses.find(c=>id=== id);
  }
  getSectionsByKey(key: string): CourseSection[]{
    return this.sections()[key] ?? [];
  }

}
