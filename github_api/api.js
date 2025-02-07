require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { formatDistanceToNow, parseISO } = require('date-fns');

const app = express();

/**
 *@ Configuration Object
 */
const config = {
    PORT: process.env.PORT || 3330,             //!> Port to run the server on
    GITHUB: {
        TOKEN: process.env.GITHUB_TOKEN,        //!> Personal access token with repo access
        USERNAME: process.env.GITHUB_USERNAME,  //!> GitHub username to fetch repos for
        API_BASE_URL: 'https://api.github.com', //!> GitHub API base URL
        REPOS_PER_PAGE: 100,                    //!> Number of repos to fetch per page
    },
    CACHE: {
        REFRESH_INTERVAL: 5 * 60 * 1000,     //!> 5 minutes in milliseconds (For testing)
        // REFRESH_INTERVAL: 60 * 60 * 1000,       //!> 1 hour in milliseconds
        INITIAL_DELAY: 0,                       //!> Optional: delay before the first fetch (in ms)
    },
    CORS: {
        ALLOWED_ORIGINS: ['http://localhost:4200', 'https://molexworks.com'],
    },
    COMMIT_FETCH_RULES: {
        MONTH: { threshold: 30 * 24 * 60 * 60 * 1000, commits: 5 },                //!> 30 days in milliseconds
        THREE_MONTHS: { threshold: 3 * 30 * 24 * 60 * 60 * 1000, commits: 5 },     //!> 3 months in milliseconds
        SIX_MONTHS: { threshold: 6 * 30 * 24 * 60 * 60 * 1000, commits: 3 },       //!> 6 months in milliseconds
        YEAR: { threshold: 12 * 30 * 24 * 60 * 60 * 1000, commits: 3 },            //!> 12 months in milliseconds
        OVER_YEAR: { threshold: Infinity, commits: 1 },                            //!> More than a year gets 1 commit
    },
    AUTH: {
        ADMIN_REFRESH_TOKEN: process.env.ADMIN_REFRESH_TOKEN,                       //!> Token for manual refresh authentication
    }
};

//@ In-memory cache object
let cache = {
    data: null,             //!> Cached GitHub data
    lastUpdated: null,      //!> Last updated timestamp
    isRefreshing: false,    //!> Flag to prevent overlapping refreshes
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

/**
 *@ Fetch GitHub data and update the cache
 */
const fetchGitHubData = async () =>
{
    if (cache.isRefreshing) return;  //* Prevent overlapping refreshes

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
                let commitCount = 0;
                const now = Date.now();

                if (now - pushedDate.getTime() < config.COMMIT_FETCH_RULES.MONTH.threshold)
                {
                    commitCount = config.COMMIT_FETCH_RULES.MONTH.commits;
                } else if (now - pushedDate.getTime() < config.COMMIT_FETCH_RULES.THREE_MONTHS.threshold)
                {
                    commitCount = config.COMMIT_FETCH_RULES.THREE_MONTHS.commits;
                } else if (now - pushedDate.getTime() < config.COMMIT_FETCH_RULES.SIX_MONTHS.threshold)
                {
                    commitCount = config.COMMIT_FETCH_RULES.SIX_MONTHS.commits;
                } else if (now - pushedDate.getTime() < config.COMMIT_FETCH_RULES.YEAR.threshold)
                {
                    commitCount = config.COMMIT_FETCH_RULES.YEAR.commits;
                } else
                {
                    commitCount = config.COMMIT_FETCH_RULES.OVER_YEAR.commits;
                }

                /**
                * @Fetch commits
                * 
                *? If the repo was last pushed:
                ** - Within a month: 5 commits
                ** - Within 3 months: 5 commits
                ** - Within 6 months: 3 commits
                ** - Within a year: 3 commits
                ** - Over a year: 1 commit
                */
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

        //* Update cache
        cache.data = repoDetails;
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

/**
 *@ API to get repository data with automatic stale check
 */
app.get('/api/repos', (req, res) =>
{
    const nextRefresh = new Date(cache.lastUpdated.getTime() + config.CACHE.REFRESH_INTERVAL);
    const formattedLastUpdated = cache.lastUpdated ? formatDistanceToNow(cache.lastUpdated, { addSuffix: true }) : 'Never';
    const formattedNextRefresh = formatDistanceToNow(nextRefresh, { addSuffix: true });

    //* If cache data is available, serve it
    if (cache.data)
    {
        res.json({
            data: cache.data,
            lastUpdated: {
                timestamp: cache.lastUpdated.toISOString(),
                formatted: formattedLastUpdated,
            },
            nextRefresh: {
                timestamp: nextRefresh.toISOString(),
                formatted: formattedNextRefresh,
            },
        });
    }
    else
    {
        //* If cache is empty, return a 503 response
        res.status(503).json({ message: 'Data is being fetched, please try again shortly.' });
    }
});

//@ Middleware to authenticate admin requests via Authorization header or query param
const authenticateAdmin = (req, res, next) =>
{
    const authHeader = req.headers.authorization;
    const queryToken = req.query.token;
    const validToken = config.AUTH.ADMIN_REFRESH_TOKEN;

    //* Check Authorization header (Bearer token)
    if (authHeader && authHeader === `Bearer ${validToken}`)
    {
        return next();
    }

    //* Check token in query parameter
    if (queryToken && queryToken === validToken)
    {
        return next();
    }

    return res.status(403).json({ message: 'Forbidden: Invalid or missing token.' });
};

/**
 *@ Manual cache refresh endpoint (protected)
 *@ Requires Authorization header with Bearer token or query parameter
 */
app.get('/api/refresh', authenticateAdmin, async (req, res) =>
{
    console.log('Manual refresh requested by authorized user.');
    await fetchGitHubData();
    res.json({ message: 'Cache refreshed manually.', lastUpdated: cache.lastUpdated });
});

//@ Initial fetch on server start with optional delay
setTimeout(fetchGitHubData, config.CACHE.INITIAL_DELAY);

//@ Automatic background refresh every hour
setInterval(fetchGitHubData, config.CACHE.REFRESH_INTERVAL);

app.listen(config.PORT, () =>
{
    console.log(`Server is running on port ${config.PORT}`);
});
