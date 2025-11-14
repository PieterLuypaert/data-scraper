const puppeteer = require('puppeteer');
const axios = require('axios');
const config = require('../config');

/**
 * Wait for specified milliseconds (compatible with all Puppeteer versions)
 * @param {object} page - Puppeteer page object
 * @param {number} ms - Milliseconds to wait
 */
async function wait(page, ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scroll page to trigger lazy-loaded content
 * @param {object} page - Puppeteer page object
 * @param {number} passes - Number of scroll passes
 */
async function scrollPage(page, passes = 3) {
  for (let scrollPass = 0; scrollPass < passes; scrollPass++) {
    console.log(`Scroll pass ${scrollPass + 1}/${passes}`);
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 50;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight || (currentScroll + distance >= scrollHeight)) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
    });
    
    await wait(page, config.TIMEOUTS.scrollWait);
    
    // Trigger intersection observer for lazy loading
    await page.evaluate(() => {
      const images = document.querySelectorAll('img[data-src], img[data-lazy-src], img[data-original], img[loading="lazy"]');
      images.forEach(img => {
        img.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
    });
    
    await wait(page, config.TIMEOUTS.cookieWait);
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Force load lazy images
 * @param {object} page - Puppeteer page object
 */
async function forceLoadLazyImages(page) {
  console.log('Forcing lazy images to load...');
  await page.evaluate(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.src && img.dataset.src) {
        img.src = img.dataset.src;
      }
      if (!img.src && img.dataset.lazySrc) {
        img.src = img.dataset.lazySrc;
      }
      if (!img.src && img.dataset.original) {
        img.src = img.dataset.original;
      }
      if (!img.src && img.dataset.image) {
        img.src = img.dataset.image;
      }
      img.loading = 'eager';
    });
  });
  await wait(page, config.TIMEOUTS.imageLoad);
}

/**
 * Try to close cookie banners
 * @param {object} page - Puppeteer page object
 */
async function handleCookieBanner(page) {
  console.log('Checking for cookie banners or overlays...');
  try {
    for (const selector of config.COOKIE_SELECTORS) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`Found cookie button with selector: ${selector}`);
          await button.click();
          await wait(page, config.TIMEOUTS.cookieWait);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
  } catch (e) {
    console.log('No cookie banner found or error closing it:', e.message);
  }
}

/**
 * Wait for images to load
 * @param {object} page - Puppeteer page object
 */
async function waitForImages(page) {
  console.log('Waiting for images to load...');
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        }))
    );
  });
}

/**
 * Scrape a URL using Puppeteer
 * @param {string} url - URL to scrape
 * @returns {Promise<{htmlContent: string, finalUrl: string}>}
 */
async function scrapeWithPuppeteer(url) {
  console.log(`Using Puppeteer for ${new URL(url).hostname} - URL: ${url}`);
  let browser;
  
  try {
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      ...config.PUPPETEER
    });
    
    console.log('Browser launched, creating new page...');
    const page = await browser.newPage();
    
    // Remove webdriver property to avoid detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });
      delete window.chrome;
      window.chrome = { runtime: {} };
    });
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(config.USER_AGENT);
    await page.setExtraHTTPHeaders(config.BROWSER_HEADERS);
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation
    });
    
    console.log('Page loaded, waiting for dynamic content...');
    
    // Scroll to trigger lazy-loaded content
    await scrollPage(page, 3);
    
    // Wait for lazy-loaded images/content
    await wait(page, config.TIMEOUTS.imageLoad);
    
    // Force load lazy images
    await forceLoadLazyImages(page);
    
    // Handle cookie banners
    await handleCookieBanner(page);
    
    // Wait for content to load after interactions
    await wait(page, config.TIMEOUTS.imageLoad);
    
    // Try to wait for common content selectors
    try {
      await page.waitForSelector('body', { timeout: config.TIMEOUTS.selector });
      console.log('Body selector found');
    } catch (e) {
      console.log('Body selector not found, continuing anyway');
    }
    
    // Wait for images to load
    await waitForImages(page);
    
    // Final wait for any remaining dynamic content
    await wait(page, config.TIMEOUTS.imageLoad);
    
    // Get the final URL after redirects
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // Get the HTML content
    const htmlContent = await page.content();
    console.log(`HTML content length: ${htmlContent.length} characters`);
    
    // Take screenshot before closing browser
    console.log('Taking screenshot...');
    let screenshot = null;
    try {
      screenshot = await page.screenshot({
        type: 'png',
        fullPage: true, // Capture entire page, not just viewport
        encoding: 'base64' // Return as base64 string
      });
      console.log(`Screenshot captured successfully (${screenshot ? screenshot.length : 0} characters)`);
    } catch (screenshotError) {
      console.error('Error taking screenshot:', screenshotError.message);
      console.error('Screenshot error stack:', screenshotError.stack);
      // Continue without screenshot if it fails
    }
    
    await browser.close();
    console.log('Browser closed successfully');
    
    return { 
      htmlContent, 
      finalUrl,
      screenshot: screenshot ? `data:image/png;base64,${screenshot}` : null
    };
    
  } catch (puppeteerError) {
    console.error('Puppeteer error details:', {
      message: puppeteerError.message,
      stack: puppeteerError.stack,
      name: puppeteerError.name
    });
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    // Provide more specific error message
    let errorMsg = `Puppeteer error: ${puppeteerError.message}`;
    if (puppeteerError.message.includes('Target closed')) {
      errorMsg = 'Browser werd gesloten voordat de pagina kon worden geladen. Probeer het opnieuw.';
    } else if (puppeteerError.message.includes('Navigation timeout')) {
      errorMsg = 'Timeout: De website reageert niet snel genoeg. Probeer het later opnieuw.';
    } else if (puppeteerError.message.includes('net::ERR')) {
      errorMsg = `Netwerk error: ${puppeteerError.message}`;
    }
    
    // If Puppeteer fails, try fallback to axios
    console.log('Puppeteer failed, trying fallback with axios...');
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': config.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        maxRedirects: 5
      });
      const finalUrl = response.request.res.responseUrl || url;
      const htmlContent = response.data;
      console.log('Fallback axios request successful');
      return { htmlContent, finalUrl };
    } catch (axiosError) {
      throw new Error(errorMsg);
    }
  }
}

module.exports = {
  scrapeWithPuppeteer
};

