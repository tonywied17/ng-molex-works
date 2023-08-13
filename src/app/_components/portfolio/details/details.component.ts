import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  data: any;
  loaded: any;
  projects: any;
  showOverlay: boolean = false;

  @Input() viewMode = false;
  @Input() currentProject: any;

  images: string[] = [];
  mainImageSrc: string = "";
  currentIndex: number = 0;

  repos: any[] = [];
  tags: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  
  ngOnInit(): void {
    let paramID = this.route.snapshot.params["id"];
    this.getProject(paramID);
  }

  /**
   *
   * @param projID
   */
  async getProject(projID: any) {
    let resp = await fetch("assets/portfolio.json?" + this.rando());
    this.loaded = true;
    if (resp.ok) {
      let json = await resp.json();
      this.projects = json.projects;
      console.log(json.projects);

      this.projects.forEach(async (proj: any) => {
        if (proj.id == projID) {
          this.currentProject = proj;

          if (proj.image) {
            this.images = proj.image.split(", "); // Split the image URLs
            this.currentProject.mainImage = this.images[0]; // Set the first image as the main image
          }

          // Get Repo's comma separated to array
          if (proj.repo) {
            if (proj.repo.includes(",")) {
              let splitRepos = proj.repo.split(", ");
              this.repos = await Promise.all(
                splitRepos.map((repoUrl: string) =>
                  this.getApiEndpoint(repoUrl)
                )
              ); // Wait for all promises to resolve
            } else {
              this.repos = [await this.getApiEndpoint(proj.repo)]; // Wait for the promise to resolve
            }
          } else {
            this.repos = [];
          }

          // Get tech stack tags comma separated to array
          if (proj.tags) {
            if (proj.tags.includes(",")) {
              let splitTags = proj.tags.split(", ");
              console.log(splitTags);
              this.tags = splitTags;
            } else {
              console.log(proj.tags);
              this.tags.push(proj.tags);
            }
          } else {
            this.tags = [];
          }
        }
      });
    }
  }

  /**
   * @method changeMainImage
   * @description Change the main image of the project
   * @param imgSrc - The image source to change to
   */
  changeMainImage(imgSrc: string): void {
    this.currentProject.mainImage = imgSrc;
    this.currentIndex = this.images.indexOf(imgSrc);
  }

  /**
   * @method prevImage
   * @description Change the main image to the previous image in the array
   */
  prevImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      // Loop around to the last image
      this.currentIndex = this.images.length - 1;
    }
    this.changeMainImage(this.images[this.currentIndex]);
  }

  /**
   * @method nextImage
   * @description Change the main image to the next image in the array
   */
  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    } else {
      // Loop around to the first image
      this.currentIndex = 0;
    }
    this.changeMainImage(this.images[this.currentIndex]);
  }

  /**
   * @method getApiEndpoint
   * @description Get the API endpoint for the GitHub repository
   * @param repoUrl
   * @returns
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
   * @method open
   * @description Open a new window
   * @param url
   * @param title
   * @param w
   * @param h
   * @returns
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

  /**
   * @method rando
   * @description Generate a random number
   * @returns A random number
   */
  rando() {
    return Math.floor(Math.random() * 100000);
  }


  openOverlay(): void {
    this.showOverlay = true;
}

closeOverlay(): void {
  this.showOverlay = false;
}
/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\portfolio\details\details.component.ts
 * Project: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 2:17:00 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */


}
