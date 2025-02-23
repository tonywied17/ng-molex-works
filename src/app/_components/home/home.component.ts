/*
 * File: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works\src\app\_components\home\home.component.ts
 * Project: c:\Users\tonyw\Desktop\molexworks.com\ng-molex-works
 * Created Date: Sunday August 13th 2023
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sun February 9th 2025 3:43:30 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2023 - 2025 MolexWorks
 */

import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

/**
 * Commit
 * @interface - Represents a commit in the repository
 */
interface Commit
{
  sha: string;        //> The commit SHA
  message: string;    //> The commit message
  url: string;        //> The URL of the commit
}

/**
 * Owner
 * @interface - Represents the repository owner's details
 */
interface Owner
{
  login: string;      //> The username of the owner
  avatar_url: string; //> The URL of the owner's avatar image
}

/**
 * RepoData
 * @interface - Represents data related to a repository
 */
interface RepoData
{
  name: string;               //> The name of the repository
  full_name: string;          //> The full name of the repository (e.g., "owner/repo")
  owner: Owner;               //> The repository owner's information
  html_url: string;           //> The URL of the repository
  description: string;        //> The description of the repository
  pushed_at: string;          //> The date the project was last pushed to in ISO format
  homepage: string;           //> The homepage URL of the repository
  stargazers_count: number;   //> The number of stars the repository has
  language: string;           //> The primary language of the repository
  forks_count: number;        //> The number of forks of the repository
  lastPushed: string;         //> The relative date (e.g., "3 months ago") the project was last pushed to
  commits: Commit[];          //> The commits for the repository
}

/**
 * Stats
 * @interface - Represents statistics about the repositories
 */
interface Stats
{
  totalRepos: number;  //> The total number of repositories
  totalStars: number;  //> The total number of stars
  topLanguage: string; //> The most common language among the repositories
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
  loaded: boolean = false;                      //> Indicates whether the repository data has been loaded
  selectedLanguages: string[] = [];             //> Tracks the selected languages for filtering
  repos: RepoData[] = [];                       //> Repositories that match selected languages and name filter
  allRepos: RepoData[] = [];                    //> All repositories
  stats: Stats | null = null;                   //> Statistics about the repositories
  languages: string[] = [];                     //> List of unique languages for checkboxes
  repoNameFilter: string = "";                  //> Filter text for repo names
  sortOption: string = "recentlyUpdated";       //> Default sorting option

  constructor(private http: HttpClient) { }

  ngOnInit(): void
  {
    this.fetchRepoData();                       //> Fetch repository data when component initializes
  }

  /**
   * fetchRepoData
   * @method - Fetches the repository data from the GitHub API
   * @return - void
   */
  async fetchRepoData(): Promise<void>
  {
    this.http.get<{ Statistics: Stats, Repositories: RepoData[] }>('https://molex.cloud/github/data').subscribe((response) =>
    {
      const repos: RepoData[] = response.Repositories;     //> Assigning fetched repositories
      const stats: Stats = response.Statistics;           //> Assigning fetched statistics

      //> Processing and filtering repositories
      this.allRepos = repos.filter((repo: RepoData) => repo.full_name !== "README").map((repo: RepoData) =>
      {
        return {
          name: repo.name,
          full_name: repo.full_name,
          owner: repo.owner,
          html_url: repo.html_url,
          description: repo.description,
          pushed_at: repo.pushed_at,
          homepage: repo.homepage,
          stargazers_count: repo.stargazers_count,
          language: repo.language,
          forks_count: repo.forks_count,
          lastPushed: repo.lastPushed,
          commits: repo.commits || []
        };
      });

      this.sortRepos();                              //> Sort repositories after fetching

      //> Extract unique languages for filtering
      const uniqueLanguages = Array.from(new Set(this.allRepos.map((repo: RepoData) => repo.language).filter(Boolean)));
      this.languages = uniqueLanguages;               //> Set the languages for checkboxes
      this.selectedLanguages = [...this.languages];   //> Initialize selected languages to all available
      this.filterRepos();                             //> Apply filtering after loading the languages
      this.loaded = true;                             //> Mark data as loaded
      this.stats = stats;                            //> Set statistics data
      console.log(this.stats);                       //> Log the statistics data for debugging
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
      const matchesLanguage = this.selectedLanguages.includes(repo.language);   //> Check if the repo matches selected languages
      const matchesRepoName = repo.name.toLowerCase().includes(this.repoNameFilter.toLowerCase()); //> Check if the repo name matches the filter

      return matchesLanguage && matchesRepoName;    //> Return only the repositories that match both conditions
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
        this.allRepos.sort((a, b) => a.name.localeCompare(b.name)); //> Sort by name
        break;
      case "stars":
        this.allRepos.sort((a, b) => b.stargazers_count - a.stargazers_count); //> Sort by number of stars
        break;
      default:
        this.allRepos.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()); //> Sort by last pushed date
        break;
    }

    this.filterRepos(); //> Reapply filter after sorting
  }

  /**
   * onLanguageChange
   * @method - Event handler for when the sorting option is changed
   * @param language - The language that was selected or deselected
   * @return - void
   */
  onLanguageChange(language: string): void
  {
    const index = this.selectedLanguages.indexOf(language);
    if (index === -1)
    {
      this.selectedLanguages.push(language);  //> Add language to selected list
    } else
    {
      this.selectedLanguages.splice(index, 1);  //> Remove language from selected list
    }

    this.filterRepos();  //> Reapply filter after language change
  }

  /**
   * allLanguagesSelected
   * @method - Checks if all languages are selected
   * @return - boolean
   */
  allLanguagesSelected(): boolean
  {
    return this.selectedLanguages.length === this.languages.length; //> Return true if all languages are selected
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
      this.selectedLanguages = [];  //> Deselect all languages
    } else
    {
      this.selectedLanguages = [...this.languages];  //> Select all languages
    }

    this.filterRepos();  //> Reapply filter after toggling select all
  }

  viewRepo(url: string): void
  {
    if (url)
    {
      window.open(url, '_blank');
    } else
    {
      console.error('URL is not defined');
    }
  }
}


