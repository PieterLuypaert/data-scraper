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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Extract title
    const title = $('title').text() || 'No title';

    // Extract all text content
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract all links
    const links = [];
    $('a').each((i, elem) => {
      const text = $(elem).text().trim();
      const href = $(elem).attr('href');
      if (text && href) {
        // Convert relative URLs to absolute
        let absoluteUrl = href;
        try {
          absoluteUrl = new URL(href, url).href;
        } catch (e) {
          // If URL construction fails, use original href
        }
        links.push({ text, href: absoluteUrl });
      }
    });

    // Extract images
    const images = [];
    $('img').each((i, elem) => {
      const alt = $(elem).attr('alt') || '';
      let src = $(elem).attr('src') || $(elem).attr('data-src') || '';
      if (src) {
        // Convert relative URLs to absolute
        try {
          src = new URL(src, url).href;
        } catch (e) {
          // If URL construction fails, use original src
        }
        images.push({ alt, src });
      }
    });

    // Extract meta tags
    const metaTags = {};
    $('meta').each((i, elem) => {
      const name = $(elem).attr('name') || $(elem).attr('property') || $(elem).attr('itemprop');
      const content = $(elem).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });

    // Extract headings
    const headings = {
      h1: [],
      h2: [],
      h3: []
    };
    $('h1').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.h1.push(text);
    });
    $('h2').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.h2.push(text);
    });
    $('h3').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) headings.h3.push(text);
    });

    const scrapedData = {
      title,
      url: response.request.res.responseUrl || url,
      metaTags,
      headings,
      links: links.slice(0, 50), // Limit to first 50 links
      images: images.slice(0, 20), // Limit to first 20 images
      textPreview: bodyText.substring(0, 1000) // First 1000 characters
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

