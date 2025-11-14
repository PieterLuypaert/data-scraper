const { crawlWebsite } = require('../scrapers/crawler');

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
      followExternalLinks: options?.followExternalLinks || false
    };

    console.log(`Starting crawl with options:`, crawlOptions);

    const result = await crawlWebsite(url, crawlOptions);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
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

module.exports = {
  handleCrawl
};

