import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'twd';
  @ViewChild('drawer') drawer!: MatDrawer;
  isDesktop!: boolean;
  clientVersion: string = '5.7.0';
  usersOnline: number = 0;

  constructor() {
  }

  ngOnInit() {
    this.isDesktop = window.innerWidth >= 1024;
    window.addEventListener('resize', this.onResize);
  }

  toggleDrawer() {
    this.isDesktop = !this.isDesktop;
  }
  
  closeMobile() {
    if(window.innerWidth <= 1024) {
      this.drawer.close();
    }
  }

  onResize = () => {
    this.isDesktop = window.innerWidth >= 1024;
  }
}
