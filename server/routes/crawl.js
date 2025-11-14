const { crawlWebsite } = require('../scrapers/crawler');

// Store progress for each crawl session
const crawlProgress = new Map();

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

  // Generate session ID
  const sessionId = `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Initialize progress
  crawlProgress.set(sessionId, {
    current: 0,
    total: options?.maxPages || 50,
    message: 'Starting crawl...',
    currentUrl: url
  });

  try {
    // Default crawl options
    const crawlOptions = {
      maxPages: options?.maxPages || 50,
      maxDepth: options?.maxDepth || 3,
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
      delay: options?.delay || 1000, // 1 second delay between requests
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
    crawlWebsite(url, crawlOptions)
      .then(result => {
        crawlProgress.set(sessionId, {
          current: result.totalPages,
          total: result.totalPages,
          message: `Crawl completed! Scraped ${result.totalPages} pages.`,
          completed: true,
          result: result
        });
        
        // Clean up after 30 seconds
        setTimeout(() => {
          crawlProgress.delete(sessionId);
        }, 30000);
      })
      .catch(error => {
        crawlProgress.set(sessionId, {
          current: 0,
          total: crawlOptions.maxPages,
          message: `Error: ${error.message}`,
          error: true
        });
        
        setTimeout(() => {
          crawlProgress.delete(sessionId);
        }, 30000);
      });

    // Return immediately with session ID
    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Crawl started. Use /api/crawl/progress?sessionId=' + sessionId + ' to track progress.'
    });

  } catch (error) {
    crawlProgress.delete(sessionId);
    console.error('=== CRAWL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('===================');
    
    let errorMessage = 'Failed to crawl website';
    if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      message: error.message,
      name: error.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
