const { scrapeWithPuppeteer } = require('./puppeteerScraper');
const { scrapeWithCheerio } = require('./cheerioScraper');
const { extractAllData } = require('./dataExtractors');
const { needsPuppeteer } = require('../utils/helpers');
const { toAbsoluteUrl } = require('../utils/helpers');
const config = require('../config');
const cheerio = require('cheerio');

/**
 * Crawl a website and scrape all pages
 * @param {string} startUrl - Starting URL
 * @param {object} options - Crawl options
 * @returns {Promise<object>} All scraped pages data
 */
async function crawlWebsite(startUrl, options = {}) {
  const {
    maxPages = 50,           // Maximum number of pages to scrape
    maxDepth = 3,            // Maximum depth to crawl
    sameDomain = true,       // Only crawl same domain
    includeSubdomains = false, // Include subdomains
    excludePatterns = [],    // URL patterns to exclude (e.g., ['/login', '/logout'])
    delay = 1000,           // Delay between requests (ms)
    followExternalLinks = false, // Follow external links
    onProgress = null        // Progress callback function
  } = options;

  const visitedUrls = new Set();
  const scrapedPages = [];
  const queue = [{ url: startUrl, depth: 0 }];
  const baseDomain = new URL(startUrl).hostname;

  console.log(`Starting crawl of ${startUrl}`);
  console.log(`Max pages: ${maxPages}, Max depth: ${maxDepth}`);

  // Initial progress update
  if (onProgress) {
    onProgress(0, maxPages, `Starting crawl of ${startUrl}...`, startUrl);
  }

  while (queue.length > 0 && scrapedPages.length < maxPages) {
    const { url, depth } = queue.shift();

    // Skip if already visited or too deep
    if (visitedUrls.has(url) || depth > maxDepth) {
      // Update progress even when skipping
      if (onProgress && visitedUrls.has(url)) {
        onProgress(scrapedPages.length, maxPages, `Skipping duplicate: ${url}`, url);
      }
      continue;
    }

    // Check if URL should be excluded
    if (excludePatterns.some(pattern => url.includes(pattern))) {
      console.log(`Skipping excluded URL: ${url}`);
      continue;
    }

    // Check domain restrictions
    try {
      const urlDomain = new URL(url).hostname;
      if (sameDomain) {
        if (includeSubdomains) {
          // Check if it's the same base domain or subdomain
          const baseDomainParts = baseDomain.split('.');
          const urlDomainParts = urlDomain.split('.');
          const baseMain = baseDomainParts.slice(-2).join('.');
          const urlMain = urlDomainParts.slice(-2).join('.');
          
          if (baseMain !== urlMain && urlDomain !== baseDomain) {
            if (!followExternalLinks) {
              console.log(`Skipping external URL: ${url}`);
              continue;
            }
          }
        } else {
          // Exact domain match only
          if (urlDomain !== baseDomain) {
            if (!followExternalLinks) {
              console.log(`Skipping external URL: ${url}`);
              continue;
            }
          }
        }
      }
    } catch (e) {
      console.log(`Invalid URL, skipping: ${url}`);
      continue;
    }

    // Mark as visited
    visitedUrls.add(url);

    try {
      const currentPage = scrapedPages.length + 1;
      console.log(`[${currentPage}/${maxPages}] Scraping (depth ${depth}): ${url}`);

      // Update progress
      if (onProgress) {
        onProgress(currentPage, maxPages, `Scraping page ${currentPage}/${maxPages}: ${url}`, url);
      }

      // Determine which scraper to use
      const usePuppeteer = needsPuppeteer(url, config.JS_HEAVY_SITES);
      
      let htmlContent, finalUrl, result;
      if (usePuppeteer) {
        result = await scrapeWithPuppeteer(url);
        htmlContent = result.htmlContent;
        finalUrl = result.finalUrl;
      } else {
        result = await scrapeWithCheerio(url);
        htmlContent = result.htmlContent;
        finalUrl = result.finalUrl;
      }

      // Extract all data from HTML
      const scrapedData = extractAllData(htmlContent, finalUrl);
      scrapedData.crawlDepth = depth;
      scrapedData.crawlOrder = scrapedPages.length + 1;
      
      // Add screenshot if available (only from Puppeteer)
      if (usePuppeteer && result.screenshot) {
        scrapedData.screenshot = result.screenshot;
      }
      
      scrapedPages.push(scrapedData);

      // Extract links for next level
      let links = [];
      if (depth < maxDepth) {
        links = extractLinksFromHtml(htmlContent, finalUrl, baseDomain, {
          sameDomain,
          includeSubdomains,
          followExternalLinks
        });

        // Add new links to queue
        links.forEach(link => {
          if (!visitedUrls.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        });

        console.log(`Found ${links.length} new links, ${queue.length} in queue`);
      }

      // Update progress after scraping
      if (onProgress) {
        onProgress(scrapedPages.length, maxPages, `Completed ${scrapedPages.length}/${maxPages} pages. ${queue.length} pages in queue.`, url);
      }

      // Delay between requests to be respectful
      if (delay > 0 && queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      // Continue with next URL even if this one fails
    }
  }

  console.log(`Crawl completed. Scraped ${scrapedPages.length} pages.`);

  // Final progress update
  if (onProgress) {
    onProgress(scrapedPages.length, maxPages, `Crawl completed! Scraped ${scrapedPages.length} pages.`, null);
  }

  // Calculate comprehensive summary statistics across all pages
  const summary = {
    totalLinks: scrapedPages.reduce((sum, page) => sum + (page.links?.length || 0), 0),
    totalImages: scrapedPages.reduce((sum, page) => sum + (page.images?.length || 0), 0),
    totalHeadings: scrapedPages.reduce((sum, page) => {
      if (!page.headings) return sum;
      return sum + Object.values(page.headings).reduce((s, arr) => s + arr.length, 0);
    }, 0),
    totalParagraphs: scrapedPages.reduce((sum, page) => sum + (page.paragraphs?.length || 0), 0),
    totalTables: scrapedPages.reduce((sum, page) => sum + (page.tables?.length || 0), 0),
    totalForms: scrapedPages.reduce((sum, page) => sum + (page.forms?.length || 0), 0),
    totalButtons: scrapedPages.reduce((sum, page) => sum + (page.buttons?.length || 0), 0),
    totalVideos: scrapedPages.reduce((sum, page) => sum + (page.videos?.length || 0), 0),
    totalScripts: scrapedPages.reduce((sum, page) => sum + (page.scripts?.length || 0), 0),
    totalStylesheets: scrapedPages.reduce((sum, page) => sum + (page.stylesheets?.length || 0), 0),
  };

  return {
    startUrl,
    totalPages: scrapedPages.length,
    pages: scrapedPages,
    visitedUrls: Array.from(visitedUrls),
    summary
  };
}

/**
 * Extract links from HTML content
 */
function extractLinksFromHtml(htmlContent, baseUrl, baseDomain, options = {}) {
  const { sameDomain, includeSubdomains, followExternalLinks } = options;
  const $ = cheerio.load(htmlContent);
  const links = new Set();

  $('a[href]').each((i, elem) => {
    try {
      const href = $(elem).attr('href');
      if (!href) return;

      // Skip javascript:, mailto:, tel:, etc.
      if (href.startsWith('javascript:') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          href.startsWith('#') ||
          href.startsWith('data:')) {
        return;
      }

      // Convert to absolute URL
      const absoluteUrl = toAbsoluteUrl(href, baseUrl);
      
      // Parse URL to check domain
      const urlObj = new URL(absoluteUrl);
      const urlDomain = urlObj.hostname;

      // Filter by domain
      if (sameDomain) {
        if (includeSubdomains) {
          const baseDomainParts = baseDomain.split('.');
          const urlDomainParts = urlDomain.split('.');
          const baseMain = baseDomainParts.slice(-2).join('.');
          const urlMain = urlDomainParts.slice(-2).join('.');
          
          if (baseMain !== urlMain && urlDomain !== baseDomain) {
            if (!followExternalLinks) {
              return; // Skip external links
            }
          }
        } else {
          if (urlDomain !== baseDomain) {
            if (!followExternalLinks) {
              return; // Skip external links
            }
          }
        }
      }

      // Remove fragments and query params for comparison (optional)
      const cleanUrl = urlObj.origin + urlObj.pathname;
      links.add(absoluteUrl);

    } catch (e) {
      // Invalid URL, skip
      console.log(`Invalid link found: ${href}`);
    }
  });

  return Array.from(links);
}

module.exports = {
  crawlWebsite
};

