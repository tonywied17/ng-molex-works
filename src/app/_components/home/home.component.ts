/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Mon August 14th 2023 2:00:00 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";

/**
 * RepoData
 * @interface - Repo data
 */
interface RepoData {
  projectName: string;
  pushedAt: string;
  lastPushed: string;
  fullName: string;
  description: string;
  avatar: string;
  name: string;
  url: string;
  language: string;
}

/**
 * HomeComponent
 * @classdesc - Home component implementation
 */
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})

export class HomeComponent implements OnInit {
  loaded: boolean = false;
  /**
   * projectNames
   * @property - Array of project names
   * @type {string[]}
   */
  projectNames: string[] = [
    "ng-paarmy.com",
    "ng-paapp2",
    "express-paarmy-api",
    "paapp2-discord-bot",
    "ng-molex-works",
    "smiley-color-helper",
    "phi-ng",
    "p2-terminus-frontend",
  ];

  /**
   * repos
   * @property - Array of repo data
   * @type {RepoData[]}
   */
  repos: RepoData[] = [];

  /**
   * @constructor
   * @param http - HttpClient
   */
  constructor(private http: HttpClient) {}

  /**
   * ngOnInit
   * @method - Life cycle hook.
   */
  async ngOnInit(): Promise<void> {
    await this.fetchRepoData();
    this.loaded = true;
  }

  /**
   * fetchRepoData
   * @method - Fetches data from GitHub API.
   */
   async fetchRepoData(): Promise<void> {
    const baseURL = "https://api.github.com/repos/tonywied17/";

    const requests = this.projectNames.map((projectName) => {
      const repoURL = `${baseURL}${projectName}`;

      return this.http.get(repoURL).pipe(
        map((response: any) => {
          const pushedAt = (response as any)["pushed_at"];
          const fullName = (response as any)["name"];
          const description = (response as any)["description"];
          const url = (response as any)["html_url"];
          const language = (response as any)["language"];

          const dev = (response as any)["owner"];
          const avatar = dev["avatar_url"];
          const name = dev["login"];

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

          return {
            projectName,
            pushedAt: response["pushed_at"], // Keep the original 'pushed_at' for sorting
            lastPushed: formattedTime, // Add a new property for displaying
            fullName,
            description,
            avatar,
            name,
            url,
            language,
          };
        })
      );
    });

    /**
     * forkJoin
     * @method - Combines multiple Observables to create an Observable whose values are calculated from the latest values of each of its input Observables.
     */
    forkJoin(requests).subscribe((reposData: any[]) => {
      this.repos = reposData.sort((a, b) => {
        // Since 'pushed_at' is ISO format, just directly compare the strings
        return b.pushedAt.localeCompare(a.pushedAt);
      });
    });
  }
}
