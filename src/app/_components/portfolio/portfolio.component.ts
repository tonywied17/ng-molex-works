/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\portfolio\portfolio.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 6:44:33 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, OnInit } from "@angular/core";

/**
 * PortfolioComponent
 * @classdesc - Portfolio component implementation
 */
@Component({
  selector: "app-portfolio",
  templateUrl: "./portfolio.component.html",
  styleUrls: ["./portfolio.component.scss"],
})
export class PortfolioComponent implements OnInit {
  /**
   * Properties
   */
  filtered: any;
  projects: any;
  loaded: any;

  constructor() {}

  /**
   * ngOnInit
   * @method - Life cycle hook
   */
  ngOnInit(): void {
    this.getAllProjects();
  }

  /**
   * getAllProjects
   * @method - Get all projects
   * @returns {void}
   */
  async getAllProjects() {
    let resp = await fetch("assets/portfolio.json?" + this.rando());
    this.loaded = true;
    if (resp.ok) {
      let json = await resp.json();
      this.projects = json.projects;

      console.log(this.projects);
    }
  }

  /**
   * getProjPic
   * @method - Get project image
   * @param projID - project id
   * @returns - project image
   */
  getProjPic(projID: any): string | null {
    const proj = this.projects.find((p: any) => p.id == projID);
    if (proj && proj.image) {
      const imgArr = proj.image.split(", ");
      return imgArr[0];
    }
    return null;
  }

  /**
   * getProjectDev
   * @method - Get all projects
   * @param status - status to filter by
   * @returns {void}
   */
  async getProjectDev(status: boolean) {
    let resp = await fetch("assets/portfolio.json?" + this.rando());
    if (resp.ok) {
      this.filtered = await resp.json();
      this.projects = [];
      this.filtered.projects.forEach((proj: any) => {
        console.log(proj.dev);
        if (status === true) {
          if (proj.dev === true) {
            console.log(proj);
            this.projects.push(proj);
            console.log(this.projects);
          }
        } else {
          if (proj.dev === false) {
            console.log(proj);
            this.projects.push(proj);
            console.log(this.projects);
          }
        }
      });
    }
  }

  /**
   * getProjectTag
   * @method - Get all projects
   * @param tag - tag to filter by
   * @returns {void}
   */
  async getProjectTag(tag: any) {
    let resp = await fetch("assets/portfolio.json?" + this.rando());

    if (resp.ok) {
      this.filtered = await resp.json();
      this.projects = [];
      this.filtered.projects.forEach((proj: any) => {
        if (proj.tags.includes(tag)) {
          console.log(proj);
          this.projects.push(proj);
          console.log(this.projects);
        }
      });
    }
  }

  /**
   * rando
   * @method - Get random number
   * @returns {number} - random number
   */
  rando() {
    return Math.floor(Math.random() * 100000);
  }
}
