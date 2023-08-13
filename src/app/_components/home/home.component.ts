/*
 * File: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs\src\app\_components\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\BH Labs NG\ng-bhlabs
 * Created Date: Saturday July 8th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun August 13th 2023 1:28:14 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 Tone Web Design, Molex
 */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  projectNames: string[] = ['ng-paarmy.com', 'ng-paapp2', 'express-paarmy-api', 'paapp2-discord-bot'];
  repos: RepoData[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRepoData();
  }

  fetchRepoData(): void {
    const baseURL = 'https://api.github.com/repos/tonywied17/';

    const requests = this.projectNames.map((projectName) => {
      const repoURL = `${baseURL}${projectName}`;

      return this.http.get(repoURL).pipe(
        map((response: any) => {
          const pushedAt = (response as any)['pushed_at'];
          const fullName = (response as any)['name'];
          const description = (response as any)['description'];
          const url = (response as any)['html_url'];
          const language = (response as any)['language'];

          const dev = (response as any)['owner'];
          const avatar = dev['avatar_url'];
          const name = dev['login'];

          const lastPushed = new Date(pushedAt);
          const now = new Date();
          const diffMinutes = Math.floor(
            (now.getTime() - lastPushed.getTime()) / (1000 * 60)
          );

          let formattedTime = '';
          if (diffMinutes < 1) {
            formattedTime = 'just now';
          } else if (diffMinutes === 1) {
            formattedTime = '1 minute ago';
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
            pushedAt: response['pushed_at'], // Keep the original 'pushed_at' for sorting
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

    forkJoin(requests).subscribe((reposData: any[]) => {
      this.repos = reposData.sort((a, b) => {
          // Since 'pushed_at' is ISO format, we can directly compare the strings
          return b.pushedAt.localeCompare(a.pushedAt);
      });
  });
  }
}
