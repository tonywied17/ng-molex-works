/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\app.component.ts
 * Project: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Wed February 5th 2025 11:00:57 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */

import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatDrawer } from "@angular/material/sidenav";

/**
   * @class - AppComponent
   * @method - Get all projects
   * @returns {void}
   */
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})

export class AppComponent implements OnInit, OnDestroy
{
  title = "twd";
  @ViewChild("drawer") drawer!: MatDrawer;
  isDesktop: boolean = true;

  get isDrawerOpened(): boolean
  {
    return this.drawer ? this.drawer.opened : this.isDesktop;
  }

  set isDrawerOpened(value: boolean)
  {
    if (this.drawer)
    {
      this.drawer.opened = value;
    }
  }

  get contentClass(): string
  {
    return this.isDesktop || this.isDrawerOpened ? '' : 'mobile-nav-active';
  }

  get isMobileNavOpened(): boolean
  {
    return !this.isDesktop && this.isDrawerOpened;
  }

  constructor() { }

  /**
   * ngOnInit
   * @method - Initialize the component
   * @returns {void}
   * @listens - window resize event
   * @emits - onResize
   */
  ngOnInit()
  {
    this.isDesktop = window.innerWidth >= 1024;
    window.addEventListener("resize", this.onResize);
  }

  /**
   * ngOnDestroy
   * @method - Destroy the component
   * @returns {void}
   * @listens - window resize event
   */
  ngOnDestroy()
  {
    window.removeEventListener("resize", this.onResize);
  }

  /**
   * toggleDrawer
   * @method - Toggle the drawer
   * @returns {void}
  */
  toggleDrawer(): void
  {
    this.isDrawerOpened = !this.isDrawerOpened;
  }

  /**
   * closeMobile
   * @method - Close the mobile drawer
   * @returns {void}
  */
  closeMobile(): void
  {
    if (!this.isDesktop)
    {
      this.isDrawerOpened = false;
    }
  }

  /**
   * onResize
   * @method - Handle the window resize event
   * @returns {void}
  */
  onResize = (): void =>
  {
    this.isDesktop = window.innerWidth >= 1024;
    this.isDrawerOpened = this.isDesktop;
  };
}
