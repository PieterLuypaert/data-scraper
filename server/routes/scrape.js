const { scrapeWithPuppeteer } = require('../scrapers/puppeteerScraper');
const { scrapeWithCheerio } = require('../scrapers/cheerioScraper');
const { extractAllData } = require('../scrapers/dataExtractors');
const { needsPuppeteer, mapScrapingError } = require('../utils/helpers');
const { assertSafeUrl } = require('../utils/ssrfGuard');
const { sendError } = require('../utils/errorResponse');
const config = require('../config');

/**
 * Main scrape route handler
 */
async function handleScrape(req, res) {
  const { url, forcePuppeteer } = req.body;

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

  try {
    let htmlContent, finalUrl;
    
    // Determine which scraper to use
    // Use Puppeteer if forced, or if site is in JS_HEAVY_SITES list
    const usePuppeteer = forcePuppeteer || needsPuppeteer(url, config.JS_HEAVY_SITES);
    
    let result;
    if (usePuppeteer) {
      // Pass forcePuppeteer flag to enable screenshot-friendly settings
      result = await scrapeWithPuppeteer(url, forcePuppeteer);
      htmlContent = result.htmlContent;
      finalUrl = result.finalUrl;
    } else {
      try {
        result = await scrapeWithCheerio(url);
        htmlContent = result.htmlContent;
        finalUrl = result.finalUrl;
      } catch (cheerioError) {
        // The lightweight (axios) request is the easiest to detect and block.
        // When a site rejects it with a typical anti-bot status, retry once
        // with the real (stealth) browser, which passes many basic checks that
        // axios can't. Sites with full challenges/CAPTCHAs still fail — those
        // are intentionally not bypassed.
        const blockedStatus = cheerioError?.response?.status;
        const isBlocked = [403, 429, 503].includes(blockedStatus);
        if (!isBlocked) throw cheerioError;

        console.log(`Cheerio blocked (HTTP ${blockedStatus}); retrying with stealth browser...`);
        result = await scrapeWithPuppeteer(url, forcePuppeteer);
        htmlContent = result.htmlContent;
        finalUrl = result.finalUrl;
      }
    }

    // Extract all data from HTML
    const scrapedData = extractAllData(htmlContent, finalUrl);
    
    // Add screenshot if available (only from Puppeteer)
    if (usePuppeteer && result.screenshot) {
      scrapedData.screenshot = result.screenshot;
      console.log('Screenshot added to scraped data');
    } else {
      console.log('No screenshot available (usePuppeteer:', usePuppeteer, ', hasScreenshot:', !!result.screenshot, ')');
    }

    res.json({
      success: true,
      data: scrapedData
    });

  } catch (error) {
    sendError(res, 500, error, mapScrapingError(error));
  }
}

module.exports = {
  handleScrape
};

