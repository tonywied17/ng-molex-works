/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\MolexWorks NG\ng-molex-works
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun October 22nd 2023 11:52:23 
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
    "socket-messenger",
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
  /**
   * fetchRepoData
   * @method - Fetches data from a JSON file hosted on a web URL and appends repository names to the baseURL.
   */
  async fetchRepoData(): Promise<void> {
    const baseURL = "https://api.github.com/repos/tonywied17/";
    const jsonURL = "assets/repos.json";

    this.http.get<string[]>(jsonURL).subscribe((repoNames: string[]) => {
      const requests = repoNames.map((repoName) => {
        const repoURL = `${baseURL}${repoName}`;

        return this.http.get(repoURL).pipe(
          map((response: any) => {
            const pushedAt = response["pushed_at"];
            const fullName = response["name"];
            const description = response["description"];
            const url = response["html_url"];
            const language = response["language"];

            const dev = response["owner"];
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
              projectName: repoName,
              pushedAt: response["pushed_at"],
              lastPushed: formattedTime,
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

      forkJoin(requests).subscribe((reposData: any[]) => {
        this.repos = reposData.sort((a, b) => {
          return b.pushedAt.localeCompare(a.pushedAt);
        });
      });
    });
  }
}
