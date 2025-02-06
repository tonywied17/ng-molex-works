import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

interface RepoData
{
  projectName: string;
  pushedAt: Date;
  lastPushed: string;
  fullName: string;
  description: string;
  avatar: string;
  name: string;
  url: string;
  language: string;
  stars: number;
}

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
        const pushedAt = new Date(repo.pushedAt);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - pushedAt.getTime()) / (1000 * 60));
        let formattedTime = '';

        if (diffMinutes < 1)
        {
          formattedTime = 'just now';
        } else if (diffMinutes === 1)
        {
          formattedTime = '1 minute ago';
        } else if (diffMinutes < 60)
        {
          formattedTime = `${diffMinutes} minutes ago`;
        } else if (diffMinutes < 1440)
        {
          formattedTime = `${Math.floor(diffMinutes / 60)} hours ago`;
        } else
        {
          formattedTime = `${Math.floor(diffMinutes / 1440)} days ago`;
        }

        return {
          projectName: repo.projectName,
          pushedAt,
          lastPushed: formattedTime,
          fullName: repo.fullName,
          description: repo.description,
          avatar: repo.avatar,
          name: repo.name,
          url: repo.url,
          language: repo.language,
          stars: repo.stars,
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
        this.allRepos.sort((a, b) => b.pushedAt.getTime() - a.pushedAt.getTime()); // Compare actual dates
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
   * onSortChange
   * @method - Event handler for when the sorting option is changed
   * @param sortOption - The new sorting option
   * @return - void
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
