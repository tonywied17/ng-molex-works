/*
 * File: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works\src\app\_components\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Thu February 6th 2025 3:08:40 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 - 2025 MolexWorks
 */


import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

/**
 * Commit
 * @interface - Represents a commit object
 * @property sha - The commit SHA
 * @property message - The commit message
 * @property url - The URL of the commit
 */
interface Commit
{
  sha: string;          //> The commit SHA
  message: string;      //> The commit message
  url: string;          //> The URL of the commit
}

/**
 * RepoData
 * @interface - Represents a repository object
 * @property projectName - The name of the project
 * @property pushedAt - The date the project was last pushed to
 * @property lastPushed - The date the project was last pushed to as a string
 * @property fullName - The full name of the repository
 * @property description - The description of the repository
 * @property avatar - The URL of the avatar image
 * @property name - The name of the repository
 * @property url - The URL of the repository
 * @property language - The primary language of the repository
 * @property stars - The number of stars the repository has
 * @property commits - The commits for the repository
 */
interface RepoData
{
  projectName: string;    //> The name of the project
  pushedAt: Date;         //> The date the project was last pushed to
  lastPushed: string;     //> The date the project was last pushed to as a string
  fullName: string;       //> The full name of the repository
  description: string;    //> The description of the repository
  avatar: string;         //> The URL of the avatar image
  name: string;           //> The name of the repository
  url: string;            //> The URL of the repository
  language: string;       //> The primary language of the repository
  stars: number;          //> The number of stars the repository has
  commits: Commit[];      //> The commits for the repository
}

/**
 * HomeComponent
 * @class - The home component
 */
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})

export class HomeComponent implements OnInit
{
  loaded: boolean = false;
  selectedLanguages: string[] = [];       //> Tracks the selected languages for filtering
  repos: RepoData[] = [];                 //> Repositories that match selected languages and name filter
  allRepos: RepoData[] = [];              //> All repositories
  languages: string[] = [];               //> List of unique languages for checkboxes
  repoNameFilter: string = "";            //> Filter text for repo names
  sortOption: string = 'recentlyUpdated'; //> Default sorting option

  constructor(private http: HttpClient) { }

  ngOnInit(): void
  {
    this.fetchRepoData();
  }

  /**
   * fetchRepoData
   * @method - Fetches the repository data from the GitHub API
   * @return - void
   */
  async fetchRepoData(): Promise<void>
  {
    this.http.get<any[]>('https://molex.cloud/github/api/repos').subscribe((repos: any[]) =>
    {
      this.allRepos = repos.filter((repo) => repo.fullName !== "README").map((repo) =>
      {
        return {
          projectName: repo.projectName,
          pushedAt: new Date(repo.pushedAt),
          lastPushed: repo.lastPushed,
          fullName: repo.fullName,
          description: repo.description,
          avatar: repo.avatar,
          name: repo.name,
          url: repo.url,
          language: repo.language,
          stars: repo.stars,
          commits: repo.commits || []
        };
      });

      this.sortRepos();

      const uniqueLanguages = Array.from(new Set(this.allRepos.map((repo) => repo.language).filter(Boolean)));
      this.languages = uniqueLanguages;
      this.selectedLanguages = [...this.languages];
      this.filterRepos();
      this.loaded = true;

      console.log(this.allRepos);
    });
  }

  /**
   * filterRepos
   * @method - Filters the repositories based on the selected languages and name filter
   * @return - void
   */
  filterRepos(): void
  {
    this.repos = this.allRepos.filter((repo) =>
    {
      const matchesLanguage = this.selectedLanguages.includes(repo.language);
      const matchesRepoName = repo.projectName
        .toLowerCase()
        .includes(this.repoNameFilter.toLowerCase());

      return matchesLanguage && matchesRepoName;
    });
  }

  /**
   * sortRepos
   * @method - Sorts the repositories based on the selected sorting option
   * @return - void
   */
  sortRepos(): void
  {
    switch (this.sortOption)
    {
      case "name":
        this.allRepos.sort((a, b) => a.projectName.localeCompare(b.projectName));
        break;
      case "stars":
        this.allRepos.sort((a, b) => b.stars - a.stars);
        break;
      default:
        this.allRepos.sort((a, b) => b.pushedAt.getTime() - a.pushedAt.getTime());
        break;
    }

    this.filterRepos();
  }

  /**
   * onSortChange
   * @method - Event handler for when the sorting option is changed
   * @param sortOption - The new sorting option
   * @return - void
   */
  onLanguageChange(language: string): void
  {
    const index = this.selectedLanguages.indexOf(language);
    if (index === -1)
    {
      this.selectedLanguages.push(language);
    } else
    {
      this.selectedLanguages.splice(index, 1);
    }

    this.filterRepos();
  }

  /**
   * allLanguagesSelected
   * @method - Checks if all languages are selected
   * @return - boolean
   */
  allLanguagesSelected(): boolean
  {
    return this.selectedLanguages.length === this.languages.length;
  }

  /**
   * toggleSelectAll
   * @method - Toggles the selection of all languages
   * @return - void
   */
  toggleSelectAll(): void
  {
    if (this.allLanguagesSelected())
    {
      this.selectedLanguages = [];
    } else
    {
      this.selectedLanguages = [...this.languages];
    }
    this.filterRepos();
  }
}
