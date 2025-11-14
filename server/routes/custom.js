const { scrapeWithPuppeteer } = require('../scrapers/puppeteerScraper');
const { scrapeWithCheerio } = require('../scrapers/cheerioScraper');
const { needsPuppeteer } = require('../utils/helpers');
const { toAbsoluteUrl, extractAttributes } = require('../utils/helpers');
const config = require('../config');
const cheerio = require('cheerio');

/**
 * Custom CSS selector route handler
 */
async function handleCustomSelectors(req, res) {
  try {
    const { url, selectors } = req.body;

    if (!url || !selectors || !Array.isArray(selectors)) {
      return res.status(400).json({ success: false, error: 'URL and selectors array are required' });
    }
    
    // Use same logic as main scrape endpoint
    let htmlContent, finalUrl;
    const usePuppeteer = needsPuppeteer(url, config.JS_HEAVY_SITES);
    
    if (usePuppeteer) {
      const result = await scrapeWithPuppeteer(url);
      htmlContent = result.htmlContent;
      finalUrl = result.finalUrl;
    } else {
      const result = await scrapeWithCheerio(url);
      htmlContent = result.htmlContent;
      finalUrl = result.finalUrl;
    }

    const $ = cheerio.load(htmlContent);
    const results = {};

    selectors.forEach(selector => {
      try {
        const elements = [];
        const selectorString = selector.selector || selector;
        
        // Validate selector is not empty
        if (!selectorString || !selectorString.trim()) {
          results[selector.name || selectorString] = { error: 'Selector is leeg' };
          return;
        }

        // Validate selector syntax (basic check)
        const cleanedSelector = selectorString.trim();
        
        // Try to find elements with the selector
        let foundElements;
        try {
          foundElements = $(cleanedSelector);
        } catch (selectorError) {
          // If selector is invalid, return error
          results[selector.name || cleanedSelector] = { 
            error: `Ongeldige CSS selector: ${selectorError.message}`,
            selector: cleanedSelector
          };
          return;
        }
        
        if (foundElements.length === 0) {
          results[selector.name || selectorString] = [];
          return;
        }

        foundElements.each((i, elem) => {
          try {
            const $elem = $(elem);
            const tagName = elem.name || elem.tagName || '';
            let text = '';
            let html = '';
            const attrs = extractAttributes($, elem);
            
            // Get text content based on element type
            if (tagName === 'img') {
              // Special handling for images - try multiple src attributes
              const src = $elem.attr('src') || 
                         $elem.attr('data-src') || 
                         $elem.attr('data-lazy-src') || 
                         $elem.attr('data-original') ||
                         $elem.attr('data-image') ||
                         $elem.attr('data-img') ||
                         $elem.attr('srcset')?.split(',')[0]?.trim().split(' ')[0] ||
                         '';
              const alt = $elem.attr('alt') || $elem.attr('title') || '';
              const title = $elem.attr('title') || '';
              
              // Build display text
              text = alt || title || src || 'Afbeelding';
              html = $elem.toString();
              
              elements.push({
                text: text,
                html: html?.substring(0, 500),
                attributes: attrs,
                src: src ? toAbsoluteUrl(src, finalUrl) : null,
                alt: alt,
                title: title,
                index: i,
                tagName: tagName
              });
            } else if (tagName === 'meta') {
              // Special handling for meta tags
              const name = $elem.attr('name') || $elem.attr('property') || $elem.attr('itemprop') || $elem.attr('http-equiv') || '';
              const content = $elem.attr('content') || $elem.attr('value') || '';
              const property = $elem.attr('property') || '';
              const charset = $elem.attr('charset') || '';
              
              // Build display text
              let displayText = '';
              if (name) displayText = `${name}: ${content}`;
              else if (property) displayText = `${property}: ${content}`;
              else if (charset) displayText = `charset: ${charset}`;
              else displayText = content || 'Meta tag';
              
              html = $elem.toString();
              elements.push({
                text: displayText,
                html: html?.substring(0, 500),
                attributes: attrs,
                name: name || property,
                content: content || charset,
                property: property,
                charset: charset,
                index: i,
                tagName: tagName
              });
            } else if (tagName === 'a') {
              // Special handling for links
              const href = $elem.attr('href') || '';
              const linkText = $elem.text().trim();
              text = linkText || href;
              html = $elem.html() || '';
              elements.push({
                text: text,
                html: html?.substring(0, 500),
                attributes: attrs,
                href: href ? toAbsoluteUrl(href, finalUrl) : null,
                index: i,
                tagName: tagName
              });
            } else {
              // Default handling for other elements
              text = $elem.text().trim();
              html = $elem.html() || '';
              
              // If no text content, try to get value attribute
              if (!text && $elem.attr('value')) {
                text = $elem.attr('value');
              }
              
              // If still no text, try to get content attribute
              if (!text && $elem.attr('content')) {
                text = $elem.attr('content');
              }
              
              elements.push({
                text: text || '',
                html: html?.substring(0, 500),
                attributes: attrs,
                index: i,
                tagName: tagName
              });
            }
          } catch (elemError) {
            // Skip this element if there's an error processing it
            console.error(`Error processing element ${i}:`, elemError);
          }
        });
        
        results[selector.name || selectorString] = elements;
      } catch (error) {
        console.error(`Error with selector "${selector.selector || selector}":`, error);
        results[selector.name || selector.selector || 'unknown'] = { 
          error: error.message || 'Onbekende fout bij het uitvoeren van de selector',
          selector: selector.selector || selector
        };
      }
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Custom selector scraping error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to scrape with custom selectors';
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Check for specific error types
    if (error.message && error.message.includes('net::ERR')) {
      errorMessage = 'Network error: Kan niet verbinden met de website. Controleer of de URL correct is.';
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
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  handleCustomSelectors
};

