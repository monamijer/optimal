import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(public layout: LayoutService){}
  close(){
    this.layout.closeSidebar();
  }
}
