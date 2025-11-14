module.exports = {
  PORT: process.env.PORT || 3001,
  
  // Sites that typically require JavaScript rendering
  JS_HEAVY_SITES: ['bol.com', 'amazon', 'coolblue', 'mediamarkt', 'wehkamp', 'zalando'],
  
  // Puppeteer configuration
  PUPPETEER: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ],
    ignoreHTTPSErrors: true,
    timeout: 60000
  },
  
  // Browser headers
  BROWSER_HEADERS: {
    'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0'
  },
  
  // User agent
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  
  // Cookie banner selectors
  COOKIE_SELECTORS: [
    'button[id*="accept"]',
    'button[class*="accept"]',
    'button[id*="cookie"]',
    'button[class*="cookie"]',
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '.cookie-banner button',
    '#cookie-banner button'
  ],
  
  // Scraping timeouts
  TIMEOUTS: {
    navigation: 60000, // 60 seconds default
    navigationScreenshot: 180000, // 3 minutes for screenshots
    selector: 5000,
    imageLoad: 2000,
    scrollWait: 1500,
    cookieWait: 1000
  }
};

