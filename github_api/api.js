//! MolexWorks Git API Server //////////////////////////////////////////////////
//! Author: Tony Wiedman ///////////////////////////////////////////////////////

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { formatDistanceToNow, parseISO } = require('date-fns');
const app = express();


//! Configuration  /////////////////////////////////////////////////////////////

const config = {
    PORT: process.env.PORT || 3330,                                             //!> Port to run the server on
    GITHUB: {
        TOKEN: process.env.GITHUB_TOKEN,                                        //!> Personal access token for GitHub API
        USERNAME: process.env.GITHUB_USERNAME,                                  //!> GitHub username to fetch data from
        API_BASE_URL: 'https://api.github.com',                                 //!> Base URL for GitHub API
        REPOS_PER_PAGE: 100,                                                    //!> Number of repositories to fetch per page
    },
    CACHE: {
        REFRESH_INTERVAL: 60 * 60 * 1000,                                       //!> Cache refresh interval in milliseconds
        INITIAL_DELAY: 0,                                                       //!> Delay before initial cache refresh in milliseconds
    },
    CORS: {
        ALLOWED_ORIGINS: ['http://localhost:4200', 'https://molexworks.com'],   //!> Allowed origins for CORS
    },
    COMMIT_FETCH_RULES: {
        MONTH: { threshold: 30 * 24 * 60 * 60 * 1000, commits: 5 },             //!> Commits to fetch if pushed within a month
        THREE_MONTHS: { threshold: 3 * 30 * 24 * 60 * 60 * 1000, commits: 5 },  //!> Commits to fetch if pushed within 3 months
        SIX_MONTHS: { threshold: 6 * 30 * 24 * 60 * 60 * 1000, commits: 3 },    //!> Commits to fetch if pushed within 6 months
        YEAR: { threshold: 12 * 30 * 24 * 60 * 60 * 1000, commits: 3 },         //!> Commits to fetch if pushed within a year
        OVER_YEAR: { threshold: Infinity, commits: 1 },                         //!> Commits to fetch if pushed over a year ago
    },
    AUTH: {
        ADMIN_REFRESH_TOKEN: process.env.ADMIN_REFRESH_TOKEN,                   //!> Admin token to manually refresh the cache
    }
};

//* In-memory cache object
let cache = {
    repos: [],                  //!> Cached repository data
    stats: [],                  //!> Cached statistics
    gists: [],                  //!> Cached gists
    lastUpdated: new Date(),    //!> Timestamp of last cache update
    isRefreshing: false,        //!> Flag to prevent concurrent cache refreshes
};

//* CORS setup
app.use(cors({
    origin: (origin, callback) =>
    {
        const allowedOrigins = config.CORS.ALLOWED_ORIGINS;
        allowedOrigins.includes(origin) || !origin
            ? callback(null, true)
            : callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
}));


//! Middleware  ////////////////////////////////////////////////////////////////

/**
 ** Middleware to authenticate admin requests.
 */
const authenticateAdmin = (req, res, next) =>
{
    const validToken = config.AUTH.ADMIN_REFRESH_TOKEN;
    const providedToken = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    providedToken === validToken ? next() : res.status(403).json({ message: 'Forbidden: Invalid or missing token.' });
};

/**
 ** Middleware to calculate cache timings for each request.
 */
const cacheTimingMiddleware = (req, res, next) =>
{
    req.cacheTimings = calculateCacheTimings();
    next();
};

app.use(cacheTimingMiddleware);


//! API Routes  //////////////////////////////////////////////////////////////

/**
 ** Send API response based on the data key provided.
 */
const sendApiResponse = (req, res, dataKey) =>
{
    const prettyPrint = req.query.pretty === 'true';

    return !(cache.repos && cache.stats && cache.gists)
        ? res.status(503).json({ message: 'Data is being fetched, please try again shortly.' })
        : res.setHeader('Content-Type', 'application/json')
            .send(
                JSON.stringify(
                    {
                        Cache: req.cacheTimings,
                        ...(dataKey === 'data'
                            ? { Statistics: cache.stats, Repositories: cache.repos, Gists: cache.gists }
                            : { Data: cache[dataKey] })
                    },
                    null,
                    prettyPrint ? 4 : undefined
                )
            );
};

//@ API to get cached data
app.get('/repos', (req, res) => sendApiResponse(req, res, 'repos'));
app.get('/stats', (req, res) => sendApiResponse(req, res, 'stats'));
app.get('/gists', (req, res) => sendApiResponse(req, res, 'gists'));
app.get('/data', (req, res) => sendApiResponse(req, res, 'data'));

//@ API to manually refresh the cache (Admin only)
app.get('/refresh', authenticateAdmin, async (req, res) =>
{
    console.log('Manual refresh requested by authorized user.');
    await fetchGitHubData();
    res.json({ message: 'Cache refreshed manually.', lastUpdated: cache.lastUpdated });
});

//@ Root Route (List Routes and Configurations)
app.get('/', (req, res) =>
{
    const response = {
        Message: 'Available routes',
        Routes: getRoutes(),
        Cache: req.cacheTimings,
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response, null, 4));
});


