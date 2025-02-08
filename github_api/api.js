/*
 * File: c:\Users\tonyw\AppData\Local\Temp\scp01511\api.js
 * Project: c:\Users\tonyw\AppData\Local\Temp\scp23227
 * Created Date: Friday February 7th 2025
 * Author: Tony Wiedman
 * -----
 * Last Modified: Sat February 8th 2025 12:33:24 
 * Modified By: Tony Wiedman
 * -----
 * Copyright (c) 2025 MolexWorks
 */

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
        INITIAL_DELAY: 0,                                                       //!> Initial delay before fetching data in milliseconds
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

//@ In-memory cache object
let cache = {
    repos: [],                  //!> Cached repository data
    stats: [],                  //!> Cached statistics
    gists: [],                  //!> Cached gists
    lastUpdated: new Date(),    //!> Timestamp of last cache update
    isRefreshing: false,        //!> Flag to prevent concurrent cache refreshes
};

//@ GitHub Headers for API requests
const githubHeaders = {
    Authorization: `token ${config.GITHUB.TOKEN}`,
};

//@ CORS setup
app.use(cors({
    origin: function (origin, callback)
    {
        if (!origin || config.CORS.ALLOWED_ORIGINS.includes(origin))
        {
            callback(null, true);
        } else
        {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
}));


//! Middleware  ////////////////////////////////////////////////////////////////

/**
 * Middleware to authenticate admin requests.
 * @returns {Response} 403 Forbidden if token is invalid or missing.
 * @returns {Function} next() if token is valid.
 */
const authenticateAdmin = (req, res, next) =>
{
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    const validToken = config.AUTH.ADMIN_REFRESH_TOKEN;

    if (authHeader && authHeader === `Bearer ${validToken}`)
    {
        return next();
    }

    if (queryToken && queryToken === validToken)
    {
        return next();
    }

    return res.status(403).json({ message: 'Forbidden: Invalid or missing token.' });
};

/**
 * Middleware to calculate cache timings for each request.
 * @returns {Object} Object containing next refresh time, and formatted last updated and next refresh times.
 */
const cacheTimingMiddleware = (req, res, next) =>
{
    req.cacheTimings = calculateCacheTimings();
    next();
};

app.use(cacheTimingMiddleware);


//! API Routes  //////////////////////////////////////////////////////////////

/**
 * Send API response based on the data key provided.
 * @param {String} dataKey Key to access the data from cache
 * @returns {Response} JSON response with the data from cache.
 */
const sendApiResponse = (req, res, dataKey) =>
{
    const prettyPrint = req.query.pretty === 'true';

    const responseData = {
        Cache: req.cacheTimings,
    };

    if (cache.repos && cache.stats && cache.gists)
    {
        if (dataKey === 'data')
        {
            responseData.Statistics = cache.stats;
            responseData.Repositories = cache.repos;
            responseData.Gists = cache.gists;
        }
        else 
        {
            responseData.Data = cache[dataKey];
        }

        if (prettyPrint) 
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(responseData, null, 4));
        }
        else 
        {
            res.json(responseData);
        }
    }
    else 
    {
        res.status(503).json({ message: 'Data is being fetched, please try again shortly.' });
    }
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

/**
 * Fetch GitHub data and cache it in memory.
 * @returns {Promise} Promise that resolves when the GitHub data is fetched and cached.
 */
const fetchGitHubData = async () =>
{
    if (cache.isRefreshing) return;

    try
    {
        cache.isRefreshing = true;
        console.log('Fetching GitHub data...');

        const reposResponse = await axios.get(
            `${config.GITHUB.API_BASE_URL}/users/${config.GITHUB.USERNAME}/repos?per_page=${config.GITHUB.REPOS_PER_PAGE}`,
            { headers: githubHeaders }
        );
        const repos = reposResponse.data;

        const repoDetails = await Promise.all(
            repos.map(async (repo) =>
            {
                const pushedAt = repo.pushed_at;
                const formattedLastPushed = formatDistanceToNow(parseISO(pushedAt), { addSuffix: true });
                const pushedDate = new Date(pushedAt);

                let commits = [];
                const commitCount = getCommitCountBasedOnThreshold(pushedDate);

                if (commitCount > 0)
                {
                    const commitsResponse = await axios.get(
                        `${config.GITHUB.API_BASE_URL}/repos/${config.GITHUB.USERNAME}/${repo.name}/commits?per_page=${commitCount}`,
                        { headers: githubHeaders }
                    );
                    commits = commitsResponse.data.map(commit => ({
                        sha: commit.sha,
                        message: commit.commit.message,
                        url: commit.html_url,
                    }));
                }

                return {
                    projectName: repo.name,
                    pushedAt,
                    lastPushed: formattedLastPushed,
                    fullName: repo.full_name,
                    description: repo.description,
                    avatar: repo.owner.avatar_url,
                    name: repo.owner.login,
                    url: repo.html_url,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    commits,
                };
            })
        );

        let gistDetails = [];
        try
        {
            const gistsResponse = await axios.get(
                `${config.GITHUB.API_BASE_URL}/users/${config.GITHUB.USERNAME}/gists`,
                { headers: githubHeaders }
            );
            gistDetails = gistsResponse.data.map(gist => ({
                id: gist.id,
                description: gist.description,
                createdAt: gist.created_at,
                updatedAt: gist.updated_at,
                gistUrl: gist.html_url,
                files: Object.keys(gist.files),
            }));
        } catch (error)
        {
            console.error('Error fetching gists:', error);
        }

        cache.repos = repoDetails;
        cache.stats = {
            totalRepos: repoDetails.length,
            totalStars: cache.repos.reduce((sum, repo) => sum + repo.stars, 0),
            topLanguage: calculateTopLanguage(repoDetails),
        };
        cache.gists = gistDetails;
        cache.lastUpdated = new Date();
        console.log(`Cache updated at ${cache.lastUpdated}`);
    } catch (error)
    {
        console.error('Error fetching repos:', error);
    } finally
    {
        cache.isRefreshing = false;
    }
};


//! Helper Functions  //////////////////////////////////////////////////////////

/**
 * Calculate the number of commits to fetch based on the last pushed date.
 * @param {Date} pushedDate Date object of the last pushed date.
 * @returns {Number} Number of commits to fetch.
 */
const getCommitCountBasedOnThreshold = (pushedDate) =>
{
    const now = Date.now();

    for (const ruleKey in config.COMMIT_FETCH_RULES)
    {
        const rule = config.COMMIT_FETCH_RULES[ruleKey];

        if (now - pushedDate.getTime() < rule.threshold)
        {
            return rule.commits;
        }
    }

    return config.COMMIT_FETCH_RULES.OVER_YEAR.commits;
};

/**
 * Calculate the top language used in the repositories.
 * @param {Array} repos Array of repository objects.
 * @returns {String} Name of the top language.
 */
const calculateTopLanguage = (repos) =>
{
    const languageCount = {};
    repos.forEach(repo =>
    {
        if (repo.language)
        {
            languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
    });
    return Object.keys(languageCount).reduce((a, b) => languageCount[a] > languageCount[b] ? a : b, 'Unknown');
};

/**
 * Calculate cache timings based on last updated time and refresh interval.
 * @returns {Object} Object containing next refresh time, and formatted last updated and next refresh times.
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
 * Get all the routes available in the application.
 * @returns {Object} Object containing all available routes and their descriptions.
 */
const getRoutes = () =>
{
    const routes = [];

    app._router.stack.forEach((middleware) =>
    {
        if (middleware.route)
        {
            routes.push({
                method: Object.keys(middleware.route.methods)[0].toUpperCase(),
                path: middleware.route.path
            });
        }
    });

    return routes.reduce((acc, route) =>
    {
        acc[route.path] = `Handle ${route.method} request`;
        return acc;
    }, {});
};

//! Server Setup and Initialization  ////////////////////////////////////////////

setTimeout(fetchGitHubData, config.CACHE.INITIAL_DELAY);
setInterval(fetchGitHubData, config.CACHE.REFRESH_INTERVAL);

app.listen(config.PORT, () =>
{
    console.log(`Server is running on port ${config.PORT}`);
});
