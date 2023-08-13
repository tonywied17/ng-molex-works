/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\portfolio\portfolio.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 3:39:50 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-portfolio",
  templateUrl: "./portfolio.component.html",
  styleUrls: ["./portfolio.component.scss"],
})
export class PortfolioComponent implements OnInit {
  filtered: any;
  projects: any;
  selectedValue: any;
  selectedValue2: any;
  loaded: any;
  imgArr: any;

  constructor() {}

  ngOnInit(): void {
    this.getAllProjects();
  }

  async getAllProjects() {
    let resp = await fetch("assets/portfolio.json?" + this.rando());
    this.loaded = true;
    if (resp.ok) {
      let json = await resp.json();
      this.projects = json.projects;

      console.log(this.projects);
    }
  }
  clearSortingFilters() {
    this.selectedValue = null;
  }
  clearSortingFilters2() {
    this.selectedValue2 = null;
  }
  rando() {
    return Math.floor(Math.random() * 100000);
  }
  mixer(a: any, b: any) {
    return Math.random() - 0.5;
  }

  getProjPic(projID: any): string | null {
    const proj = this.projects.find((p: any) => p.id == projID);

    if (proj && proj.image) {
        const imgArr = proj.image.split(", ");
        return imgArr[0]; 
    }
    
    return null; 
}


  /**
   * Pull the project development status (boolean)
   * @param status
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
   * Grab the tags and filter by
   * @param tag
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
}