//! GitHub Fetching and Caching  ///////////////////////////////////////////////

const githubAPI = axios.create({
    baseURL: config.GITHUB.API_BASE_URL,
    headers: {
        Authorization: `token ${config.GITHUB.TOKEN}`,
    }
});

/**
 ** Fetch GitHub data and cache it in memory.
 */
const fetchGitHubData = async () =>
{
    return cache.isRefreshing
        ? null
        : (cache.isRefreshing = true,
            console.log('Fetching GitHub data...'),
            Promise.all([fetchRepos(), fetchGists()])
                .then(async ([reposResult, gistsResult]) =>
                {
                    cache.repos = reposResult;
                    cache.stats = generateStats(reposResult);
                    cache.gists = gistsResult;
                    cache.lastUpdated = new Date();
                    console.log(`Cache updated at ${cache.lastUpdated}`);
                })
                .catch((error) =>
                {
                    console.error('Error fetching GitHub data:', error);
                })
                .finally(() => { cache.isRefreshing = false; }));
};

/**
 ** Fetch repositories for the user.
 */
const fetchRepos = () =>
    githubAPI
        .get(`/users/${config.GITHUB.USERNAME}/repos?per_page=${config.GITHUB.REPOS_PER_PAGE}`)
        .then(response => getRepoDetails(response.data))
        .catch(error =>
        {
            console.error('Error fetching repositories:', error);
            return [];
        });

/**
 ** Fetch details for each repository.
 */
const getRepoDetails = (repos) =>
    Promise.all(
        repos.map(repo =>
            fetchCommits(repo.name, parseISO(repo.pushed_at))
                .then(commits => ({
                    ...filterRepoData(repo),
                    lastPushed: formatDistanceToNow(parseISO(repo.pushed_at), { addSuffix: true }),
                    commits
                }))
                .catch(error => (
                    console.error(`Error fetching commits for ${repo.name}:`, error),
                    {
                        ...filterRepoData(repo),
                        lastPushed: 'Unknown',
                        commits: []
                    }
                ))
        )
    ).catch(error => (
        console.error('Error processing repositories:', error),
        []
    ));

/**
 ** Fetch commits for a repository based on the last pushed date.
 */
const fetchCommits = (repoName, pushedDate) =>
{
    const commitCount = getCommitCount(pushedDate);
    return commitCount === 0
        ? Promise.resolve([])
        : githubAPI
            .get(`/repos/${config.GITHUB.USERNAME}/${repoName}/commits?per_page=${commitCount}`)
            .then(response => response.data.map(commit => ({
                sha: commit.sha,
                message: commit.commit.message,
                url: commit.html_url,
            })))
            .catch(error => (
                console.error(`Error fetching commits for ${repoName}:`, error.message),
                []
            ));
};

/**
 ** Fetch Gists for the user.
 */
