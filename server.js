const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist (React build) in production
// In development, Vite dev server handles this
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

// Helper function to convert relative URLs to absolute
function toAbsoluteUrl(href, baseUrl) {
  if (!href) return '';
  try {
    return new URL(href, baseUrl).href;
  } catch (e) {
    return href;
  }
}

// Helper function to extract all attributes from an element
function extractAttributes($, elem) {
  const attrs = {};
  if (elem.attribs) {
    Object.keys(elem.attribs).forEach(key => {
      attrs[key] = elem.attribs[key];
    });
  }
  return attrs;
}

// Web scraping endpoint
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

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
    const domain = new URL(url).hostname.toLowerCase();
    
    // List of sites that typically require JavaScript rendering
    const jsHeavySites = ['bol.com', 'amazon', 'coolblue', 'mediamarkt', 'wehkamp', 'zalando'];
    const needsPuppeteer = jsHeavySites.some(site => domain.includes(site));
    
    if (needsPuppeteer) {
      // Use Puppeteer for JavaScript-heavy sites
      console.log(`Using Puppeteer for ${domain} - URL: ${url}`);
      let browser;
      try {
        console.log('Launching Puppeteer browser...');
        browser = await puppeteer.launch({
          headless: true,
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
        });
        
        console.log('Browser launched, creating new page...');
        const page = await browser.newPage();
        
        // Remove webdriver property to avoid detection
        await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
          });
          // Remove other automation indicators
          delete window.chrome;
          window.chrome = { runtime: {} };
        });
        
        // Set realistic viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Set additional headers to look more like a real browser
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        });
        
        console.log(`Navigating to ${url}...`);
        // Navigate to the page and wait for content to load
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 45000
        });
        
        console.log('Page loaded, waiting for dynamic content...');
        // Wait a bit for dynamic content
        await page.waitForTimeout(3000);
        
        // Try to wait for common content selectors
        try {
          await page.waitForSelector('body', { timeout: 5000 });
          console.log('Body selector found');
        } catch (e) {
          console.log('Body selector not found, continuing anyway');
        }
        
        // Get the final URL after redirects
        finalUrl = page.url();
        console.log(`Final URL: ${finalUrl}`);
        
        // Get the HTML content
        htmlContent = await page.content();
        console.log(`HTML content length: ${htmlContent.length} characters`);
        
        await browser.close();
        console.log('Browser closed successfully');
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
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
          finalUrl = response.request.res.responseUrl || url;
          htmlContent = response.data;
          console.log('Fallback axios request successful');
        } catch (axiosError) {
          // If both fail, throw the original Puppeteer error
          throw new Error(errorMsg);
        }
      }
    } else {
      // Use axios for simpler sites
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      
      finalUrl = response.request.res.responseUrl || url;
      htmlContent = response.data;
    }

    let $;
    try {
      $ = cheerio.load(htmlContent, {
        decodeEntities: false,
        normalizeWhitespace: false
      });
    } catch (e) {
      console.error('Error loading HTML with cheerio:', e);
      throw new Error(`Failed to parse HTML: ${e.message}`);
    }

    // ========== BASIC INFORMATION ==========
    let title, description, lang, charset;
    try {
      title = $('title').text().trim() || 'No title';
    } catch (e) {
      console.error('Error getting title:', e);
      title = 'No title';
    }
    
    try {
      description = $('meta[name="description"]').attr('content') || '';
    } catch (e) {
      console.error('Error getting description:', e);
      description = '';
    }
    
    try {
      lang = $('html').attr('lang') || $('html').attr('xml:lang') || '';
    } catch (e) {
      console.error('Error getting lang:', e);
      lang = '';
    }
    
    try {
      charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';
    } catch (e) {
      console.error('Error getting charset:', e);
      charset = '';
    }

    // ========== META TAGS (ALL TYPES) ==========
    const metaTags = {};
    const openGraphTags = {};
    const twitterTags = {};
    const schemaTags = [];

    try {
      $('meta').each((i, elem) => {
      const name = $(elem).attr('name');
      const property = $(elem).attr('property');
      const itemprop = $(elem).attr('itemprop');
      const httpEquiv = $(elem).attr('http-equiv');
      const content = $(elem).attr('content');

      if (property && property.startsWith('og:')) {
        openGraphTags[property] = content;
      } else if (name && name.startsWith('twitter:')) {
        twitterTags[name] = content;
      } else if (name) {
        metaTags[name] = content;
      } else if (property) {
        metaTags[property] = content;
      } else if (itemprop) {
        metaTags[itemprop] = content;
      } else if (httpEquiv) {
        metaTags[httpEquiv] = content;
      }
    });
    } catch (e) {
      console.error('Error extracting meta tags:', e);
    }

    // Extract JSON-LD structured data
    $('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const jsonData = JSON.parse($(elem).html());
        schemaTags.push(jsonData);
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    // Extract microdata
    const microdata = [];
    $('[itemscope]').each((i, elem) => {
      const item = {
        type: $(elem).attr('itemtype') || '',
        properties: {}
      };
      $(elem).find('[itemprop]').each((j, prop) => {
        const propName = $(prop).attr('itemprop');
        const propValue = $(prop).text().trim() || $(prop).attr('content') || '';
        if (propName) {
          item.properties[propName] = propValue;
        }
      });
      microdata.push(item);
    });

    // ========== HEADINGS (ALL LEVELS) ==========
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      $(tag).each((i, elem) => {
        const text = $(elem).text().trim();
        const id = $(elem).attr('id') || '';
        const className = $(elem).attr('class') || '';
        if (text) {
          headings[tag].push({
            text,
            id,
            className,
            attributes: extractAttributes($, elem)
          });
        }
      });
    });

    // ========== LINKS (ALL DETAILS) ==========
    const links = [];
    $('a').each((i, elem) => {
      const text = $(elem).text().trim();
      const href = $(elem).attr('href');
      const title = $(elem).attr('title') || '';
      const rel = $(elem).attr('rel') || '';
      const target = $(elem).attr('target') || '';
      const id = $(elem).attr('id') || '';
      const className = $(elem).attr('class') || '';
      const download = $(elem).attr('download') || '';
      const hreflang = $(elem).attr('hreflang') || '';

      if (href) {
        links.push({
          text: text || href,
          href: toAbsoluteUrl(href, finalUrl),
          title,
          rel,
          target,
          id,
          className,
          download,
          hreflang,
          attributes: extractAttributes($, elem)
        });
      }
    });

    // ========== IMAGES (ALL DETAILS) ==========
    const images = [];
    $('img').each((i, elem) => {
      const alt = $(elem).attr('alt') || '';
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src') || '';
      const srcset = $(elem).attr('srcset') || '';
      const title = $(elem).attr('title') || '';
      const width = $(elem).attr('width') || '';
      const height = $(elem).attr('height') || '';
      const loading = $(elem).attr('loading') || '';
      const id = $(elem).attr('id') || '';
      const className = $(elem).attr('class') || '';

      if (src) {
        images.push({
          alt,
          src: toAbsoluteUrl(src, finalUrl),
          srcset,
          title,
          width,
          height,
          loading,
          id,
          className,
          attributes: extractAttributes($, elem)
        });
      }
    });

    // ========== PARAGRAPHS ==========
    const paragraphs = [];
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      const id = $(elem).attr('id') || '';
      const className = $(elem).attr('class') || '';
      if (text) {
        paragraphs.push({
          text,
          id,
          className,
          attributes: extractAttributes($, elem)
        });
      }
    });

    // ========== LISTS ==========
    const lists = {
      unordered: [],
      ordered: []
    };

    $('ul').each((i, elem) => {
      const items = [];
      $(elem).find('li').each((j, li) => {
        const text = $(li).text().trim();
        const id = $(li).attr('id') || '';
        const className = $(li).attr('class') || '';
        if (text) {
          items.push({ text, id, className });
        }
      });
      if (items.length > 0) {
        lists.unordered.push({
          id: $(elem).attr('id') || '',
          className: $(elem).attr('class') || '',
          items
        });
      }
    });

    $('ol').each((i, elem) => {
      const items = [];
      $(elem).find('li').each((j, li) => {
        const text = $(li).text().trim();
        const id = $(li).attr('id') || '';
        const className = $(li).attr('class') || '';
        if (text) {
          items.push({ text, id, className });
        }
      });
      if (items.length > 0) {
        lists.ordered.push({
          id: $(elem).attr('id') || '',
          className: $(elem).attr('class') || '',
          items
        });
      }
    });

    // ========== TABLES ==========
    const tables = [];
    $('table').each((i, elem) => {
      const table = {
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        caption: $('caption', elem).text().trim() || '',
        headers: [],
        rows: []
      };

      // Extract headers
      $('thead th, tr:first-child th, tr:first-child td', elem).each((j, th) => {
        const text = $(th).text().trim();
        if (text) table.headers.push(text);
      });

      // Extract rows
      $('tbody tr, tr', elem).each((j, tr) => {
        const row = [];
        $(tr).find('td, th').each((k, td) => {
          const text = $(td).text().trim();
          row.push(text);
        });
        if (row.length > 0) table.rows.push(row);
      });

      if (table.headers.length > 0 || table.rows.length > 0) {
        tables.push(table);
      }
    });

    // ========== FORMS ==========
    const forms = [];
    $('form').each((i, elem) => {
      const form = {
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        action: $(elem).attr('action') || '',
        method: $(elem).attr('method') || 'get',
        enctype: $(elem).attr('enctype') || '',
        inputs: [],
        buttons: [],
        selects: [],
        textareas: []
      };

      // Extract inputs
      $(elem).find('input').each((j, input) => {
        form.inputs.push({
          type: $(input).attr('type') || 'text',
          name: $(input).attr('name') || '',
          id: $(input).attr('id') || '',
          placeholder: $(input).attr('placeholder') || '',
          value: $(input).attr('value') || '',
          required: $(input).attr('required') !== undefined,
          attributes: extractAttributes($, input)
        });
      });

      // Extract selects
      $(elem).find('select').each((j, select) => {
        const options = [];
        $(select).find('option').each((k, option) => {
          options.push({
            value: $(option).attr('value') || '',
            text: $(option).text().trim(),
            selected: $(option).attr('selected') !== undefined
          });
        });
        form.selects.push({
          name: $(select).attr('name') || '',
          id: $(select).attr('id') || '',
          options
        });
      });

      // Extract textareas
      $(elem).find('textarea').each((j, textarea) => {
        form.textareas.push({
          name: $(textarea).attr('name') || '',
          id: $(textarea).attr('id') || '',
          placeholder: $(textarea).attr('placeholder') || '',
          rows: $(textarea).attr('rows') || '',
          cols: $(textarea).attr('cols') || '',
          value: $(textarea).text().trim()
        });
      });

      // Extract buttons
      $(elem).find('button, input[type="submit"], input[type="button"]').each((j, btn) => {
        form.buttons.push({
          type: $(btn).attr('type') || 'button',
          text: $(btn).text().trim() || $(btn).attr('value') || '',
          id: $(btn).attr('id') || '',
          className: $(btn).attr('class') || ''
        });
      });

      forms.push(form);
    });

    // ========== BUTTONS (STANDALONE) ==========
    const buttons = [];
    // Use a safer selector - find all buttons and filter out those inside forms
    $('button').each((i, elem) => {
      // Skip buttons that are inside a form
      if ($(elem).closest('form').length > 0) {
        return;
      }
      buttons.push({
        text: $(elem).text().trim(),
        type: $(elem).attr('type') || 'button',
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== VIDEOS ==========
    const videos = [];
    $('video').each((i, elem) => {
      videos.push({
        src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
        poster: toAbsoluteUrl($(elem).attr('poster') || '', finalUrl),
        width: $(elem).attr('width') || '',
        height: $(elem).attr('height') || '',
        controls: $(elem).attr('controls') !== undefined,
        autoplay: $(elem).attr('autoplay') !== undefined,
        loop: $(elem).attr('loop') !== undefined,
        muted: $(elem).attr('muted') !== undefined,
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== AUDIO ==========
    const audios = [];
    $('audio').each((i, elem) => {
      audios.push({
        src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
        controls: $(elem).attr('controls') !== undefined,
        autoplay: $(elem).attr('autoplay') !== undefined,
        loop: $(elem).attr('loop') !== undefined,
        muted: $(elem).attr('muted') !== undefined,
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== IFRAMES ==========
    const iframes = [];
    $('iframe').each((i, elem) => {
      iframes.push({
        src: toAbsoluteUrl($(elem).attr('src') || '', finalUrl),
        title: $(elem).attr('title') || '',
        width: $(elem).attr('width') || '',
        height: $(elem).attr('height') || '',
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== SCRIPTS ==========
    const scripts = [];
    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      const type = $(elem).attr('type') || 'text/javascript';
      const content = $(elem).html() || '';
      
      scripts.push({
        src: src ? toAbsoluteUrl(src, finalUrl) : null,
        type,
        inline: !src,
        contentLength: content.length,
        attributes: extractAttributes($, elem)
      });
    });

    // ========== STYLESHEETS ==========
    const stylesheets = [];
    $('link[rel="stylesheet"], style').each((i, elem) => {
      if ($(elem).is('style')) {
        stylesheets.push({
          type: 'inline',
          contentLength: $(elem).html().length,
          id: $(elem).attr('id') || '',
          attributes: extractAttributes($, elem)
        });
      } else {
        stylesheets.push({
          type: 'external',
          href: toAbsoluteUrl($(elem).attr('href') || '', finalUrl),
          media: $(elem).attr('media') || 'all',
          attributes: extractAttributes($, elem)
        });
      }
    });

    // ========== SVG ==========
    const svgs = [];
    $('svg').each((i, elem) => {
      svgs.push({
        viewBox: $(elem).attr('viewBox') || '',
        width: $(elem).attr('width') || '',
        height: $(elem).attr('height') || '',
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        content: $(elem).html() || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== CANVAS ==========
    const canvases = [];
    $('canvas').each((i, elem) => {
      canvases.push({
        width: $(elem).attr('width') || '',
        height: $(elem).attr('height') || '',
        id: $(elem).attr('id') || '',
        className: $(elem).attr('class') || '',
        attributes: extractAttributes($, elem)
      });
    });

    // ========== ALL DATA ATTRIBUTES ==========
    const dataAttributes = [];
    // Use * selector and filter manually since [data-*] is not valid CSS
    $('*').each((i, elem) => {
      const dataAttrs = {};
      Object.keys(elem.attribs || {}).forEach(key => {
        if (key.startsWith('data-')) {
          dataAttrs[key] = elem.attribs[key];
        }
      });
      if (Object.keys(dataAttrs).length > 0) {
        dataAttributes.push({
          element: elem.tagName || '',
          id: $(elem).attr('id') || '',
          className: $(elem).attr('class') || '',
          dataAttributes: dataAttrs
        });
      }
    });

    // ========== ALL CLASSES AND IDS ==========
    const allClasses = new Set();
    const allIds = new Set();
    $('[class]').each((i, elem) => {
      const classes = $(elem).attr('class').split(/\s+/).filter(c => c);
      classes.forEach(c => allClasses.add(c));
    });
    $('[id]').each((i, elem) => {
      const id = $(elem).attr('id');
      if (id) allIds.add(id);
    });

    // ========== COMMENTS ==========
    const comments = [];
    $('*').contents().each((i, node) => {
      if (node.type === 'comment') {
        comments.push(node.data.trim());
      }
    });

    // ========== TEXT CONTENT ==========
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const fullText = $('html').text().replace(/\s+/g, ' ').trim();

    // ========== ALL ELEMENTS COUNT ==========
    const elementCounts = {};
    $('*').each((i, elem) => {
      const tag = elem.tagName?.toLowerCase();
      if (tag) {
        elementCounts[tag] = (elementCounts[tag] || 0) + 1;
      }
    });

    // ========== FAVICON ==========
    const favicons = [];
    $('link[rel*="icon"]').each((i, elem) => {
      favicons.push({
        rel: $(elem).attr('rel') || '',
        href: toAbsoluteUrl($(elem).attr('href') || '', finalUrl),
        sizes: $(elem).attr('sizes') || '',
        type: $(elem).attr('type') || ''
      });
    });

    // ========== CONTACT INFO EXTRACTION ==========
    const allTextForContact = [
      title,
      description,
      bodyText,
      ...links.map(l => l.text || l.href || ''),
      ...paragraphs.map(p => typeof p === 'string' ? p : p.text || ''),
      ...Object.values(metaTags),
      ...Object.values(openGraphTags),
      ...Object.values(twitterTags)
    ].join(' ');

    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = [...new Set((allTextForContact.match(emailRegex) || []))];

    // Extract phone numbers
    const phonePatterns = [
      /\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
      /0\d{1,2}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g
    ];
    const phones = new Set();
    phonePatterns.forEach(pattern => {
      const matches = allTextForContact.match(pattern) || [];
      matches.forEach(match => {
        const digits = match.replace(/\D/g, '');
        if (digits.length >= 7 && digits.length <= 15) {
          phones.add(match.trim());
        }
      });
    });

    // Extract social media links
    const socialMedia = {
      facebook: links.filter(l => l.href?.toLowerCase().includes('facebook.com')),
      twitter: links.filter(l => l.href?.toLowerCase().includes('twitter.com') || l.href?.toLowerCase().includes('x.com')),
      linkedin: links.filter(l => l.href?.toLowerCase().includes('linkedin.com')),
      instagram: links.filter(l => l.href?.toLowerCase().includes('instagram.com')),
      youtube: links.filter(l => l.href?.toLowerCase().includes('youtube.com') || l.href?.toLowerCase().includes('youtu.be')),
      github: links.filter(l => l.href?.toLowerCase().includes('github.com'))
    };

    // ========== E-COMMERCE DATA EXTRACTION ==========
    const ecommerceData = {
      products: [],
      prices: [],
      reviews: []
    };

    // Try to find product names (common patterns)
    const productPatterns = [
      /product[:\s]+([^\n<]+)/gi,
      /item[:\s]+([^\n<]+)/gi,
      /name[:\s]+([^\n<]+)/gi
    ];

    // Extract prices
    const pricePatterns = [
      /€\s*(\d+[.,]\d{2})/g,
      /\$\s*(\d+[.,]\d{2})/g,
      /(\d+[.,]\d{2})\s*€/g,
      /price[:\s]+([€$]?\s*\d+[.,]?\d*)/gi
    ];
    const prices = new Set();
    pricePatterns.forEach(pattern => {
      const matches = allTextForContact.match(pattern) || [];
      matches.forEach(match => prices.add(match.trim()));
    });

    // ========== RSS & SITEMAP DETECTION ==========
    const rssFeeds = [];
    const sitemaps = [];
    
    $('link[type="application/rss+xml"], link[rel="alternate"][type="application/rss+xml"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) rssFeeds.push(toAbsoluteUrl(href, finalUrl));
    });

    // Check for sitemap in robots.txt or meta
    if (metaTags['robots']?.includes('sitemap') || links.some(l => l.href?.includes('sitemap'))) {
      links.forEach(link => {
        if (link.href?.toLowerCase().includes('sitemap')) {
          sitemaps.push(link.href);
        }
      });
    }

    // ========== LANGUAGE DETECTION ==========
    const detectLanguage = (text) => {
      if (!text || text.length < 10) return { language: 'Unknown', code: 'unknown', confidence: 0 };
      
      const patterns = {
        nl: ['de', 'het', 'een', 'van', 'in', 'is', 'op', 'te', 'voor', 'dat', 'met', 'die', 'aan', 'bij'],
        en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on'],
        fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour'],
        de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des']
      };

      const textLower = text.toLowerCase();
      const scores = {};
      
      Object.keys(patterns).forEach(lang => {
        let score = 0;
        patterns[lang].forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = textLower.match(regex);
          if (matches) score += matches.length;
        });
        scores[lang] = score;
      });

      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const topLang = sorted[0];
      const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
      const confidence = totalScore > 0 ? Math.round((topLang[1] / totalScore) * 100) : 0;

      const names = { nl: 'Nederlands', en: 'English', fr: 'Français', de: 'Deutsch' };
      return {
        language: names[topLang[0]] || topLang[0],
        code: topLang[0],
        confidence
      };
    };

    const detectedLanguage = detectLanguage(bodyText);

    // ========== CONTENT TYPE DETECTION ==========
    const allTextLower = (title + ' ' + bodyText + ' ' + Object.values(metaTags).join(' ')).toLowerCase();
    const contentType = {
      isBlog: allTextLower.includes('blog') || allTextLower.includes('post') || allTextLower.includes('article'),
      isNews: allTextLower.includes('news') || allTextLower.includes('breaking') || metaTags['og:type'] === 'article',
      isEcommerce: allTextLower.includes('shop') || allTextLower.includes('cart') || allTextLower.includes('buy') || allTextLower.includes('price') || prices.size > 0,
      isPortfolio: allTextLower.includes('portfolio') || allTextLower.includes('projects') || images.length > 10,
      isCorporate: allTextLower.includes('about us') || allTextLower.includes('contact') || allTextLower.includes('services')
    };

    const primaryType = contentType.isBlog ? 'Blog' :
                        contentType.isNews ? 'News' :
                        contentType.isEcommerce ? 'E-commerce' :
                        contentType.isPortfolio ? 'Portfolio' :
                        contentType.isCorporate ? 'Corporate' : 'Unknown';

    // ========== CONTENT ANALYSIS ==========
    const words = bodyText.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    const mostCommonWords = Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Readability calculation
    const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const wordCountTotal = words.length;
    const avgSentenceLength = sentences > 0 ? wordCountTotal / sentences : 0;
    const readability = {
      sentences,
      words: wordCountTotal,
      avgSentenceLength: avgSentenceLength.toFixed(2),
      estimatedReadingTime: Math.ceil(wordCountTotal / 200)
    };

    // ========== SENTIMENT ANALYSIS ==========
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect', 'love', 'like', 'happy', 'goed', 'geweldig', 'fantastisch'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusting', 'slecht', 'vreselijk', 'verschrikkelijk'];
    const textLower = bodyText.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) positiveCount += matches.length;
    });
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches) negativeCount += matches.length;
    });
    const totalSentiment = positiveCount + negativeCount;
    const sentimentScore = totalSentiment > 0 ? ((positiveCount - negativeCount) / totalSentiment) * 100 : 0;
    const sentiment = sentimentScore > 20 ? 'positive' : sentimentScore < -20 ? 'negative' : 'neutral';

    // ========== COMPILE ALL DATA ==========
    const scrapedData = {
      // Basic info
      title,
      description,
      url: finalUrl,
      lang: lang || detectedLanguage.code,
      charset,
      
      // Meta tags
      metaTags,
      openGraphTags,
      twitterTags,
      schemaTags,
      microdata,
      
      // Content structure
      headings,
      paragraphs,
      lists,
      tables,
      
      // Media
      images,
      videos,
      audios,
      iframes,
      svgs,
      canvases,
      favicons,
      
      // Interactive elements
      links,
      forms,
      buttons,
      
      // Scripts and styles
      scripts,
      stylesheets,
      
      // Data attributes
      dataAttributes,
      
      // Classes and IDs
      allClasses: Array.from(allClasses),
      allIds: Array.from(allIds),
      
      // Comments
      comments,
      
      // Text content
      textPreview: bodyText.substring(0, 2000),
      fullText: fullText.substring(0, 10000), // Limit to prevent huge responses
      
      // Contact information
      contactInfo: {
        emails: emails,
        phoneNumbers: Array.from(phones),
        socialMedia: socialMedia
      },
      
      // E-commerce data
      ecommerce: {
        hasProducts: ecommerceData.products.length > 0,
        prices: Array.from(prices),
        priceCount: prices.size
      },
      
      // RSS & Sitemap
      rssFeeds: rssFeeds,
      sitemaps: sitemaps,
      
      // Language detection
      languageDetection: detectedLanguage,
      
      // Content type
      contentType: {
        ...contentType,
        primaryType: primaryType
      },
      
      // Content analysis
      contentAnalysis: {
        mostCommonWords: mostCommonWords,
        readability: readability,
        wordCount: wordCountTotal,
        characterCount: bodyText.length
      },
      
      // Sentiment analysis
      sentiment: {
        sentiment: sentiment,
        score: Math.round(sentimentScore),
        positive: positiveCount,
        negative: negativeCount
      },
      
      // Statistics
      elementCounts,
      statistics: {
        totalLinks: links.length,
        totalImages: images.length,
        totalHeadings: Object.values(headings).reduce((sum, arr) => sum + arr.length, 0),
        totalParagraphs: paragraphs.length,
        totalTables: tables.length,
        totalForms: forms.length,
        totalButtons: buttons.length,
        totalVideos: videos.length,
        totalAudios: audios.length,
        totalIframes: iframes.length,
        totalScripts: scripts.length,
        totalStylesheets: stylesheets.length,
        totalSVGs: svgs.length,
        totalCanvases: canvases.length,
        totalDataAttributes: dataAttributes.length,
        totalComments: comments.length,
        totalClasses: allClasses.size,
        totalIds: allIds.size,
        totalEmails: emails.length,
        totalPhones: phones.size
      }
    };

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
});

// Serve frontend (only in production, dev uses Vite)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Custom CSS selector endpoint
app.post('/api/scrape/custom', async (req, res) => {
  try {
    const { url, selectors } = req.body;

    if (!url || !selectors || !Array.isArray(selectors)) {
      return res.status(400).json({ success: false, error: 'URL and selectors array are required' });
    }
    
    // Use same logic as main scrape endpoint
    let htmlContent, finalUrl;
    const domain = new URL(url).hostname.toLowerCase();
    const jsHeavySites = ['bol.com', 'amazon', 'coolblue', 'mediamarkt', 'wehkamp', 'zalando'];
    const needsPuppeteer = jsHeavySites.some(site => domain.includes(site));
    
    if (needsPuppeteer) {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        });
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(2000);
        finalUrl = page.url();
        htmlContent = await page.content();
        await browser.close();
      } catch (puppeteerError) {
        await browser.close();
        throw puppeteerError;
      }
    } else {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      finalUrl = response.request.res.responseUrl || url;
      htmlContent = response.data;
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
        // Remove invalid characters that could cause parsing errors
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
});

// Change detection endpoint
app.post('/api/compare', async (req, res) => {
  const { oldData, newData } = req.body;

  if (!oldData || !newData) {
    return res.status(400).json({ error: 'Both oldData and newData are required' });
  }

  try {
    // Use the compareScrapes function logic
    const changes = {
      added: {},
      removed: {},
      modified: {},
      statistics: {
        totalChanges: 0,
        additions: 0,
        removals: 0,
        modifications: 0
      }
    };

    // Compare title
    if (oldData.title !== newData.title) {
      changes.modified.title = { old: oldData.title, new: newData.title };
      changes.statistics.modifications++;
    }

    // Compare links
    const oldLinks = oldData.links || [];
    const newLinks = newData.links || [];
    const addedLinks = newLinks.filter(nl => !oldLinks.some(ol => (ol.href || ol) === (nl.href || nl)));
    const removedLinks = oldLinks.filter(ol => !newLinks.some(nl => (ol.href || ol) === (nl.href || nl)));
    
    if (addedLinks.length > 0) {
      changes.added.links = addedLinks;
      changes.statistics.additions += addedLinks.length;
    }
    if (removedLinks.length > 0) {
      changes.removed.links = removedLinks;
      changes.statistics.removals += removedLinks.length;
    }

    // Compare images
    const oldImages = oldData.images || [];
    const newImages = newData.images || [];
    const addedImages = newImages.filter(ni => !oldImages.some(oi => (oi.src || oi) === (ni.src || ni)));
    const removedImages = oldImages.filter(oi => !newImages.some(ni => (oi.src || oi) === (ni.src || ni)));
    
    if (addedImages.length > 0) {
      changes.added.images = addedImages;
      changes.statistics.additions += addedImages.length;
    }
    if (removedImages.length > 0) {
      changes.removed.images = removedImages;
      changes.statistics.removals += removedImages.length;
    }

    // Compare text
    const oldText = oldData.textPreview || oldData.fullText || '';
    const newText = newData.textPreview || newData.fullText || '';
    if (oldText !== newText) {
      changes.modified.text = {
        oldLength: oldText.length,
        newLength: newText.length,
        similarity: calculateSimilarity(oldText, newText)
      };
      changes.statistics.modifications++;
    }

    changes.statistics.totalChanges = 
      changes.statistics.additions + 
      changes.statistics.removals + 
      changes.statistics.modifications;

    res.json({
      success: true,
      changes
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to compare scrapes',
      message: error.message
    });
  }
});

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(`For frontend, run: npm run dev:frontend`);
});
