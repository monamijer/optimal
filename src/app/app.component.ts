import { Component, computed, Input, signal } from '@angular/core';
import {RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = '';
   firstName = signal('monami jerome');

   fistUpper = computed(()=> this.firstName.toString());

  deleteTask(title: string){
    this.title = "jerome";
    console.log("task deleted: " + title);
  }
}