const fetchGists = () =>
    githubAPI
        .get(`/users/${config.GITHUB.USERNAME}/gists`)
        .then(response =>
        {
            return response.data.map(gist =>
            {
                return {
                    id: gist.id,
                    description: gist.description,
                    files: Object.keys(gist.files),
                    htmlUrl: gist.html_url,
                    updatedAt: formatDistanceToNow(new Date(gist.updated_at), { addSuffix: true }),
                };
            });
        })
        .catch(error =>
        {
            console.error('Error fetching gists:', error);
            return [];
        });


//! Helper Functions  //////////////////////////////////////////////////////////

const filterRepoData = (repo) =>
    Object.fromEntries(
        Object.entries(repo).map(([key, value]) =>
            key === 'owner'
                ? [key, { login: value.login, avatar_url: value.avatar_url }]
                : ['name', 'full_name', 'description', 'html_url', 'homepage', 'language', 'stargazers_count', 'forks_count', 'pushed_at'].includes(key)
                    ? [key, value]
                    : null
        ).filter(Boolean)
    );

/**
 ** Calculate the number of commits to fetch based on the last pushed date.
 */
const getCommitCount = (pushedDate) =>
{
    const now = Date.now();
    return Object.values(config.COMMIT_FETCH_RULES).find(
        (rule) => now - pushedDate.getTime() < rule.threshold
    )?.commits || config.COMMIT_FETCH_RULES.OVER_YEAR.commits;
};

/**
 ** Calculate the top language used in the repositories.
 */
const calculateTopLanguage = (repos) =>
{
    const languageCount = {};
    repos.forEach(repo =>
    {
        repo.language
            ? (languageCount[repo.language] = (languageCount[repo.language] || 0) + 1)
            : null;
    });
    return Object.keys(languageCount).reduce((a, b) =>
        languageCount[a] > languageCount[b] ? a : b, 'Unknown');
};

/**
 ** Calculate language statistics for the repositories.
 */
const calculateLanguageStats = (repos) =>
{
    const languageCount = repos.reduce((acc, { language }) =>
        language ? { ...acc, [language]: (acc[language] || 0) + 1 } : acc, {});

    const languageStats = Object.entries(languageCount)
        .map(([lang, repos]) => ({ lang, repos }))
        .sort((a, b) => b.repos - a.repos);

    return {
        topLanguage: languageStats[0] ? [languageStats[0]] : [],
        languageStats
    };
};

/**
 ** Generate statistics based on the repositories data.
 */
const generateStats = (repos) => ({
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, { stargazers_count }) => sum + stargazers_count, 0),
    ...calculateLanguageStats(repos)
});

/**
 ** Calculate cache timings based on last updated time and refresh interval.
 */
const calculateCacheTimings = () =>
{
    const nextRefreshISO = cache.lastUpdated
        ? new Date(cache.lastUpdated.getTime() + config.CACHE.REFRESH_INTERVAL)
        : new Date(Date.now() + config.CACHE.REFRESH_INTERVAL);
    const lastUpdatedISO = cache.lastUpdated || new Date();
    const lastUpdated = cache.lastUpdated ? formatDistanceToNow(lastUpdatedISO, { addSuffix: true }) : 'Never';
    const nextRefresh = cache.lastUpdated ? formatDistanceToNow(nextRefreshISO, { addSuffix: true }) : 'Now';

    return {
        lastUpdatedISO,
        nextRefreshISO,
        lastUpdated,
        nextRefresh
    };
};

/**
 ** Get all the routes available in the application.
 */
const getRoutes = () =>
    app._router.stack.reduce((acc, middleware) =>
        middleware.route
            ? { ...acc, [middleware.route.path]: `Handle ${Object.keys(middleware.route.methods)[0].toUpperCase()} request` }
            : acc, {});


//! Server Setup and Initialization  ////////////////////////////////////////////

setTimeout(fetchGitHubData, config.CACHE.INITIAL_DELAY);
setInterval(fetchGitHubData, config.CACHE.REFRESH_INTERVAL);

app.listen(config.PORT, () =>
{
    console.log(`Server is running on port ${config.PORT}`);
});
