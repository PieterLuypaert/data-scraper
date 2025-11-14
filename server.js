const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
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
    // Fetch the HTML content
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    const finalUrl = response.request.res.responseUrl || url;
    const $ = cheerio.load(response.data);

    // ========== BASIC INFORMATION ==========
    const title = $('title').text().trim() || 'No title';
    const description = $('meta[name="description"]').attr('content') || '';
    const lang = $('html').attr('lang') || $('html').attr('xml:lang') || '';
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';

    // ========== META TAGS (ALL TYPES) ==========
    const metaTags = {};
    const openGraphTags = {};
    const twitterTags = {};
    const schemaTags = [];

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
    $('button:not(form button)').each((i, elem) => {
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
    $('[data-*]').each((i, elem) => {
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

    // ========== COMPILE ALL DATA ==========
    const scrapedData = {
      // Basic info
      title,
      description,
      url: finalUrl,
      lang,
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
        totalIds: allIds.size
      }
    };

    res.json({
      success: true,
      data: scrapedData
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape website',
      message: error.message 
    });
  }
});

// Serve frontend (only in production, dev uses Vite)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
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
