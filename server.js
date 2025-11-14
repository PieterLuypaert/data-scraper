const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./server/config');
const { handleScrape } = require('./server/routes/scrape');
const { handleCustomSelectors } = require('./server/routes/custom');
const { handleCompare } = require('./server/routes/compare');
const { handleCrawl, handleCrawlProgress, handleCrawlResult } = require('./server/routes/crawl');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist (React build) in production
// In development, Vite dev server handles this
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

// API Routes
app.post('/api/scrape', handleScrape);
app.post('/api/scrape/custom', handleCustomSelectors);
app.post('/api/crawl', handleCrawl);
app.get('/api/crawl/progress', handleCrawlProgress);
app.get('/api/crawl/result', handleCrawlResult);
app.post('/api/compare', handleCompare);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Serve frontend (only in production, dev uses Vite)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log('For frontend, run: npm run dev:frontend');
});
