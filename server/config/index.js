module.exports = {
  PORT: process.env.PORT || 3001,
  
  // Sites that typically require JavaScript rendering
  JS_HEAVY_SITES: ['bol.com', 'amazon', 'coolblue', 'mediamarkt', 'wehkamp', 'zalando'],
  
  // Puppeteer configuration
  PUPPETEER: {
    args: [
      // Sandbox stays ENABLED by default (secure). It can only be disabled
      // explicitly via PUPPETEER_NO_SANDBOX=true for environments where the
      // sandbox cannot run (e.g. Docker / Linux-as-root). Do NOT disable it
      // casually: it is the primary defense when rendering untrusted pages.
      ...(process.env.PUPPETEER_NO_SANDBOX === 'true'
        ? ['--no-sandbox', '--disable-setuid-sandbox']
        : []),
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor'
      // Removed for security: --disable-web-security and
      // --disable-features=IsolateOrigins,site-per-process weakened the
      // browser's same-origin / site-isolation protections with no scraping
      // benefit (we only read the rendered DOM).
    ],
    // Kept true so sites with invalid/self-signed certificates can still be
    // scraped; disabling this would break legitimate functionality.
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
  },

  // Proxy configuration
  PROXY: {
    // Enable proxy support (set to false to disable)
    enabled: process.env.PROXY_ENABLED === 'true' || false,
    
    // Proxy list - can be array of objects or strings
    // Format 1: { host: 'proxy.example.com', port: 8080, username: 'user', password: 'pass', protocol: 'http' }
    // Format 2: 'http://user:pass@proxy.example.com:8080'
    proxies: process.env.PROXIES ? JSON.parse(process.env.PROXIES) : [],
    
    // Health check settings
    healthCheckInterval: 5, // minutes
    healthCheckTimeout: 10000, // milliseconds
    healthCheckUrl: 'https://www.google.com',
    maxConsecutiveFailures: 3,
    
    // Rotation settings
    rotationEnabled: true,
    failoverEnabled: true
  }
};

