const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./server/config");
const { handleScrape } = require("./server/routes/scrape");
const { handleCustomSelectors } = require("./server/routes/custom");
const { handleCompare } = require("./server/routes/compare");
const {
  handleCrawl,
  handleCrawlProgress,
  handleCrawlResult,
} = require("./server/routes/crawl");
const {
  getProxyStats,
  checkProxyHealth,
  addProxy,
  removeProxy,
  resetProxies,
} = require("./server/routes/proxy");
const {
  exportToExcel,
  exportToPDF,
  batchExportToExcel,
} = require("./server/routes/export");

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());

// Higher limit specifically for export routes (must be BEFORE default body parser)
const exportBodyParser = express.json({ limit: "100mb" });
app.post("/api/export/excel", exportBodyParser, exportToExcel);
app.post("/api/export/pdf", exportBodyParser, exportToPDF);
app.post("/api/export/batch-excel", exportBodyParser, batchExportToExcel);

// Default body parser with smaller limit for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from dist (React build) in production
// In development, Vite dev server handles this
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
}

// API Routes
app.post("/api/scrape", handleScrape);
app.post("/api/scrape/custom", handleCustomSelectors);
app.post("/api/crawl", handleCrawl);
app.get("/api/crawl/progress", handleCrawlProgress);
app.get("/api/crawl/result", handleCrawlResult);
app.post("/api/compare", handleCompare);

// Proxy management routes
app.get("/api/proxy/stats", getProxyStats);
app.get("/api/proxy/health", checkProxyHealth);
app.post("/api/proxy/add", addProxy);
app.post("/api/proxy/remove", removeProxy);
app.post("/api/proxy/reset", resetProxies);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

// Serve frontend (only in production, dev uses Vite)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Start the server with error handling for port conflicts
const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log("For frontend, run: npm run dev:frontend");
});

// Handle port already in use error
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${PORT} is already in use!`);
    console.error(`\nProbeer een van de volgende oplossingen:`);
    console.error(`1. Stop het proces dat poort ${PORT} gebruikt:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   Dan: taskkill /PID <PID> /F`);
    console.error(`2. Of gebruik een andere poort door PORT=<poort> npm start`);
    console.error(`\nVoorbeeld: PORT=3002 npm start\n`);
    process.exit(1);
  } else {
    throw error;
  }
});
