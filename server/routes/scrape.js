const { scrapeWithPuppeteer } = require('../scrapers/puppeteerScraper');
const { scrapeWithCheerio } = require('../scrapers/cheerioScraper');
const { extractAllData } = require('../scrapers/dataExtractors');
const { needsPuppeteer } = require('../utils/helpers');
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
      result = await scrapeWithCheerio(url);
      htmlContent = result.htmlContent;
      finalUrl = result.finalUrl;
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
    console.error('=== SCRAPING ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    console.error('======================');
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to scrape website';
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Check for specific error types
    if (error.message && error.message.includes('net::ERR')) {
      if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Verbinding geweigerd: De website is mogelijk niet bereikbaar of blokkeert de verbinding.';
      } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        errorMessage = 'DNS error: De website kan niet worden gevonden. Controleer of de URL correct is.';
      } else if (error.message.includes('ERR_SSL')) {
        errorMessage = 'SSL error: Er is een probleem met het SSL certificaat van de website.';
      } else {
        errorMessage = `Netwerk error: ${error.message}`;
      }
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Timeout: De website reageert niet snel genoeg. Probeer het later opnieuw.';
    } else if (error.message && error.message.includes('Navigation failed')) {
      errorMessage = 'Navigatie gefaald: De website kan niet worden geladen. Mogelijk wordt scraping geblokkeerd.';
    } else if (error.message && error.message.includes('Protocol error')) {
      errorMessage = 'Protocol error: Er is een probleem met de verbinding. Probeer het opnieuw.';
    } else if (error.message && error.message.includes('Puppeteer error')) {
      errorMessage = error.message; // Keep Puppeteer error as-is
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
  handleScrape
};

