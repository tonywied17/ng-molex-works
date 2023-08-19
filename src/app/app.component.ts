/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Fri August 18th 2023 10:11:03 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
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
export class AppComponent implements OnInit, OnDestroy {
  /**
   * Properties
   */
  title = "twd";
  @ViewChild("drawer") drawer!: MatDrawer;
  isDesktop: boolean = true;
  

  get isDrawerOpened(): boolean {
    return this.drawer ? this.drawer.opened : this.isDesktop;
  }
  set isDrawerOpened(value: boolean) {
    if (this.drawer) {
      this.drawer.opened = value;
    }
  }

  constructor() {}

  /**
   * ngOnInit
   * @method - Life cycle hook
   */
  ngOnInit() {
    this.isDesktop = window.innerWidth >= 1024;
    window.addEventListener("resize", this.onResize);
  }

  /**
   * ngOnDestroy
   * @method - Life cycle hook
   */
  ngOnDestroy() {
    window.removeEventListener("resize", this.onResize);
  }

  /**
   * toggleDrawer
   * @method - Toggle drawer
   * @returns {void}
   */
  toggleDrawer(): void {
    this.isDrawerOpened = !this.isDrawerOpened;
  }

  /**
   * closeMobile
   * @method - Close drawer in mobile mode
   * @returns {void}
   */
  closeMobile(): void {
    if (!this.isDesktop) {
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
    this.isDrawerOpened = this.isDesktop;
  };

}
