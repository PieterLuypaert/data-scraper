const { crawlWebsite } = require('../scrapers/crawler');
const { assertSafeUrl } = require('../utils/ssrfGuard');
const { sendError } = require('../utils/errorResponse');

// Store progress for each crawl session
const crawlProgress = new Map();

// Resource limits to prevent abuse / memory exhaustion
const MAX_PAGES = Number(process.env.CRAWL_MAX_PAGES) || 100;
const MAX_DEPTH = 10;
const MAX_DELAY = 60000;
const MAX_CONCURRENT_CRAWLS = Number(process.env.CRAWL_MAX_CONCURRENT) || 2;
const MAX_SESSIONS = 100;
let activeCrawls = 0;

/** Clamp a numeric option into [min, max], falling back to a default. */
function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Evict the oldest session(s) so the progress Map can never grow unbounded. */
function pruneSessions() {
  while (crawlProgress.size >= MAX_SESSIONS) {
    const oldest = crawlProgress.keys().next().value;
    if (oldest === undefined) break;
    crawlProgress.delete(oldest);
  }
}

/**
 * Progress endpoint for crawl progress (polling-based)
 */
function handleCrawlProgress(req, res) {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const progress = crawlProgress.get(sessionId);
  
  if (!progress) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Return current progress as JSON
  res.json({
    current: progress.current || 0,
    total: progress.total || 0,
    message: progress.message || 'In progress...',
    currentUrl: progress.currentUrl || null,
    completed: progress.completed || false,
    error: progress.error || false
  });
}

/**
 * Crawl route handler - scrapes all pages of a website
 */
async function handleCrawl(req, res) {
  const { url, options } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  let validUrl;
  try {
    validUrl = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // SSRF protection: reject private/internal targets and non-http(s) schemes
  try {
    await assertSafeUrl(url);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Limit concurrent crawls to protect CPU/memory (each spawns Puppeteer).
  if (activeCrawls >= MAX_CONCURRENT_CRAWLS) {
    return res.status(429).json({
      success: false,
      error: `Too many concurrent crawls (max ${MAX_CONCURRENT_CRAWLS}). Please wait and try again.`,
    });
  }

  // Generate session ID
  const sessionId = `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  pruneSessions();

  // Initialize progress
  crawlProgress.set(sessionId, {
    current: 0,
    total: clamp(options?.maxPages, 1, MAX_PAGES, 50),
    message: 'Starting crawl...',
    currentUrl: url
  });

  try {
    // Default crawl options (with hard server-side caps)
    const crawlOptions = {
      maxPages: clamp(options?.maxPages, 1, MAX_PAGES, 50),
      maxDepth: clamp(options?.maxDepth, 1, MAX_DEPTH, 3),
      sameDomain: options?.sameDomain !== false, // Default true
      includeSubdomains: options?.includeSubdomains || false,
      excludePatterns: options?.excludePatterns || [
        '/login',
        '/logout',
        '/register',
        '/signup',
        '/signin',
        '/cart',
        '/checkout',
        '/admin',
        '/api/',
        '.pdf',
        '.jpg',
        '.png',
        '.gif',
        '.zip',
        '.exe',
        '.mp4',
        '.mp3'
      ],
      delay: clamp(options?.delay, 0, MAX_DELAY, 1000), // ms between requests
      followExternalLinks: options?.followExternalLinks || false,
      onProgress: (current, total, message, currentUrl) => {
        const progressData = {
          current: Math.max(0, current),
          total: Math.max(1, total),
          message: message || 'Crawling...',
          currentUrl: currentUrl || null,
          completed: false,
          error: false
        };
        crawlProgress.set(sessionId, progressData);
        console.log(`Progress [${sessionId}]: ${current}/${total} - ${message}`);
      }
    };

    console.log(`Starting crawl with options:`, crawlOptions);

    // Start crawl in background
    activeCrawls++;
    crawlWebsite(url, crawlOptions)
      .then(result => {
        crawlProgress.set(sessionId, {
          current: result.totalPages,
          total: result.totalPages,
          message: `Crawl completed! Scraped ${result.totalPages} pages.`,
          completed: true,
          result: result
        });
      })
      .catch(error => {
        crawlProgress.set(sessionId, {
          current: 0,
          total: crawlOptions.maxPages,
          message: 'Crawl failed.',
          error: true
        });
        console.error(`Crawl ${sessionId} failed:`, error);
      })
      .finally(() => {
        activeCrawls = Math.max(0, activeCrawls - 1);
        // Schedule cleanup regardless of outcome so sessions never leak.
        setTimeout(() => crawlProgress.delete(sessionId), 30000);
      });

    // Return immediately with session ID
    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Crawl started. Use /api/crawl/progress?sessionId=' + sessionId + ' to track progress.'
    });

  } catch (error) {
    crawlProgress.delete(sessionId);
    sendError(res, 500, error, 'Failed to start crawl');
  }
}

/**
 * Get crawl result by session ID
 */
function handleCrawlResult(req, res) {
  const { sessionId } = req.query;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const progress = crawlProgress.get(sessionId);
  
  if (!progress) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (progress.completed && progress.result) {
    res.json({
      success: true,
      data: progress.result
    });
  } else if (progress.error) {
    res.status(500).json({
      success: false,
      error: progress.message
    });
  } else {
    res.json({
      success: false,
      message: 'Crawl still in progress',
      progress: {
        current: progress.current,
        total: progress.total,
        message: progress.message
      }
    });
  }
}

module.exports = {
  handleCrawl,
  handleCrawlProgress,
  handleCrawlResult
};
