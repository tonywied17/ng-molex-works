/*
 * File: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works\src\app\_components\portfolio\details\details.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat November 11th 2023 6:51:42 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ImageModalComponent } from "../image-modal/image-modal.component";
import { MatDialog } from '@angular/material/dialog';

/**
 * DetailsComponent
 * @classdesc - Details component implementation
 */
@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})
export class DetailsComponent implements OnInit {
  /**
   * Properties
   */
  data: any;
  loaded: any;
  projects: any;
  showOverlay: boolean = false;
  images: string[] = [];
  mainImageSrc: string = "";
  currentIndex: number = 0;
  repos: any[] = [];
  tags: any[] = [];

  /**
   * Inputs
   * @property - Input viewMode
   * @property - Input currentProject
   */
  @Input() viewMode = false;
  @Input() currentProject: any;

  /**
   * @constructor
   * @param route
   * @param http
   */
  constructor(private route: ActivatedRoute, private http: HttpClient, private dialog: MatDialog) {}

  /**
   * ngOnInit
   * @method - Life cycle hook
   */
  ngOnInit(): void {
    let paramID = this.route.snapshot.params["id"];
    this.getProject(paramID);
  }

  

  /**
   * getProject
   * @method - Get project
   * @param projID - project id
   * @returns - project
   */
  async getProject(projID: any) {
    let resp = await fetch("assets/portfolio.json?" + this.rando());
    if (resp.ok) {
      let json = await resp.json();
      this.projects = json.projects;
      this.projects.forEach(async (proj: any) => {
        if (proj.id == projID) {
          this.currentProject = proj;
          if (proj.image) {
            this.images = proj.image.split(", ");
            this.currentProject.mainImage = this.images[0];
          }
          if (proj.repo) {
            if (proj.repo.includes(",")) {
              let splitRepos = proj.repo.split(", ");
              this.repos = await Promise.all(
                splitRepos.map((repoUrl: string) =>
                  this.getApiEndpoint(repoUrl)
                )
              );
            } else {
              this.repos = [await this.getApiEndpoint(proj.repo)];
            }
          } else {
            this.repos = [];
          }
          if (proj.tags) {
            if (proj.tags.includes(",")) {
              let splitTags = proj.tags.split(", ");
              this.tags = splitTags;
            } else {
              this.tags.push(proj.tags);
            }
          } else {
            this.tags = [];
          }
        }
      });
    }
    this.loaded = true;
  }

  /**
   * changeMainImage
   * @method - Change main image
   * @param imgSrc - image source
   * @returns - void
   */
  changeMainImage(imgSrc: string): void {
    this.currentProject.mainImage = imgSrc;
    this.currentIndex = this.images.indexOf(imgSrc);
  }

  /**
   * prevImage
   * @method - Previous image
   * @returns - void
   */
  prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.changeMainImage(this.images[this.currentIndex]);
  }

  /**
   * nextImage
   * @method - Next image
   * @returns - void
   */
  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.changeMainImage(this.images[this.currentIndex]);
  }

  /**
   * getApiEndpoint
   * @param repoUrl - repository url
   * @returns - repository details
   */
  async getApiEndpoint(repoUrl: string) {
    const repoPath = repoUrl.replace("https://github.com/", "");
    const apiEndpoint = `https://api.github.com/repos/${repoPath}`;

    try {
      const response: any = await this.http.get(apiEndpoint).toPromise();
      const pushedAt = response["pushed_at"];

      const lastPushed = new Date(pushedAt);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - lastPushed.getTime()) / (1000 * 60)
      );

      let formattedTime = "";
      if (diffMinutes < 1) {
        formattedTime = "just now";
      } else if (diffMinutes === 1) {
        formattedTime = "1 minute ago";
      } else if (diffMinutes < 60) {
        formattedTime = `${diffMinutes} minutes ago`;
      } else if (diffMinutes < 1440) {
        const diffHours = Math.floor(diffMinutes / 60);
        formattedTime = `${diffHours} hours ago`;
      } else {
        const diffDays = Math.floor(diffMinutes / 1440);
        formattedTime = `${diffDays} days ago`;
      }

      return { url: apiEndpoint, repoUrl: repoUrl, pushedAt: formattedTime };
    } catch (error) {
      console.error("Error fetching repository details:", error);
      return null;
    }
  }

  /**
   * open
   * @method - Open window
   * @param url
   * @param title
   * @param w - width
   * @param h - height
   * @returns - window
   */
  open(url: any, title: any, w: any, h: any) {
    var left = screen.width / 2 - w / 2;
    var top = screen.height / 2 - h / 2;
    return window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );
  }

  openImageModal(imageUrl: string) {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      data: {
        imageUrl,
        galleryImages: [...this.images.map(url => ({ url }))], // Pass a copy of the gallery images as objects
      },
      panelClass: 'image-modal-dialog',
    });
  
    dialogRef.afterClosed().subscribe(() => {
      // Do something after the modal is closed, if needed
    });
  }
  

  /**
   * rando
   * @method - Get random number
   * @returns - random number
   */
  rando() {
    return Math.floor(Math.random() * 100000);
  }

  /**
   * openOverlay
   * @method - Open overlay
   * @returns - void
   */
  openOverlay(): void {
    this.showOverlay = true;
  }

  /**
   * closeOverlay
   * @method - Close overlay
   * @returns - void
   */
  closeOverlay(): void {
    this.showOverlay = false;
  }
}
