/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 6:28:05 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
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
  isDrawerOpened: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.isDesktop = window.innerWidth >= 1024;
    this.isDrawerOpened = this.isDesktop; // Set initial state
    window.addEventListener('resize', this.onResize);
  }

 
  toggleDrawer() {
    if (this.isDesktop) {
      this.drawer.toggle(); // In desktop mode, toggle the drawer directly
    } else {
      if (!this.isDrawerOpened) {
        this.drawer.open();
        this.isDrawerOpened = true;
      } else {
        this.drawer.close();
        this.isDrawerOpened = false;
      }
    }
  }
  
  closeMobile() {
    if(window.innerWidth <= 1024) {
      this.drawer.close();
      this.isDrawerOpened = false; // Update state when drawer is closed in mobile mode
    }
  }

  onResize = () => {
    this.isDesktop = window.innerWidth >= 1024;
    if (this.isDesktop) {
      this.isDrawerOpened = true; // In desktop mode, the drawer is always opened
    }
  }
}