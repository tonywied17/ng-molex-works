/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 6:58:27 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDrawer } from "@angular/material/sidenav";

/**
 * AppComponent
 * @classdesc - App component implementation
 */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  /**
   * Properties
   */
  title = "twd";
  @ViewChild("drawer") drawer!: MatDrawer;
  isDesktop!: boolean;
  isDrawerOpened: boolean = false;

  constructor() {}

  /**
   * ngOnInit
   * @method - Life cycle hook
   */
  ngOnInit() {
    this.isDesktop = window.innerWidth >= 1024;
    this.isDrawerOpened = this.isDesktop;
    window.addEventListener("resize", this.onResize);
  }

  /**
   * toggleDrawer
   * @method - Toggle drawer
   * @returns {void}
   */
  toggleDrawer(): void {
    if (this.isDesktop) {
      this.drawer.toggle();
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

  /**
   * closeMobile
   * @method - Close drawer in mobile mode
   * @returns {void}
   */
  closeMobile(): void {
    if (window.innerWidth <= 1024) {
      this.drawer.close();
      this.isDrawerOpened = false;
    }
  }

  /**
   * onResize
   * @method - On resize
   * @returns {void}
   */
  onResize = (): void => {
    this.isDesktop = window.innerWidth >= 1024;
    if (this.isDesktop) {
      this.isDrawerOpened = true;
    }
  };
}
